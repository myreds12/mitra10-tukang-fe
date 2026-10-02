const fs = require('fs')
const path = require('path')
const {chromium} = require('playwright')

const FRONTEND_ROOT = process.cwd()
const REPO_ROOT = path.resolve(FRONTEND_ROOT, '..')
const OUTPUT_DIR = path.resolve(REPO_ROOT, 'docs', 'screenshots-vendor-docs')

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return env

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) return env

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')

      env[key] = value
      return env
    }, {})
}

const env = {
  ...readEnv(path.resolve(FRONTEND_ROOT, '.env')),
  ...process.env,
}

const BASE_URL = (env.BASE_URL || 'http://localhost:3012').replace(/\/$/, '')
const USERNAME = env.ADMIN_HO_USERNAME || 'admin_ho'
const PASSWORD = env.ADMIN_HO_PASSWORD || 'admin123'

async function ensureOutputDir() {
  await fs.promises.mkdir(OUTPUT_DIR, {recursive: true})
}

async function waitForPageReady(page, selector) {
  await page.waitForLoadState('domcontentloaded').catch(() => null)
  await page.waitForLoadState('networkidle', {timeout: 10000}).catch(() => null)
  if (selector) {
    await page.locator(selector).first().waitFor({state: 'visible', timeout: 20000}).catch(() => null)
  }
  await page.locator('.ant-spin-spinning').first().waitFor({state: 'detached', timeout: 15000}).catch(() => null)
  await page.waitForTimeout(1500)
}

async function screenshot(page, fileName, options = {}) {
  const filePath = path.join(OUTPUT_DIR, fileName)
  await page.screenshot({
    path: filePath,
    fullPage: options.fullPage ?? true,
  })
  console.log(`saved: ${filePath}`)
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, {waitUntil: 'domcontentloaded'})
  await waitForPageReady(page)

  const usernameInput = page.getByRole('textbox', {name: /username/i})
  const passwordInput = page.getByPlaceholder('Password')

  await usernameInput.fill(USERNAME)
  await passwordInput.fill(PASSWORD)

  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith('/login'), {timeout: 30000}).catch(() => null),
    page.getByRole('button', {name: /login/i}).click(),
  ])

  if (page.url().endsWith('/login')) {
    throw new Error('Login gagal. Cek ADMIN_HO_USERNAME / ADMIN_HO_PASSWORD di .env atau user DB.')
  }

  await waitForPageReady(page)
}

async function open(page, route, selector) {
  await page.goto(`${BASE_URL}${route}`, {waitUntil: 'domcontentloaded'})
  await waitForPageReady(page, selector)
}

async function captureRegistrationDetail(page) {
  await open(page, '/vendor-registration/view', '#view-vendor-registration')

  const firstDetailButton = page
    .locator('#view-vendor-registration .ant-table-tbody tr.ant-table-row .action-button')
    .first()

  if (!(await firstDetailButton.count())) {
    console.log('skip detail registration: no registration row found')
    return
  }

  await firstDetailButton.click()
  await waitForPageReady(page, '#detail-vendor-registration')
  await screenshot(page, 'VR_04_Detail_Pendaftaran.png')

  const historyButton = page.getByRole('button', {name: /histori/i}).first()
  if (await historyButton.count()) {
    await historyButton.click()
    await waitForPageReady(page, '#detail-vendor-registration')
    await screenshot(page, 'VR_09_Histori_Pendaftaran.png')
  }
}

async function captureSpDetail(page) {
  await open(page, '/vendor-sp/view', '.vendor-sp-table')

  const firstDetailButton = page.locator('.vendor-sp-table .vendor-sp-action-button').first()
  if (!(await firstDetailButton.count())) {
    console.log('skip detail SP: no SP row found')
    return
  }

  await firstDetailButton.click()
  await waitForPageReady(page, '.vendor-sp-table')
  await screenshot(page, 'SP_03_Detail_SP.png')
}

async function run() {
  await ensureOutputDir()

  const browser = await chromium.launch({headless: env.HEADLESS !== 'false'})
  const context = await browser.newContext({
    viewport: {width: 1440, height: 1100},
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  try {
    await open(page, '/vendor-register', '#new-vendor')
    await screenshot(page, 'VR_01_Form_Pendaftaran.png')

    await page.getByText('Dokumen Pendukung').scrollIntoViewIfNeeded().catch(() => null)
    await page.waitForTimeout(700)
    await screenshot(page, 'VR_02_Dokumen_PDP.png', {fullPage: false})

    await login(page)

    await open(page, '/vendor-registration/view', '#view-vendor-registration')
    await screenshot(page, 'VR_03_Dashboard_Pendaftaran.png')

    await captureRegistrationDetail(page)

    await open(page, '/vendor-sp/view', '.vendor-sp-table')
    await screenshot(page, 'SP_01_Menu_Vendor_SP.png')
    await screenshot(page, 'SP_02_Daftar_SP.png')

    await captureSpDetail(page)

    await open(page, '/vendor-sp/violation-log', '.vendor-sp-table')
    await screenshot(page, 'SP_04_Log_Pelanggaran.png')

    await open(page, '/vendor-sp/violation-type', '.vendor-sp-table')
    await screenshot(page, 'SP_06_Master_Pelanggaran.png')

    await open(page, '/vendor-sp/revision-request', '.vendor-sp-table')
    await screenshot(page, 'SP_08_Approval_Revisi_Reset.png')

    await open(page, '/vendor-sp/reactivation', '.vendor-sp-table')
    await screenshot(page, 'SP_09_Reaktivasi_SP3.png')

    console.log(`done: ${OUTPUT_DIR}`)
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
