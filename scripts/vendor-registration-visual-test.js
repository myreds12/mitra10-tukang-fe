const fs = require('fs')
const path = require('path')
const {chromium} = require('playwright')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3012'
const LOGIN_URL = `${BASE_URL.replace(/\/$/, '')}/login`
const VENDOR_REGISTRATION_URL = `${BASE_URL.replace(/\/$/, '')}/vendor-registration/view`
const USERNAME = process.env.ADMIN_HO_USERNAME || 'admin_ho'
const PASSWORD = process.env.ADMIN_HO_PASSWORD || 'admin_123'
const OUTPUT_DIR = path.resolve(process.cwd(), 'test-output', 'hasil image')

async function ensureOutputDir(dirPath) {
  await fs.promises.mkdir(dirPath, {recursive: true})
}

async function login(page) {
  await page.goto(LOGIN_URL, {waitUntil: 'domcontentloaded'})

  await page.getByRole('textbox', {name: /username/i}).fill(USERNAME)
  await page.getByPlaceholder('Password').fill(PASSWORD)

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', {name: /login/i}).click(),
  ])

  await page.waitForURL((url) => !url.pathname.endsWith('/login'), {timeout: 30000})
}

async function openVendorRegistration(page) {
  await page.goto(VENDOR_REGISTRATION_URL, {waitUntil: 'domcontentloaded'})
  await page.waitForLoadState('networkidle')

  await page.locator('#view-vendor-registration').waitFor({state: 'visible', timeout: 30000})
  await page.locator('#view-vendor-registration .ant-table-wrapper').waitFor({
    state: 'visible',
    timeout: 30000,
  })
  await page
    .locator('#view-vendor-registration .ant-spin-spinning')
    .waitFor({
      state: 'detached',
      timeout: 30000,
    })
    .catch(() => null)
  await page.locator('#view-vendor-registration .ant-table-tbody tr.ant-table-row').first().waitFor({
    state: 'visible',
    timeout: 30000,
  }).catch(() => null) // Allow timeout if no data is present

  // Wait a bit for everything to settle
  await page.waitForTimeout(2000)
}

async function captureScreenshot(page) {
  await ensureOutputDir(OUTPUT_DIR)

  const timestamp = new Date()
    .toISOString()
    .replace(/[.:]/g, '-')
    .replace('T', '_')
    .replace('Z', '')
  const fileName = `pendaftaran-vendor-final-${timestamp}.png`
  const filePath = path.join(OUTPUT_DIR, fileName)

  await page.screenshot({path: filePath, fullPage: true})

  return filePath
}

async function run() {
  if (!PASSWORD) {
    throw new Error('Environment variable ADMIN_HO_PASSWORD is required.')
  }

  let browser

  try {
    const isHeadless = process.env.HEADLESS !== 'false'
    browser = await chromium.launch({headless: isHeadless})
    const context = await browser.newContext({viewport: {width: 1440, height: 1200}})
    const page = await context.newPage()

    await login(page)
    await openVendorRegistration(page)

    const screenshotPath = await captureScreenshot(page)
    console.log(`Screenshot saved: ${screenshotPath}`)
  } catch (error) {
    console.error('Vendor registration visual validation failed:', error)
    process.exitCode = 1
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

run()
