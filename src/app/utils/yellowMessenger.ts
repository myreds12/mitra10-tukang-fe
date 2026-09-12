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

/**
 * Open the Yellow.ai live chat widget.
 */
export function openYellowChat(): void {
  if (typeof window === 'undefined') return;

  // If plugin is available, show and open bot
  if (window.YellowMessengerPlugin?.show) {
    try {
      window.YellowMessengerPlugin.show();
    } catch (e) {
      // ignore
    }
  }

  if (window.YellowMessengerPlugin?.openBot) {
    try {
      window.YellowMessengerPlugin.openBot();
      return;
    } catch (e) {
      // fallback below
    }
  }

  // Fallback direct activator or YellowMessenger method
  if (typeof window.YellowMessenger === 'function') {
    try {
      window.YellowMessenger('openChat');
      return;
    } catch (e) {
      // fallback
    }
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
    } catch (e) {
      // fallback
    }
  }

  openYellowChat();
}
