import type { SafeAreaInsets } from "@vcassist/ui"
import type { NativeAPI, Unsubscriber } from "."

export default class NoopAPI implements NativeAPI {
  launchUrl(): Promise<void> {
    console.warn("noop:launchUrl()")
    return Promise.resolve()
  }
  userAgent(): Promise<string> {
    console.warn("noop:userAgent()")
    return Promise.resolve("")
  }

  openWebview(): Promise<void> {
    console.warn("noop:openWebview()")
    return Promise.resolve()
  }
  closeWebview(): Promise<void> {
    console.warn("noop:closeWebview()")
    return Promise.resolve()
  }
  onWebviewNavigate(): Promise<() => Promise<void>> {
    console.warn("noop:onWebviewNavigate()")
    return Promise.resolve(() => Promise.resolve())
  }
  onWebviewClosed(): Promise<() => Promise<void>> {
    console.warn("noop:onWebviewClosed()")
    return Promise.resolve(() => Promise.resolve())
  }
  onSafeAreaChange(fn: (safeArea: SafeAreaInsets) => void): Unsubscriber {
    console.warn("noop:onSafeAreaChange()")
    fn({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    })
    return Promise.resolve(() => Promise.resolve())
  }
}
