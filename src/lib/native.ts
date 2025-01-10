import type { SafeAreaInsets } from "@vcassist/ui"
import type { NativeAPI, Unsubscriber } from "./oauth"

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

async function loadNativeAPI(): Promise<NativeAPI> {
  // the module name is put in a variable to prevent vite from doing any smart tricks with path resolution
  // on the dynamic import and messing with the path
  const module = "../../native_api.js"

  try {
    const imported = (
      await import(
        /* @vite-ignore */
        module
      )
    ).default
    if (imported) {
      console.log("Loaded native API from ES Module.")
      return imported
    }
  } catch {}

  // @ts-expect-error
  if (globalThis.nativeAPI) {
    console.log("Loaded native API from global variable.")
    // @ts-expect-error
    return nativeAPI
  }

  console.log("Loaded no-op API.")
  return new NoopAPI()
}

export const native = await loadNativeAPI()
