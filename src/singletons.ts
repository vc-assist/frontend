import type { Config } from "@/lib/config"
import type { NativeAPI } from "@/lib/native"
import NoopAPI from "@/lib/native/noop"

// @ts-expect-error
export const config: Config = __CONFIG__

async function loadNativeAPI(): Promise<NativeAPI> {
  try {
    // @ts-expect-error
    return (await import("/native_api.js")).default
  } catch { }
  return new NoopAPI()
}

export const native = await loadNativeAPI()
