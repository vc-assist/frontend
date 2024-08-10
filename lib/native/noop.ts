import type { SafeArea } from "@vcassist/ui"
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

  safeArea(): Promise<SafeArea> {
    return Promise.resolve({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    })
  }
}

