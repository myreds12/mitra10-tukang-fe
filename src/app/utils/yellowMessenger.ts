/**
 * Utility helper for Yellow.ai Web Widget integration.
 * Docs: https://docs.yellow.ai/docs/platform_concepts/channelConfiguration/web-widget#24-deploy-chat-widget
 * Docs Functions: https://docs.yellow.ai/docs/platform_concepts/channelConfiguration/function-widgets
 */

declare global {
  interface Window {
    ymConfig?: {
      bot: string;
      host: string;
      [key: string]: any;
    };
    YellowMessenger?: ((action: string, data?: any) => void) & {
      q?: any[];
      c?: (args: any) => void;
    };
    YellowMessengerPlugin?: {
      show?: () => void;
      hide?: () => void;
      openBot?: () => void;
      closeBot?: () => void;
      toggleChat?: () => void;
      init?: () => void;
    };
    hasYellowEventListener?: boolean;
  }
}

const DEFAULT_BOT_ID = 'x1657090256339';
const HIDE_STYLE_ID = 'hide-yellow-ai-style';
const OLD_POSITION_STYLE_ID = 'yellow-ai-position-left-style';
const POSITION_STYLE_ID = 'yellow-ai-position-right-style';
const SCRIPT_ID = 'yellow-ai-web-widget-script';

/**
 * Apply CSS rules to enforce Yellow.ai widget positioning on the bottom-right,
 * stacking vertically (atas-bawah) with the existing internal live chat widget.
 */
function applyRightPositionStyle(): void {
  if (typeof document === 'undefined') return;

  // Hapus style posisi kiri lama jika tersisa
  const oldLeftStyle = document.getElementById(OLD_POSITION_STYLE_ID);
  if (oldLeftStyle) {
    oldLeftStyle.remove();
  }

  let style = document.getElementById(POSITION_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = POSITION_STYLE_ID;
    document.head.appendChild(style);
  }

  style.innerHTML = `
    /* Posisi default Yellow.ai di kanan (misal pada login page atau saat livechat internal tidak tampil) */
    #ymDivBar,
    #ymDivCircle,
    #ymPluginDiv,
    #ym-chat-btn,
    .ym-chat-button,
    #ym-auto-pop-up-container {
      left: auto !important;
      right: 18px !important;
      bottom: 20px !important;
      z-index: 9996 !important;
      transition: bottom 0.25s ease, opacity 0.2s ease !important;
    }

    /* Saat internal livechat aktif (di dashboard):
       Naikkan margin Yellow.ai berada di atas livechat popup (LiveChatPopup top: 76px, Yellow.ai bottom: 95px) */
    body.has-internal-livechat #ymDivBar,
    body.has-internal-livechat #ymDivCircle,
    body.has-internal-livechat #ymPluginDiv,
    body.has-internal-livechat #ym-chat-btn,
    body.has-internal-livechat .ym-chat-button,
    body.has-internal-livechat #ym-auto-pop-up-container,
    body:has(#livechat-popup-btn) #ymDivBar,
    body:has(#livechat-popup-btn) #ymDivCircle,
    body:has(#livechat-popup-btn) #ymPluginDiv,
    body:has(#livechat-popup-btn) #ym-chat-btn,
    body:has(#livechat-popup-btn) .ym-chat-button,
    body:has(#livechat-popup-btn) #ym-auto-pop-up-container {
      left: auto !important;
      right: 18px !important;
      bottom: 95px !important;
      z-index: 9996 !important;
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
  `;
}

/**
 * Check if the current authenticated session is a Pendaftar Vendor.
 */
export function isPendaftarVendorUser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('userRole') === 'Pendaftar Vendor';
  } catch (e) {
    return false;
  }
}

/**
 * Initialize / show the Yellow.ai live chat widget for all users on all pages,
 * positioned on the right side and stacked vertically with the internal live chat.
 */
export function initYellowChat(botId = DEFAULT_BOT_ID): void {
  if (typeof window === 'undefined') return;

  // Remove force-hide styles
  const hideStyle = document.getElementById(HIDE_STYLE_ID);
  if (hideStyle) {
    hideStyle.remove();
  }

  // Apply right alignment & stacked styles
  applyRightPositionStyle();

  window.ymConfig = {
    bot: botId,
    host: 'https://cloud.yellow.ai',
    ...(window.ymConfig || {}),
    alignLeft: false,
  };

  if (window.YellowMessengerPlugin?.show) {
    try {
      window.YellowMessengerPlugin.show();
    } catch (e) {
      // ignore
    }
  }

  // Listener event buka/tutup chat Yellow.ai
  if (!window.hasYellowEventListener) {
    window.hasYellowEventListener = true;
    window.addEventListener('message', (event) => {
      try {
        const eventCode = event.data?.event_code || event.data?.event;
        if (
          eventCode === 'ym-client-chat-opened' ||
          eventCode === 'chat-opened' ||
          eventCode === 'open'
        ) {
          document.body.classList.add('yellow-ai-is-open');
        } else if (
          eventCode === 'ym-client-chat-closed' ||
          eventCode === 'chat-closed' ||
          eventCode === 'close'
        ) {
          document.body.classList.remove('yellow-ai-is-open');
        }
      } catch (e) {}
    });
  }

  const existingScript = document.getElementById(SCRIPT_ID);
  if (!existingScript) {
    const d = document;
    const w = window;
    const i: any = function () {
      i.c(arguments);
    };
    i.q = [];
    i.c = function (e: any) {
      i.q.push(e);
    };
    w.YellowMessenger = i;

    const script = d.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.yellowmessenger.com/plugin/widget-v2/latest/dist/main.min.js';
    const firstScript = d.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      d.head.appendChild(script);
    }
  }
}

/**
 * Completely hide / suppress Yellow.ai live chat widget.
 */
export function hideYellowChat(): void {
  if (typeof window === 'undefined') return;

  if (window.YellowMessengerPlugin?.closeBot) {
    try {
      window.YellowMessengerPlugin.closeBot();
    } catch (e) {}
  }

  if (window.YellowMessengerPlugin?.hide) {
    try {
      window.YellowMessengerPlugin.hide();
    } catch (e) {}
  }

  if (!document.getElementById(HIDE_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = HIDE_STYLE_ID;
    style.innerHTML = `
      #ymPluginDiv, #ym-chat-btn, .ym-chat-button,
      [class*="yellowmessenger"], [id*="yellowmessenger"],
      iframe[id*="ym-"], iframe[id*="yellow"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Open the Yellow.ai live chat widget.
 */
export function openYellowChat(): void {
  if (typeof window === 'undefined') return;

  document.body.classList.add('yellow-ai-is-open');

  // Make sure it's initialized and unhidden
  initYellowChat();

  // If plugin is available, show and open bot
  if (window.YellowMessengerPlugin?.show) {
    try {
      window.YellowMessengerPlugin.show();
    } catch (e) {}
  }

  if (window.YellowMessengerPlugin?.openBot) {
    try {
      window.YellowMessengerPlugin.openBot();
      return;
    } catch (e) {}
  }

  // Fallback direct activator or YellowMessenger method
  if (typeof window.YellowMessenger === 'function') {
    try {
      window.YellowMessenger('openChat');
      return;
    } catch (e) {}
  }

  // Fallback: trigger click on Yellow.ai launcher button in DOM if present
  const yellowLauncher = document.querySelector<HTMLElement>(
    '#ymDivBar, #ymDivCircle, #ymPluginDiv, #ym-chat-btn, .ym-chat-button, [class*="yellowmessenger"], [id*="yellowmessenger"]'
  );
  if (yellowLauncher) {
    yellowLauncher.click();
  }
}

/**
 * Toggle the Yellow.ai live chat widget.
 */
export function toggleYellowChat(): void {
  if (typeof window === 'undefined') return;

  if (window.YellowMessengerPlugin?.toggleChat) {
    try {
      window.YellowMessengerPlugin.toggleChat();
      return;
    } catch (e) {}
  }

  openYellowChat();
}
