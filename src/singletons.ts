import type { Config } from "@/lib/config"
import type { NativeAPI } from "@/lib/native"
import NoopAPI from "@/lib/native/noop"

// @ts-expect-error
export const config: Config = __CONFIG__

async function loadNativeAPI(): Promise<NativeAPI> {
  // @ts-expect-error
  const imported = await import("native_api.js").default
  if (imported) {
    return imported
  }

  // @ts-expect-error
  if (globalThis.nativeAPI) {
    // @ts-expect-error
    return nativeAPI
  }

  return new NoopAPI()
}

export const native = await loadNativeAPI()

console.log("native api", native)
