import React from 'react'
import {render, screen, within} from '@testing-library/react'
import {AnalyticsAnswer, cleanAnalyticsAnswer} from './AnalyticsAnswer'

describe('AnalyticsAnswer', () => {
  it('presents a report table, heading and notes without losing values', () => {
    render(<AnalyticsAnswer content={'**Ringkasan transaksi**\n\n| Metrik | April | Mei |\n|---|---:|---:|\n| Total order | 226 | 229 |\n\n**Keterbatasan:**\n- Data mencakup semua status.'} />)
    expect(screen.getByRole('heading', {name: 'Ringkasan transaksi'})).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', {name: 'Mei'})).toBeInTheDocument()
    expect(within(table).getByRole('cell', {name: '229'})).toBeInTheDocument()
    expect(screen.getByText('Data mencakup semua status.')).toBeInTheDocument()
  })
  it('highlights numerical metrics and keeps the wording intact', () => {
    render(<AnalyticsAnswer content={'- **Rata-rata durasi:** ±6,32 jam per pekerjaan\n- **Jumlah data valid:** 55 work order'} />)
    expect(screen.getByText('Rata-rata durasi')).toBeInTheDocument()
    expect(screen.getByText('±6,32 jam per pekerjaan')).toBeInTheDocument()
    expect(screen.getByText('55 work order')).toBeInTheDocument()
  })
  it('renders HTML from a response as text and preserves extra table cells', () => {
    const {container} = render(<AnalyticsAnswer content={'<img src=x onerror=alert(1)>\n\n| A | B |\n|---|---|\n| 1 | 2 | 3 |'} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(screen.getByRole('cell', {name: '3'})).toBeInTheDocument()
  })
  it('removes broken icon prefixes and emoji from saved answers without changing data or question marks', () => {
    const saved = '?? Ringkasan Umum\n\n??? Kategori Layanan Terbanyak\n\n📊 Total: 1\nApakah data ini benar?\nKode ?? tetap tercatat.'
    const cleaned = cleanAnalyticsAnswer(saved)
    expect(cleaned).toContain('Ringkasan Umum')
    expect(cleaned).toContain('Kategori Layanan Terbanyak')
    expect(cleaned).not.toContain('?? Ringkasan')
    expect(cleaned).not.toContain('📊')
    expect(cleaned).toContain('Apakah data ini benar?')
    expect(cleaned).toContain('Kode ?? tetap tercatat.')
  })
})
