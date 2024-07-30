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
  onWebviewNavigate(fn: (url: string) => void): Promise<() => Promise<void>>
  /**
   * Should fire an event when the alternate webview closes.
   */
  onWebviewClosed(fn: () => void): Promise<() => Promise<void>>
}

export class NoopAPI implements NativeAPI {
  launchUrl(url: string): Promise<void> {
    throw new Error("Cannot call method on no-op api.")
  }
  userAgent(): Promise<string> {
    throw new Error("Cannot call method on no-op api.")
  }

  openWebview(url: string, userAgent?: string): Promise<void> {
    throw new Error("Cannot call method on no-op api.")
  }
  closeWebview(): Promise<void> {
    throw new Error("Cannot call method on no-op api.")
  }
  onWebviewNavigate(fn: (url: string) => void): Promise<() => Promise<void>> {
    throw new Error("Cannot call method on no-op api.")
  }
  onWebviewClosed(fn: () => void): Promise<() => Promise<void>> {
    throw new Error("Cannot call method on no-op api.")
  }
}

