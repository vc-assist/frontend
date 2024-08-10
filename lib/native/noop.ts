import type { SafeArea } from "@vcassist/ui"
import type { NativeAPI, Unsubscriber } from "."

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
  onSafeAreaChange(fn: (safeArea: SafeArea) => void): Unsubscriber {
    fn({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    })
    return Promise.resolve(() => Promise.resolve())
  }
}
