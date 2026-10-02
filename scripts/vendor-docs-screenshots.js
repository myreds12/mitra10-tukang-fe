const fs = require('fs')
const path = require('path')
const {chromium} = require('playwright')

const FRONTEND_DIR = path.resolve(__dirname, '..')
const ROOT_DIR = path.resolve(FRONTEND_DIR, '..')
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'docs', 'screenshots-vendor-docs')

function readEnv() {
  const envPath = path.join(FRONTEND_DIR, '.env')
  const result = {}

  if (!fs.existsSync(envPath)) return result

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...rest] = trimmed.split('=')
    result[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
  }

  return result
}

const env = {...readEnv(), ...process.env}
const BASE_URL = (env.BASE_URL || 'http://localhost:3012').replace(/\/$/, '')
const USERNAME = env.ADMIN_HO_USERNAME || 'admin_ho'
const PASSWORD = env.ADMIN_HO_PASSWORD || 'admin123'

async function ensureOutputDir() {
  await fs.promises.mkdir(OUTPUT_DIR, {recursive: true})
}

async function waitSettled(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => null)
  await page.waitForLoadState('networkidle', {timeout: 15000}).catch(() => null)
  await dismissAlerts(page)
  await page.waitForTimeout(1200)
}

async function dismissAlerts(page) {
  const swalConfirm = page.locator('.swal2-container .swal2-confirm').first()
  if (await swalConfirm.isVisible({timeout: 500}).catch(() => false)) {
    await swalConfirm.click().catch(() => null)
    await page.waitForTimeout(500)
  }
}

async function screenshot(page, fileName, options = {}) {
  const target = path.join(OUTPUT_DIR, fileName)
  if (options.selector) {
    const locator = page.locator(options.selector).first()
    await locator.waitFor({state: 'visible', timeout: 15000}).catch(() => null)
  }
  await waitSettled(page)
  await page.screenshot({path: target, fullPage: options.fullPage !== false})
  console.log(`saved ${target}`)
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, {waitUntil: 'domcontentloaded'})
  await waitSettled(page)

  const username = page.getByRole('textbox', {name: /username/i})
  if (await username.count()) {
    await username.fill(USERNAME)
  } else {
    await page.locator('input[name="username"], input[type="text"]').first().fill(USERNAME)
  }

  const password = page.getByPlaceholder('Password')
  if (await password.count()) {
    await password.fill(PASSWORD)
  } else {
    await page.locator('input[name="password"], input[type="password"]').first().fill(PASSWORD)
  }

  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith('/login'), {timeout: 30000}).catch(() => null),
    page.getByRole('button', {name: /login/i}).click(),
  ])
  await waitSettled(page)
}

async function open(page, route) {
  await page.goto(`${BASE_URL}${route}`, {waitUntil: 'domcontentloaded'})
  await waitSettled(page)
}

async function getFirstRegistrationId(page) {
  await open(page, '/vendor-registration/view')
  const detailLink = page.locator('a[href*="/vendor-registration/approval/"]').first()
  if (await detailLink.count()) {
    const href = await detailLink.getAttribute('href')
    const match = href && href.match(/approval\/(\d+)/)
    if (match) return match[1]
  }

  const actionButton = page.locator('#view-vendor-registration .action-button').first()
  if (await actionButton.count()) {
    await actionButton.click()
    await waitSettled(page)
    const match = page.url().match(/approval\/(\d+)/)
    if (match) return match[1]
  }

  return null
}

async function getFirstSpId(page) {
  await open(page, '/vendor-sp/view')
  const detailLink = page.locator('a[href*="/vendor-sp/detail/"], .vendor-sp-action-button.action-primary').first()
  if (await detailLink.count()) {
    const href = await detailLink.getAttribute('href').catch(() => null)
    const match = href && href.match(/detail\/(\d+)/)
    if (match) return match[1]
    await detailLink.click()
    await waitSettled(page)
    const urlMatch = page.url().match(/detail\/(\d+)/)
    if (urlMatch) return urlMatch[1]
  }

  const tableAction = page.locator('.vendor-sp-table .vendor-sp-action-button.action-primary').first()
  if (await tableAction.count()) {
    await tableAction.click()
    await waitSettled(page)
    const match = page.url().match(/detail\/(\d+)/)
    if (match) return match[1]
  }

  return null
}

async function captureVendorRegister(page) {
  await open(page, '/vendor-register')
  await screenshot(page, 'VR_01_Form_Pendaftaran.png', {selector: '#new-vendor'})

  const docsHeading = page.getByText('Dokumen Pendukung').first()
  if (await docsHeading.count()) {
    await docsHeading.scrollIntoViewIfNeeded()
  }
  await screenshot(page, 'VR_02_Dokumen_PDP.png', {selector: '#new-vendor', fullPage: false})
}

async function captureRegistrationAdmin(page) {
  await open(page, '/vendor-registration/view')
  await screenshot(page, 'VR_03_Dashboard_Pendaftaran.png', {selector: '#view-vendor-registration'})

  const registrationId = await getFirstRegistrationId(page)
  if (!registrationId) {
    console.log('skip registration detail/history: no registration row found')
    return
  }

  await open(page, `/vendor-registration/approval/${registrationId}`)
  await screenshot(page, 'VR_04_Detail_Pendaftaran.png', {selector: '#detail-vendor-registration'})

  await open(page, `/vendor-registration/approval/${registrationId}?action=approve`)
  await screenshot(page, 'VR_05_Aksi_Approve_Pitching_Atau_Final.png', {selector: '#detail-vendor-registration'})

  await open(page, `/vendor-registration/approval/${registrationId}?action=reject`)
  await screenshot(page, 'VR_08_Reject_Form.png', {selector: '#detail-vendor-registration'})

  await open(page, `/vendor-registration/history/${registrationId}`)
  await screenshot(page, 'VR_09_Histori_Pendaftaran.png', {selector: '#detail-vendor-registration'})
}

async function captureVendorSp(page) {
  await open(page, '/vendor-sp/view')
  await screenshot(page, 'SP_01_Menu_Vendor_SP.png')
  await screenshot(page, 'SP_02_Daftar_SP.png', {selector: '.vendor-sp-table'})

  const spId = await getFirstSpId(page)
  if (spId) {
    await open(page, `/vendor-sp/detail/${spId}`)
    await screenshot(page, 'SP_03_Detail_SP.png', {selector: '.vendor-sp-table'})
  } else {
    console.log('skip SP detail: no SP row found')
  }

  await open(page, '/vendor-sp/violation-log')
  await screenshot(page, 'SP_04_Log_Pelanggaran.png', {selector: '.vendor-sp-table'})

  await open(page, '/vendor-sp/violation-type')
  await screenshot(page, 'SP_06_Master_Pelanggaran.png', {selector: '.vendor-sp-table'})

  await open(page, '/vendor-sp/revision-request')
  await screenshot(page, 'SP_08_Approval_Revisi_Reset.png', {selector: '.vendor-sp-table'})

  await open(page, '/vendor-sp/reactivation')
  await screenshot(page, 'SP_09_Reaktivasi_SP3.png', {selector: '.vendor-sp-table'})
}

async function run() {
  await ensureOutputDir()
  const browser = await chromium.launch({headless: env.HEADLESS !== 'false'})
  const context = await browser.newContext({
    viewport: {width: 1440, height: 1200},
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  try {
    await captureVendorRegister(page)
    await login(page)
    await captureRegistrationAdmin(page)
    await captureVendorSp(page)
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
