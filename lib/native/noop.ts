import type { NativeAPI } from "."

export default class NoopAPI implements NativeAPI {
  launchUrl(): Promise<void> {
    return Promise.resolve()
  }
  userAgent(): Promise<string> {
    return Promise.resolve("")
  }

  openWebview(): Promise<void> {
    return Promise.resolve()
  }
  closeWebview(): Promise<void> {
    return Promise.resolve()
  }
  onWebviewNavigate(): Promise<() => Promise<void>> {
    return Promise.resolve(() => Promise.resolve())
  }
  onWebviewClosed(): Promise<() => Promise<void>> {
    return Promise.resolve(() => Promise.resolve())
  }
}

