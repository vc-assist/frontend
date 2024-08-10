import type { SafeArea } from "@vcassist/ui"

export type Unsubscriber = Promise<() => Promise<void>>

export interface NativeAPI {
  /**
   * Launches a url in the browser.
   *
   * Should also handle `mailto:` urls properly.
   */
  launchUrl(url: string): Promise<void>
  /**
   * Returns the user agent of the device.
   */
  userAgent(): Promise<string>

  /**
   * Should open the alternate webview window.
   */
  openWebview(url: string, userAgent?: string): Promise<void>
  /**
   * Should close the alternate webview window.
   */
  closeWebview(): Promise<void>

  /**
   * Should fire an event whenever the alternate webview navigates.
   */
  onWebviewNavigate(fn: (url: string) => void): Unsubscriber
  /**
   * Should fire an event when the alternate webview closes.
   */
  onWebviewClosed(fn: () => void): Unsubscriber
  /**
   * Should listen to safe area changes (and the initial safe area).
   */
  onSafeAreaChange(fn: (safeArea: SafeArea) => void): Unsubscriber
}
