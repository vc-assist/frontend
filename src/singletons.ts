import type { Config } from "@/lib/config"
import type { NativeAPI } from "@/lib/native"

// @ts-expect-error
export const config: Config = __CONFIG__

// @ts-expect-error
export const native: NativeAPI = (await import("/native_api.js")).default

