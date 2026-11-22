import React, {useEffect, useState} from 'react'
import axios from 'axios'
import Chart from 'react-apexcharts'
import './analytics.css'
import {AnalyticsPrivacy, fields, allFields} from './AnalyticsPrivacy'
import {AnalyticsAnswer, cleanAnalyticsAnswer} from './AnalyticsAnswer'
import {parseConversationsResponse, parseDashboardResponse, unwrapAnalyticsResponse} from './analyticsApi'
import {downloadAnalyticsWorkbook, isExcelRequest, isExportableAnswer} from './analyticsExcel'

type Tab = 'analisa' | 'dashboard' | 'privasi'
type Message = {role: 'user' | 'assistant'; content: string}
type Conversation = {id: number; title: string; created_at: string; messages: {role: string; content: string}[]}
type Template = {title: string; prompt: string}
const defaults: Template[] = [
  {title: 'Ringkasan transaksi bulanan', prompt: 'Ringkas jumlah dan nilai transaksi bulan ini serta bandingkan dengan bulan sebelumnya.'},
  {title: 'Durasi pekerjaan', prompt: 'Berapa rata-rata durasi pekerjaan bulan ini dan berapa jumlah data yang valid?'},
  {title: 'Ringkasan komplain', prompt: 'Ringkas jumlah komplain berdasarkan channel bulan ini.'},
]
const rupiah = (value: number) => 'Rp ' + new Intl.NumberFormat('id-ID', {maximumFractionDigits: 0}).format(value || 0)
const number = (value: number) => new Intl.NumberFormat('id-ID').format(value || 0)
const initialWidgets = ['monthly', 'statuses', 'stores']
const chartOptions: any = {chart: {toolbar: {show: false}, fontFamily: 'Poppins, sans-serif'}, colors: ['#1b3a8c', '#20c5e0', '#e3262f', '#f2a516', '#2f9e8f', '#8a5cc2', '#5f7894', '#6aa84f'], dataLabels: {enabled: false}, grid: {borderColor: '#e3e7ef'}, tooltip: {theme: 'light'}}

const DashboardAIAnalytics: React.FC = () => {
  const privacyKey = `analyticsAllowedFields:${localStorage.getItem('user_id') || localStorage.getItem('username') || 'user'}`
  const [allowedFields, setAllowedFields] = useState<string[]>(() => {try {const saved = JSON.parse(localStorage.getItem(privacyKey) || 'null'); return Array.isArray(saved) ? allFields.filter(key => saved.includes(key)) : fields} catch {return fields}})
  const changeAllowedFields = (next: string[]) => {setAllowedFields(next); localStorage.setItem(privacyKey, JSON.stringify(next))}
  const [tab, setTab] = useState<Tab>('analisa')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<number | undefined>()
  const [busy, setBusy] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState('')
  const [error, setError] = useState('')
  const [downloadNotice, setDownloadNotice] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [summaryError, setSummaryError] = useState('')
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState('all')
  const [recent, setRecent] = useState<Conversation[]>([])
  const [recentError, setRecentError] = useState('')
  const [section, setSection] = useState<'recent' | 'templates'>('recent')
  const [custom, setCustom] = useState<Template[]>(() => {try {return JSON.parse(localStorage.getItem('analyticsTemplates') || '[]')} catch {return []}})
  const [showTemplates, setShowTemplates] = useState(false)
  const [showWidgets, setShowWidgets] = useState(false)
  const [editing, setEditing] = useState(false)
  const [widgets, setWidgets] = useState<string[]>(() => {try {return JSON.parse(localStorage.getItem('analyticsWidgets') || 'null') || initialWidgets} catch {return initialWidgets}})
  const api = process.env.REACT_APP_API_URL
  const headers = {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}
  const user = localStorage.getItem('username') || ''
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam'
  const templates = [...defaults, ...custom]

  useEffect(() => {
    if (tab !== 'dashboard') return
    setLoading(true); setSummaryError('')
    const params = year === 'all' ? {} : {from: `${year}-01-01`, to: `${year}-12-31`}
    axios.get(`${api}/ai-agent/dashboard`, {headers, params}).then(({data}) => setSummary(parseDashboardResponse(data))).catch(() => {setSummary(null); setSummaryError('Data dashboard belum dapat dimuat. Periksa layanan AI Agent dan izin akses Anda.')}).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, year])

  const loadRecent = () => axios.get(`${api}/ai-agent/conversations`, {headers}).then(({data}) => {setRecent(parseConversationsResponse(data)); setRecentError('')}).catch(() => setRecentError('Riwayat belum dapat dimuat.'))
  useEffect(() => {if (tab === 'analisa') loadRecent(); /* eslint-disable-next-line react-hooks/exhaustive-deps */}, [tab])
  const saveWidgets = (next: string[]) => {setWidgets(next); localStorage.setItem('analyticsWidgets', JSON.stringify(next))}
  const saveTemplate = () => {
    if (!question.trim()) {setError('Tulis permintaan terlebih dahulu untuk menyimpannya sebagai template.'); return}
    const title = window.prompt('Nama template')?.trim()
    if (!title) return
    const next = [...custom, {title: title.slice(0, 80), prompt: question.trim()}]
    setCustom(next); localStorage.setItem('analyticsTemplates', JSON.stringify(next)); setError('')
  }
  const exportMessage = (index: number) => {
    const answer = messages[index]
    if (!answer || answer.role !== 'assistant' || !isExportableAnswer(answer.content)) return false
    const preceding = messages.slice(0, index).reverse().find(message => message.role === 'user')
    try {
      downloadAnalyticsWorkbook(preceding?.content || '', answer.content)
      setError(''); setDownloadNotice('Data Excel diunduh dari hasil analisa yang ditampilkan.')
      return true
    } catch {
      setDownloadNotice(''); setError('Data terstruktur tidak ditemukan dalam laporan ini sehingga Excel tidak dapat dibuat.')
      return false
    }
  }
  const send = async () => {
    const text = question.trim()
    if (!text || busy) return
    if (isExcelRequest(text)) {
      const lastAnswer = messages.map(message => message.role === 'assistant' && isExportableAnswer(message.content)).lastIndexOf(true)
      if (lastAnswer < 0) {setError('Belum ada hasil analisa untuk diunduh. Buat atau buka laporan terlebih dahulu.'); return}
      if (exportMessage(lastAnswer)) setQuestion('')
      return
    }
    setDownloadNotice(''); setQuestion(''); setError(''); setPendingQuestion(text); setBusy(true)
    try {
      const {data} = await axios.post(`${api}/ai-agent/chat`, {question: text, conversation_id: conversationId, allowed_fields: allowedFields}, {headers})
      const result = unwrapAnalyticsResponse(data)
      const answer = result?.answer || result?.content
      if (typeof answer !== 'string') throw new Error('Format jawaban tidak dikenali')
      setConversationId(result.conversation_id || result.conversationId)
      setMessages(current => [...current, {role: 'user', content: text}, {role: 'assistant', content: cleanAnalyticsAnswer(answer)}]); loadRecent()
    } catch (e: any) {
      const message = e.response?.data?.message
      setError(typeof message === 'string' ? message : 'Analisa belum dapat dijalankan. Periksa layanan AI Agent dan coba lagi.')
      setQuestion(text)
    } finally {setBusy(false); setPendingQuestion('')}
  }
  const openConversation = (item: Conversation) => {setConversationId(item.id); setMessages(item.messages.filter(m => m.role === 'USER' || m.role === 'ASSISTANT').map(m => ({role: m.role === 'USER' ? 'user' : 'assistant', content: m.role === 'ASSISTANT' ? cleanAnalyticsAnswer(m.content) : m.content}))); setError(''); setDownloadNotice('')}
  const templatesList = <div className='analytics-template-grid'>{templates.map((t, i) => <button type='button' className='analytics-template' key={`${t.title}-${i}`} onClick={() => {setQuestion(t.prompt); setShowTemplates(false); window.scrollTo({top: 0, behavior: 'smooth'})}}><span className='analytics-template-body'><b>{i < defaults.length ? 'BAWAAN' : 'TEMPLATE SAYA'}</b><span>{t.prompt}</span></span><span className='analytics-template-foot'><strong>{t.title}</strong><span>Pakai</span></span></button>)}</div>
  return <div className='analytics-page'>
    <nav className='analytics-tabs' aria-label='Menu Analytics'>{([['analisa', 'Analisa AI'], ['dashboard', 'Dashboard'], ['privasi', 'Batasan & Privasi']] as [Tab, string][]).map(([id, label]) => <button type='button' key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
    {tab === 'analisa' && <div className={`analytics-home ${messages.length || busy ? 'analytics-home-thread' : ''}`}>
      {!messages.length && !busy ? <div className='analytics-welcome'><svg viewBox='0 0 32 32' aria-hidden='true'><rect x='3' y='16' width='6' height='12' rx='1.5'/><rect x='13' y='9' width='6' height='19' rx='1.5'/><rect x='23' y='4' width='6' height='24' rx='1.5'/></svg><h1>Selamat {greeting}{user ? `, ${user}` : ''}</h1></div> : <div className='analytics-thread'><button className='analytics-link' disabled={busy} onClick={() => {setMessages([]); setConversationId(undefined); setError(''); setDownloadNotice('')}}>← Analisa AI</button>{messages.map((m, i) => m.role === 'user' ? <div key={i} className='analytics-message user'><strong>Anda</strong><div>{m.content}</div></div> : <article key={i} className='analytics-message assistant'><div className='analytics-answer-header'><span className='analytics-answer-icon' aria-hidden='true'>✦</span><div><strong>Hasil analisa</strong><span>Jawaban AI</span></div></div><AnalyticsAnswer content={m.content} />{isExportableAnswer(m.content) && <div className='analytics-answer-actions'><button type='button' className='analytics-export' onClick={() => exportMessage(i)}><i className='bi bi-download' aria-hidden='true' /> Unduh Excel</button><button type='button' className='analytics-copy' onClick={async () => {try {await navigator.clipboard.writeText(m.content); setError(''); setDownloadNotice('Jawaban berhasil disalin.')} catch {setDownloadNotice(''); setError('Jawaban belum dapat disalin di browser ini.')}}}><i className='bi bi-copy' aria-hidden='true' /> Salin jawaban</button></div>}</article>)}{busy && <><div className='analytics-message user'><strong>Anda</strong><div>{pendingQuestion}</div></div><div className='analytics-thinking' role='status' aria-live='polite'><span className='analytics-thinking-icon'>✦</span><div><strong>Sedang menyusun analisa</strong><span>Mohon tunggu sebentar…</span></div><span className='analytics-thinking-dots' aria-hidden='true'><b></b><b></b><b></b></span></div></>}</div>}
      <div className='analytics-composer'><textarea value={question} maxLength={2000} onChange={e => setQuestion(e.target.value)} onKeyDown={e => {if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {e.preventDefault(); send()}}} placeholder={messages.length ? 'Minta analisa lanjutan dari laporan ini…' : 'Laporan atau analisa apa yang Anda butuhkan hari ini?'} aria-label='Permintaan analisa' /><div className='analytics-actions'><button type='button' className='analytics-icon' onClick={() => setShowTemplates(!showTemplates)} aria-label='Pilih template' title='Pilih template'>＋</button><span className='analytics-action-right'><button type='button' className='analytics-icon' onClick={saveTemplate} aria-label='Simpan sebagai template' title='Simpan sebagai template'>♧</button><button type='button' className='analytics-send' onClick={send} disabled={busy || !question.trim()} aria-label='Kirim permintaan'>{busy ? '…' : '↑'}</button></span></div>{showTemplates && <div className='analytics-popover'>{templates.map((t, i) => <button key={i} onClick={() => {setQuestion(t.prompt); setShowTemplates(false)}}>{t.title}</button>)}</div>}</div>
      <p className='analytics-hint'>Pertanyaan dikirim ke layanan AI. Hindari memasukkan data pribadi. Tekan Enter untuk mengirim.</p>
      {error && <div className='analytics-error' role='alert'>{error}</div>}
      {downloadNotice && <div className='analytics-download-notice' role='status'>{downloadNotice}</div>}
      {!messages.length && !busy && <div className='analytics-recent'><div className='analytics-segment'><button className={section === 'recent' ? 'selected' : ''} onClick={() => setSection('recent')}>Laporan terbaru</button><button className={section === 'templates' ? 'selected' : ''} onClick={() => setSection('templates')}>Template</button></div>{section === 'recent' && recent.length > 0 ? <div className='analytics-template-grid'>{recent.map(c => <button className='analytics-template' key={c.id} onClick={() => openConversation(c)}><span className='analytics-template-body'><b>LAPORAN</b><span>{cleanAnalyticsAnswer(c.messages.find(m => m.role === 'ASSISTANT')?.content || c.title)}</span></span><span className='analytics-template-foot'><strong>{c.title}</strong><span>{new Date(c.created_at).toLocaleDateString('id-ID')}</span></span></button>)}</div> : <><p>{section === 'recent' ? (recentError || 'Belum ada laporan. Mulai dari salah satu template:') : 'Pilih template untuk memulai analisa:'}</p>{templatesList}</>}</div>}
    </div>}
    {tab === 'dashboard' && <div className='analytics-dashboard'><div className='analytics-dash-head'><div><h1>Dashboard</h1><p>Sumber: data aplikasi · periode berdasarkan tanggal pembuatan</p></div><div className='analytics-dash-tools'><label><span className='analytics-sr'>Periode</span><select value={year} onChange={e => setYear(e.target.value)}><option value='all'>Semua periode</option>{Array.from({length: 6}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}</select></label><button onClick={() => setShowWidgets(!showWidgets)}>+ Tambah widget</button><button onClick={() => setEditing(!editing)}>{editing ? 'Selesai mengatur' : 'Atur widget'}</button></div></div>
      {showWidgets && <div className='analytics-widget-picker'><strong>Pilih widget</strong>{[['monthly', 'Order per bulan'], ['statuses', 'Status order'], ['stores', '10 toko dengan nilai order terbesar']].map(([id, label]) => <label key={id}><input type='checkbox' checked={widgets.includes(id)} onChange={e => saveWidgets(e.target.checked ? [...widgets, id] : widgets.filter(w => w !== id))}/> {label}</label>)}</div>}
      {loading && <p>Memuat data dashboard…</p>}{summaryError && <div className='analytics-error' role='alert'>{summaryError}</div>}{summary && !loading && <><div className='analytics-kpis'><div><span>TOTAL ORDER</span><strong>{number(summary.total_order)}</strong><small>{summary.selesai === null ? 'Status selesai belum dikonfirmasi' : `${number(summary.selesai)} selesai`}</small></div><div><span>NILAI ORDER</span><strong>{rupiah(summary.nilai_total_order)}</strong><small>rata-rata {rupiah(summary.rata_rata_nilai_order)} / order</small></div><div><span>INVOICE VENDOR</span><strong>{rupiah(summary.invoice_total)}</strong><small>{number(summary.invoice_count)} invoice</small></div><div><span>ORDER SELESAI</span><strong>{summary.selesai === null ? '—' : `${summary.total_order ? (100 * summary.selesai / summary.total_order).toFixed(1).replace('.', ',') : '0'}%`}</strong><small>{summary.selesai === null ? 'Status belum dikonfirmasi' : `${number(summary.selesai)} dari ${number(summary.total_order)}`}</small></div><div><span>KOMPLAIN</span><strong>{number(summary.complaint_count)}</strong><small>komplain diterima</small></div></div>
      <div className='analytics-charts'>{widgets.includes('monthly') && <section className='analytics-chart analytics-chart-full'><h3>Order per bulan</h3>{editing && <button className='analytics-remove' onClick={() => saveWidgets(widgets.filter(w => w !== 'monthly'))}>Hapus</button>}{summary.monthly.length ? <Chart type='area' height={300} options={{...chartOptions, xaxis: {categories: summary.monthly.map((x: any) => x.month)}, stroke: {curve: 'smooth', width: 2}, fill: {opacity: .13}}} series={[{name: 'Order', data: summary.monthly.map((x: any) => x.count)}]}/> : <p>Belum ada data untuk periode ini.</p>}</section>}
      {widgets.includes('statuses') && <section className='analytics-chart'><h3>Status order</h3>{editing && <button className='analytics-remove' onClick={() => saveWidgets(widgets.filter(w => w !== 'statuses'))}>Hapus</button>}{summary.statuses.length ? <Chart type='donut' height={300} options={{...chartOptions, labels: summary.statuses.map((x: any) => x.label), legend: {position: 'bottom'}}} series={summary.statuses.map((x: any) => x.count)}/> : <p>Belum ada data untuk periode ini.</p>}</section>}
      {widgets.includes('stores') && <section className='analytics-chart'><h3>10 toko dengan nilai order terbesar</h3>{editing && <button className='analytics-remove' onClick={() => saveWidgets(widgets.filter(w => w !== 'stores'))}>Hapus</button>}{summary.stores.length ? <Chart type='bar' height={300} options={{...chartOptions, plotOptions: {bar: {horizontal: true, borderRadius: 3}}, xaxis: {categories: summary.stores.map((x: any) => x.label)}, tooltip: {y: {formatter: rupiah}}}} series={[{name: 'Nilai order', data: summary.stores.map((x: any) => x.total)}]}/> : <p>Belum ada data untuk periode ini.</p>}</section>}</div></>}</div>}
    {tab === 'privasi' && <AnalyticsPrivacy allowed={allowedFields} onChange={changeAllowedFields} />}
  </div>
}
export {DashboardAIAnalytics}
