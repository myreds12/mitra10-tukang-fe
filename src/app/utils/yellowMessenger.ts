/**
 * Utility helper for Yellow.ai Web Widget integration.
 * Docs: https://docs.yellow.ai/docs/platform_concepts/channelConfiguration/web-widget#24-deploy-chat-widget
 * Docs Functions: https://docs.yellow.ai/docs/platform_concepts/channelConfiguration/function-widgets
 */

declare global {
  interface Window {
    ymConfig?: {
      bot: string
      host: string
      [key: string]: any
    }
    YellowMessenger?: ((action: string, data?: any) => void) & {
      q?: any[]
      c?: (args: any) => void
    }
    YellowMessengerPlugin?: {
      show?: () => void
      hide?: () => void
      openBot?: () => void
      closeBot?: () => void
      toggleChat?: () => void
      init?: () => void
    }
    hasYellowEventListener?: boolean
  }
}

const DEFAULT_BOT_ID = 'x1657090256339'
const HIDE_STYLE_ID = 'hide-yellow-ai-style'
const OLD_POSITION_STYLE_ID = 'yellow-ai-position-left-style'
const POSITION_STYLE_ID = 'yellow-ai-position-right-style'
const SCRIPT_ID = 'yellow-ai-web-widget-script'

/**
 * Apply CSS rules to enforce Yellow.ai widget positioning on the bottom-right,
 * stacking vertically (atas-bawah) with the existing internal live chat widget.
 */
function applyRightPositionStyle(): void {
  if (typeof document === 'undefined') return

  // Hapus style posisi kiri lama jika tersisa
  const oldLeftStyle = document.getElementById(OLD_POSITION_STYLE_ID)
  if (oldLeftStyle) {
    oldLeftStyle.remove()
  }

  let style = document.getElementById(POSITION_STYLE_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = POSITION_STYLE_ID
    document.head.appendChild(style)
  }

  style.innerHTML = `
    /* Pastikan launcher Yellow.ai berukuran bulat 56px x 56px (bukan bar lebar 289px) */
    #ymDivBar {
      width: 56px !important;
      min-width: 56px !important;
      max-width: 56px !important;
      height: 56px !important;
      min-height: 56px !important;
      max-height: 56px !important;
      border-radius: 50% !important;
      padding: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      left: auto !important;
      right: 20px !important;
      bottom: 20px !important;
      z-index: 9996 !important;
      transition: bottom 0.25s ease, opacity 0.2s ease, right 0.25s ease !important;
    }
    #ymDivBar .ym-title-parent,
    #ymDivBar .ym-title,
    #ymDivBar .ym-sub-title,
    #ymDivBar .ym-online-box {
      display: none !important;
    }
    #ymDivBar .ym-icon-wrapper {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    #ymDivBar img.ym-icon {
      width: 56px !important;
      height: 56px !important;
      border-radius: 50% !important;
      margin: 0 !important;
      object-fit: cover !important;
      display: block !important;
      float: none !important;
    }

    #ymDivCircle {
      width: 56px !important;
      min-width: 56px !important;
      max-width: 56px !important;
      height: 56px !important;
      min-height: 56px !important;
      max-height: 56px !important;
      border-radius: 50% !important;
      padding: 0 !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16) !important;
      left: auto !important;
      right: 20px !important;
      bottom: 20px !important;
      z-index: 9996 !important;
      transition: bottom 0.25s ease, opacity 0.2s ease, right 0.25s ease !important;
    }
    #ymDivCircle img {
      width: 56px !important;
      height: 56px !important;
      border-radius: 50% !important;
      margin: 0 !important;
      object-fit: cover !important;
      display: block !important;
    }

    #ymPluginDiv,
    #ym-chat-btn,
    .ym-chat-button,
    #ym-auto-pop-up-container {
      left: auto !important;
      right: 20px !important;
      bottom: 20px !important;
      z-index: 9996 !important;
      transition: bottom 0.25s ease, opacity 0.2s ease, right 0.25s ease !important;
    }

    /* Posisikan launcher livechat internal di sebelah kiri Yellow.ai, berdampingan rapi secara horizontal */
    #livechat-popup-btn {
      left: auto !important;
      right: 96px !important;
      bottom: 20px !important;
      z-index: 9996 !important;
      transition: bottom 0.25s ease, right 0.25s ease !important;
    }

    /* Saat ada bar aksi (tombol tolak dan setuju), letakkan kedua ikon di ATAS bar aksi */
    body.has-vendor-action-bar #ymDivBar,
    body.has-vendor-action-bar #ymDivCircle,
    body.has-vendor-action-bar #ymPluginDiv,
    body.has-vendor-action-bar #ym-chat-btn,
    body.has-vendor-action-bar .ym-chat-button,
    body.has-vendor-action-bar #ym-auto-pop-up-container,
    body:has(.action-buttons-wrap) #ymDivBar,
    body:has(.action-buttons-wrap) #ymDivCircle,
    body:has(.action-buttons-wrap) #ymPluginDiv,
    body:has(.action-buttons-wrap) #ym-chat-btn,
    body:has(.action-buttons-wrap) .ym-chat-button,
    body:has(.action-buttons-wrap) #ym-auto-pop-up-container,
    body.has-vendor-action-bar #livechat-popup-btn,
    body:has(.action-buttons-wrap) #livechat-popup-btn {
      bottom: 86px !important;
    }

    /* Saat panel chat internal dibuka di halaman yang memiliki action-bar: posisikan panel di atas action bar */
    body.has-vendor-action-bar .livechat-popup-panel,
    body:has(.action-buttons-wrap) .livechat-popup-panel {
      bottom: 146px !important;
    }

    /* Saat popup panel internal livechat dibuka: sembunyikan launcher Yellow.ai agar tidak menghalangi panel chat */
    body.livechat-popup-is-open #ymDivBar,
    body.livechat-popup-is-open #ymDivCircle,
    body.livechat-popup-is-open #ymPluginDiv,
    body.livechat-popup-is-open #ym-chat-btn,
    body.livechat-popup-is-open .ym-chat-button,
    body.livechat-popup-is-open #ym-auto-pop-up-container {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Ketika jendela percakapan Yellow.ai terbuka / aktif */
    #ymFrameHolder {
      bottom: 20px !important;
      right: 18px !important;
      z-index: 99999 !important;
    }
    #ymPluginDiv:has(iframe) {
      bottom: 20px !important;
      right: 18px !important;
      z-index: 99999 !important;
    }
    body.yellow-ai-is-open #ymPluginDiv {
      bottom: 20px !important;
      right: 18px !important;
      z-index: 99999 !important;
    }
    #ymPluginDiv iframe,
    #ymIframe,
    iframe[id*="ym-"],
    iframe[id*="yellow"] {
      left: auto !important;
      right: 0 !important;
      z-index: 99999 !important;
    }
  `
}

/**
 * Check if the current authenticated session is a Pendaftar Vendor.
 */
export function isPendaftarVendorUser(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem('userRole') === 'Pendaftar Vendor'
  } catch (e) {
    return false
  }
}

/**
 * Initialize / show the Yellow.ai live chat widget for all users on all pages,
 * positioned on the right side and stacked vertically with the internal live chat.
 */
export function initYellowChat(botId = DEFAULT_BOT_ID): void {
  if (typeof window === 'undefined') return

  // Remove any legacy custom launcher element if exists
  const legacyLauncher = document.getElementById('yellow-ai-custom-launcher')
  if (legacyLauncher) {
    legacyLauncher.remove()
  }

  // Remove force-hide styles
  const hideStyle = document.getElementById(HIDE_STYLE_ID)
  if (hideStyle) {
    hideStyle.remove()
  }

  // Apply right alignment & stacked styles
  applyRightPositionStyle()

  window.ymConfig = {
    bot: botId,
    host: 'https://cloud.yellow.ai',
    alignLeft: false,
    skin: {
      webIconType: 'circle',
      mobileIconType: 'circle',
      ...(window.ymConfig?.skin || {}),
    },
    circleOpen: true,
    ...(window.ymConfig || {}),
  }

  if (window.YellowMessengerPlugin?.show) {
    try {
      window.YellowMessengerPlugin.show()
    } catch (e) {
      // ignore
    }
  }

  // Listener event buka/tutup chat Yellow.ai
  if (!window.hasYellowEventListener) {
    window.hasYellowEventListener = true
    window.addEventListener('message', (event) => {
      try {
        const eventCode = event.data?.event_code || event.data?.event
        if (
          eventCode === 'ym-client-chat-opened' ||
          eventCode === 'chat-opened' ||
          eventCode === 'open'
        ) {
          document.body.classList.add('yellow-ai-is-open')
        } else if (
          eventCode === 'ym-client-chat-closed' ||
          eventCode === 'chat-closed' ||
          eventCode === 'close'
        ) {
          document.body.classList.remove('yellow-ai-is-open')
        }
      } catch (e) {}
    })
  }

  const existingScript = document.getElementById(SCRIPT_ID)
  if (!existingScript) {
    const d = document
    const w = window
    const i: any = function () {
      i.c(arguments)
    }
    i.q = []
    i.c = function (e: any) {
      i.q.push(e)
    }
    w.YellowMessenger = i

    const script = d.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'text/javascript'
    script.async = true
    script.src = 'https://cdn.yellowmessenger.com/plugin/widget-v2/latest/dist/main.min.js'
    const firstScript = d.getElementsByTagName('script')[0]
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      d.head.appendChild(script)
    }
  }
}

/**
 * Completely hide / suppress Yellow.ai live chat widget.
 */
export function hideYellowChat(): void {
  if (typeof window === 'undefined') return

  if (window.YellowMessengerPlugin?.closeBot) {
    try {
      window.YellowMessengerPlugin.closeBot()
    } catch (e) {}
  }

  if (window.YellowMessengerPlugin?.hide) {
    try {
      window.YellowMessengerPlugin.hide()
    } catch (e) {}
  }

  if (!document.getElementById(HIDE_STYLE_ID)) {
    const style = document.createElement('style')
    style.id = HIDE_STYLE_ID
    style.innerHTML = `
      #ymPluginDiv, #ym-chat-btn, .ym-chat-button,
      [class*="yellowmessenger"], [id*="yellowmessenger"],
      iframe[id*="ym-"], iframe[id*="yellow"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }
    `
    document.head.appendChild(style)
  }
}

/**
 * Open the Yellow.ai live chat widget.
 */
export function openYellowChat(): void {
  if (typeof window === 'undefined') return

  document.body.classList.add('yellow-ai-is-open')

  // Make sure it's initialized and unhidden
  initYellowChat()

  // If plugin is available, show and open bot
  if (window.YellowMessengerPlugin?.show) {
    try {
      window.YellowMessengerPlugin.show()
    } catch (e) {}
  }

  if (window.YellowMessengerPlugin?.openBot) {
    try {
      window.YellowMessengerPlugin.openBot()
      return
    } catch (e) {}
  }

  // Fallback direct activator or YellowMessenger method
  if (typeof window.YellowMessenger === 'function') {
    try {
      window.YellowMessenger('openChat')
      return
    } catch (e) {}
  }

  // Fallback: trigger click on Yellow.ai launcher button in DOM if present
  const yellowLauncher = document.querySelector<HTMLElement>(
    '#ymDivBar, #ymDivCircle, #ymPluginDiv, #ym-chat-btn, .ym-chat-button, [class*="yellowmessenger"], [id*="yellowmessenger"]'
  )
  if (yellowLauncher) {
    yellowLauncher.click()
  }
}

/**
 * Toggle the Yellow.ai live chat widget.
 */
export function toggleYellowChat(): void {
  if (typeof window === 'undefined') return

  if (window.YellowMessengerPlugin?.toggleChat) {
    try {
      window.YellowMessengerPlugin.toggleChat()
      return
    } catch (e) {}
  }

  openYellowChat()
}
