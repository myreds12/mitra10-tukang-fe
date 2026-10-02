const fs = require('fs')
const path = require('path')
const {chromium} = require('playwright')

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3012').replace(/\/$/, '')
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3039').replace(/\/$/, '')
const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'docs', 'screenshots-vendor-docs')
const CHECKLIST_PATH = path.resolve(__dirname, '..', '..', 'docs', 'SCREENSHOT_VENDOR_SP_REGISTRATION_CHECKLIST.md')
const USERNAME = process.env.ADMIN_HO_USERNAME || 'sp_order_rule_admin_ho'
const PASSWORD = process.env.ADMIN_HO_PASSWORD || 'password123'

const rules = [
  ['01', 'ORDER_NOT_CONFIRMED_H', 'KONFIRMASI_ORDER'],
  ['02', 'ORDER_NOT_CONFIRMED_H1', 'KONFIRMASI_ORDER'],
  ['03', 'ORDER_NOT_CONFIRMED_H_PLUS', 'KONFIRMASI_ORDER'],
  ['04', 'REFUND_5_PER_QUARTER', 'REFUND'],
  ['05', 'REFUND_6_10_PER_QUARTER', 'REFUND'],
  ['06', 'QUOTATION_NOT_FULFILLED', 'LAINNYA'],
  ['07', 'QUOTATION_LATE_H2', 'LAINNYA'],
  ['08', 'QUOTATION_LATE_H3', 'LAINNYA'],
  ['09', 'DOC_NOT_UPLOADED', 'LAINNYA'],
  ['10', 'STATUS_NOT_UPDATED_H', 'LAINNYA'],
  ['11', 'STATUS_NOT_UPDATED_H1', 'LAINNYA'],
  ['12', 'STATUS_NOT_UPDATED_H_PLUS', 'LAINNYA'],
  ['13', 'RESCHEDULE_NOT_UPDATED', 'RESCHEDULE'],
  ['14', 'RESCHEDULE_CHANGE_SCHEDULE', 'RESCHEDULE'],
  ['15', 'CUSTOMER_COMPLAINT', 'LAINNYA'],
]

const ruleVendor = {
  ORDER_NOT_CONFIRMED_H: 'SP_ORDER_RULE_EVIDENCE_VENDOR_CONFIRMATION',
  ORDER_NOT_CONFIRMED_H1: 'SP_ORDER_RULE_EVIDENCE_VENDOR_CONFIRMATION',
  ORDER_NOT_CONFIRMED_H_PLUS: 'SP_ORDER_RULE_EVIDENCE_VENDOR_CONFIRMATION',
  REFUND_5_PER_QUARTER: 'SP_ORDER_RULE_EVIDENCE_VENDOR_REFUND',
  REFUND_6_10_PER_QUARTER: 'SP_ORDER_RULE_EVIDENCE_VENDOR_REFUND',
  QUOTATION_NOT_FULFILLED: 'SP_ORDER_RULE_EVIDENCE_VENDOR_QUOTATION',
  QUOTATION_LATE_H2: 'SP_ORDER_RULE_EVIDENCE_VENDOR_QUOTATION',
  QUOTATION_LATE_H3: 'SP_ORDER_RULE_EVIDENCE_VENDOR_QUOTATION',
  DOC_NOT_UPLOADED: 'SP_ORDER_RULE_EVIDENCE_VENDOR_WORK_ORDER',
  STATUS_NOT_UPDATED_H: 'SP_ORDER_RULE_EVIDENCE_VENDOR_WORK_ORDER',
  STATUS_NOT_UPDATED_H1: 'SP_ORDER_RULE_EVIDENCE_VENDOR_WORK_ORDER',
  STATUS_NOT_UPDATED_H_PLUS: 'SP_ORDER_RULE_EVIDENCE_VENDOR_WORK_ORDER',
  RESCHEDULE_NOT_UPDATED: 'SP_ORDER_RULE_EVIDENCE_VENDOR_RESCHEDULE',
  RESCHEDULE_CHANGE_SCHEDULE: 'SP_ORDER_RULE_EVIDENCE_VENDOR_RESCHEDULE',
  CUSTOMER_COMPLAINT: 'SP_ORDER_RULE_EVIDENCE_VENDOR_COMPLAINT',
}

const results = []

async function ensureDir() {
  await fs.promises.mkdir(OUTPUT_DIR, {recursive: true})
}

function out(name) {
  return path.join(OUTPUT_DIR, name)
}

function record(moduleName, flow, fileName, status = 'Done', note = '') {
  results.push({moduleName, flow, fileName, status, note})
}

async function api(method, urlPath, body, token) {
  const headers = {'Content-Type': 'application/json', Accept: 'application/json'}
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_URL}${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!response.ok) {
    throw new Error(`${method} ${urlPath} failed ${response.status}: ${text}`)
  }
  return data
}

async function loginApi() {
  const response = await api('POST', '/auth/login', {username: USERNAME, password: PASSWORD})
  const payload = response.data
  if (!payload?.accessToken || !payload?.user) {
    throw new Error('Login response does not contain accessToken/user')
  }
  return payload
}

async function installSession(page, login) {
  await page.goto(BASE_URL, {waitUntil: 'domcontentloaded'})
  await page.evaluate(({user, accessToken}) => {
    localStorage.setItem('user_id', String(user.id))
    localStorage.setItem('username', user.username)
    localStorage.setItem('userRole', user.roles.name)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('kt_theme_mode_menu', 'light')
  }, login)
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => null)
  await page.waitForLoadState('networkidle', {timeout: 15000}).catch(() => null)
  await page.waitForTimeout(1200)
}

async function shot(page, fileName, fullPage = true) {
  await page.screenshot({path: out(fileName), fullPage})
}

async function gotoShot(page, urlPath, fileName, waitSelector, note = '') {
  await page.goto(`${BASE_URL}${urlPath}`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  if (waitSelector) {
    await page.locator(waitSelector).first().waitFor({state: 'visible', timeout: 30000}).catch(() => null)
  }
  await shot(page, fileName)
  record('General', urlPath, fileName, 'Done', note)
}

async function ensureRejectForm(page) {
  if (!(await page.locator('.reject-form textarea').first().isVisible().catch(() => false))) {
    await page.getByRole('button', {name: /Tolak Pendaftaran/i}).click().catch(() => null)
    await page.waitForTimeout(500)
  }
  await page.locator('.reject-form textarea').first().waitFor({state: 'visible', timeout: 15000})
}

async function getFirstListItem(token, endpoint, params = '') {
  const response = await api('GET', `${endpoint}${params}`, null, token)
  const payload = response?.data?.data ? response.data : response?.data || response
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
  return rows[0]
}

async function createRegistration(token, suffix) {
  const stamp = `${Date.now()}${suffix}`
  const serviceType = await getFirstListItem(token, '/service-type', '?take=1')
  const area = await getFirstListItem(token, '/area', '?take=1')
  const dto = {
    company_name: `SS_VENDOR_REG_${stamp}`,
    address: `Jl Screenshot Evidence ${suffix}`,
    phone_number: `08177${String(stamp).slice(-7)}`,
    email_address: `ss_vendor_${stamp}@example.com`,
    pic_name: `PIC Screenshot ${suffix}`,
    pic_email: `ss_pic_${stamp}@example.com`,
    pic_phone: `08188${String(stamp).slice(-7)}`,
    ktp_number: `3276${String(stamp).slice(-12).padStart(12, '0')}`,
    npwp_number: `09${String(stamp).slice(-13).padStart(13, '0')}`,
    service_types: serviceType?.id ? [serviceType.id] : undefined,
    areas: area?.id ? [area.id] : undefined,
    tukang_data: [
      {
        full_name: `Tukang Screenshot ${suffix}`,
        phone_number: `08199${String(stamp).slice(-7)}`,
        ktp_number: `3376${String(stamp).slice(-12).padStart(12, '0')}`,
        skill: serviceType?.id || 1,
      },
    ],
    pdp_consent: true,
    notes: 'Data evidence screenshot otomatis.',
  }
  const created = await api('POST', '/vendor-registration/register', dto)
  const registrationId = created?.registration_id || created?.data?.registration_id || created?.data?.id || created?.id
  if (!registrationId) {
    throw new Error(`Register vendor did not return registration id: ${JSON.stringify(created)}`)
  }
  return {...dto, id: registrationId}
}

async function captureRegistration(page, token) {
  await gotoShot(page, '/vendor-register', 'VR_01_Form_Pendaftaran.png', '#new-vendor', 'Public form')
  await shot(page, 'VR_02_Dokumen_PDP.png')

  const approveReg = await createRegistration(token, 'APPROVE')
  const rejectPendingReg = await createRegistration(token, 'REJECT_PENDING')
  const rejectPitchingReg = await createRegistration(token, 'REJECT_PITCHING')

  await page.goto(`${BASE_URL}/vendor-registration/view`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  await page.getByPlaceholder('Nama Perusahaan').fill(approveReg.company_name)
  await settle(page)
  await shot(page, 'VR_03_Dashboard_Pendaftaran.png')
  record('Vendor Registration', 'Dashboard registration filtered', 'VR_03_Dashboard_Pendaftaran.png')

  await page.goto(`${BASE_URL}/vendor-registration/approval/${approveReg.id}`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  await shot(page, 'VR_04_Detail_Menunggu_Approve.png')
  record('Vendor Registration', 'Detail Menunggu Approve', 'VR_04_Detail_Menunggu_Approve.png')

  await page.locator('.btn-approve').first().scrollIntoViewIfNeeded().catch(() => null)
  await page.locator('.btn-approve').first().click()
  await page.locator('.swal2-popup').waitFor({state: 'visible', timeout: 10000}).catch(() => null)
  await shot(page, 'VR_05_Proses_Pitching_action.png')
  record('Vendor Registration', 'Start pitching confirmation modal', 'VR_05_Proses_Pitching_action.png')
  await page.getByRole('button', {name: /Ya, Proses Pitching/i}).click()
  await page.locator('.swal2-popup').waitFor({state: 'visible', timeout: 15000}).catch(() => null)
  await shot(page, 'VR_05_Proses_Pitching_after.png')
  record('Vendor Registration', 'Start pitching success', 'VR_05_Proses_Pitching_after.png')
  await page.keyboard.press('Enter').catch(() => null)

  await page.goto(`${BASE_URL}/vendor-registration/approval/${approveReg.id}`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  await shot(page, 'VR_06_Detail_Proses_Pitching.png')
  record('Vendor Registration', 'Detail Proses Pitching', 'VR_06_Detail_Proses_Pitching.png')

  await page.locator('.btn-approve').first().scrollIntoViewIfNeeded().catch(() => null)
  await page.locator('.btn-approve').first().click()
  await page.locator('.swal2-popup').waitFor({state: 'visible', timeout: 10000}).catch(() => null)
  await shot(page, 'VR_07_Final_Approve_action.png')
  record('Vendor Registration', 'Final approve confirmation modal', 'VR_07_Final_Approve_action.png')
  await page.getByRole('button', {name: /Ya, Setujui Final/i}).click()
  await page.locator('.swal2-popup').waitFor({state: 'visible', timeout: 20000}).catch(() => null)
  await shot(page, 'VR_07_Final_Approve_after.png')
  record('Vendor Registration', 'Final approve success', 'VR_07_Final_Approve_after.png')

  await page.goto(`${BASE_URL}/vendor-registration/approval/${rejectPendingReg.id}?action=reject`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  await ensureRejectForm(page)
  await shot(page, 'VR_08_Reject_Form_Menunggu.png')
  await page.locator('.reject-form textarea').first().fill('Dokumen evidence screenshot belum lengkap.')
  await shot(page, 'VR_08_Reject_Form_Menunggu_filled.png')
  await page.getByRole('button', {name: /Konfirmasi Tolak/i}).click()
  await page.locator('.swal2-popup').waitFor({state: 'visible', timeout: 15000}).catch(() => null)
  await shot(page, 'VR_08_Reject_Menunggu_after.png')
  record('Vendor Registration', 'Reject from Menunggu Approve', 'VR_08_Reject_Menunggu_after.png')

  await api('PUT', `/vendor-registration/${rejectPitchingReg.id}/start-pitching`, {notes: 'Prepare reject pitching evidence'}, token)
  await page.goto(`${BASE_URL}/vendor-registration/approval/${rejectPitchingReg.id}?action=reject`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  await ensureRejectForm(page)
  await shot(page, 'VR_09_Reject_Form_Pitching.png')
  await page.locator('.reject-form textarea').first().fill('Tidak lolos proses pitching evidence.')
  await page.getByRole('button', {name: /Konfirmasi Tolak/i}).click()
  await page.locator('.swal2-popup').waitFor({state: 'visible', timeout: 15000}).catch(() => null)
  await shot(page, 'VR_09_Reject_Pitching_after.png')
  record('Vendor Registration', 'Reject from Proses Pitching', 'VR_09_Reject_Pitching_after.png')

  await page.goto(`${BASE_URL}/vendor-registration/history/${approveReg.id}`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  await shot(page, 'VR_10_Histori_Pendaftaran.png')
  record('Vendor Registration', 'Registration history', 'VR_10_Histori_Pendaftaran.png')
}

async function selectAntOption(page, selectIndex, text) {
  await page.locator('.ant-select-selector').nth(selectIndex).click()
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').getByText(text, {exact: true}).click()
  await settle(page)
}

async function findRuleOnViolationLog(page, code, category) {
  await page.goto(`${BASE_URL}/vendor-sp/violation-log`, {waitUntil: 'domcontentloaded'})
  await settle(page)
  await page.getByPlaceholder('Cari vendor...').fill(code)
  await page.keyboard.press('Enter')
  await settle(page)
  const categoryLabel = {
    KONFIRMASI_ORDER: 'Konfirmasi Order',
    RESCHEDULE: 'Reschedule',
    REFUND: 'Refund',
    LAINNYA: 'Lainnya',
  }[category]
  if (categoryLabel) {
    await selectAntOption(page, 0, categoryLabel).catch(() => null)
  }
  if (ruleVendor[code]) {
    await selectAntOption(page, 1, ruleVendor[code]).catch(() => null)
  }

  await settle(page)
  return page.getByText(code, {exact: true}).first().isVisible().catch(() => false)
}

async function captureVendorSp(page, token) {
  await gotoShot(page, '/vendor-sp/view', 'SP_01_Daftar_SP.png', '.vendor-sp-table', 'Daftar SP')
  await gotoShot(page, '/vendor-sp/violation-log', 'SP_02_Log_Pelanggaran.png', '.vendor-sp-table', 'Log pelanggaran')
  await gotoShot(page, '/vendor-sp/violation-type', 'SP_03_Master_Pelanggaran.png', '.vendor-sp-table', 'Master pelanggaran')
  await gotoShot(page, '/vendor-sp/revision-request', 'SP_04_Approval_Revisi_Reset.png', '.vendor-sp-table', 'Approval revisi/reset')
  await gotoShot(page, '/vendor-sp/reactivation', 'SP_05_Reaktivasi_SP3.png', '.vendor-sp-table', 'Reaktivasi SP3')

  for (const [level, vendor] of [
    ['SP1', 'SP_ORDER_RULE_EVIDENCE_VENDOR_THRESHOLD_SP1'],
    ['SP2', 'SP_ORDER_RULE_EVIDENCE_VENDOR_THRESHOLD_SP2'],
    ['SP3', 'SP_ORDER_RULE_EVIDENCE_VENDOR_THRESHOLD_SP3'],
  ]) {
    await page.goto(`${BASE_URL}/vendor-sp/view`, {waitUntil: 'domcontentloaded'})
    await settle(page)
    await page.getByPlaceholder('Cari vendor...').fill(vendor)
    await page.keyboard.press('Enter')
    await settle(page)
    const listFile = `SP_THRESHOLD_${level}_list.png`
    await shot(page, listFile)
    record('Vendor SP', `Threshold ${level} list`, listFile)
    const detail = await api('GET', `/vendor-sp?take=1&search=${encodeURIComponent(vendor)}`, null, token)
    const row = detail?.data?.data?.[0] || detail?.data?.[0]
    if (row?.id) {
      await page.goto(`${BASE_URL}/vendor-sp/detail/${row.id}`, {waitUntil: 'domcontentloaded'})
      await settle(page)
      const detailFile = `SP_THRESHOLD_${level}_detail.png`
      await shot(page, detailFile)
      record('Vendor SP', `Threshold ${level} detail`, detailFile)
    }
  }

  for (const [no, code, category] of rules) {
    const found = await findRuleOnViolationLog(page, code, category)
    const file = `RULE_${no}_${code}_after_log.png`
    await shot(page, file)
    record('Vendor SP Rule', code, file, found ? 'Done' : 'Missing', found ? 'Evidence log captured from UI' : 'Rule code not visible after pagination search')

    if (found) {
      const row = page.locator('tr', {hasText: code}).first()
      await row.locator('button').last().click().catch(() => null)
      await page.locator('.ant-modal').waitFor({state: 'visible', timeout: 10000}).catch(() => null)
      const modalFile = `RULE_${no}_${code}_detail_modal.png`
      await shot(page, modalFile)
      record('Vendor SP Rule', `${code} detail modal`, modalFile)
      await page.getByRole('button', {name: /Tutup|Close/i}).click().catch(() => null)
    }
  }
}

async function writeChecklist() {
  const lines = [
    '# Screenshot Vendor SP dan Vendor Registration Checklist',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Module | Flow/Rule | File | Status | Catatan |',
    '|---|---|---|---|---|',
    ...results.map((item) => (
      `| ${item.moduleName} | ${item.flow} | ${item.fileName} | ${item.status} | ${item.note || ''} |`
    )),
    '',
  ]
  await fs.promises.writeFile(CHECKLIST_PATH, lines.join('\n'))
}

async function run() {
  await ensureDir()
  const login = await loginApi()

  const browser = await chromium.launch({headless: process.env.HEADLESS !== 'false'})
  const context = await browser.newContext({viewport: {width: 1440, height: 1200}})
  const page = await context.newPage()

  try {
    await installSession(page, login)
    if (process.env.SKIP_REGISTRATION !== '1') {
      await captureRegistration(page, login.accessToken)
    }
    await captureVendorSp(page, login.accessToken)
  } finally {
    await writeChecklist()
    await browser.close()
  }

  console.log(`Screenshots written to ${OUTPUT_DIR}`)
  console.log(`Checklist written to ${CHECKLIST_PATH}`)
}

run().catch(async (error) => {
  console.error(error)
  await writeChecklist().catch(() => null)
  process.exitCode = 1
})
