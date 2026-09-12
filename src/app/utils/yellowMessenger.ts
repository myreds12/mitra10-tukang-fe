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
  }
}

const DEFAULT_BOT_ID = 'x1657090256339';
const HIDE_STYLE_ID = 'hide-yellow-ai-style';
const SCRIPT_ID = 'yellow-ai-web-widget-script';

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
 * Initialize / show the Yellow.ai live chat widget for Pendaftar Vendor.
 */
export function initYellowChat(botId = DEFAULT_BOT_ID): void {
  if (typeof window === 'undefined') return;

  // Remove force-hide styles
  const hideStyle = document.getElementById(HIDE_STYLE_ID);
  if (hideStyle) {
    hideStyle.remove();
  }

  window.ymConfig = { bot: botId, host: 'https://cloud.yellow.ai' };

  if (window.YellowMessengerPlugin?.show) {
    try {
      window.YellowMessengerPlugin.show();
    } catch (e) {
      // ignore
    }
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
 * Completely hide / suppress Yellow.ai live chat widget when not logged in as Pendaftar Vendor.
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
    '#ymPluginDiv, #ym-chat-btn, .ym-chat-button, [class*="yellowmessenger"], [id*="yellowmessenger"]'
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
