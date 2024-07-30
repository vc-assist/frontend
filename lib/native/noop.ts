import type { NativeAPI } from "."

export default class NoopAPI implements NativeAPI {
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

