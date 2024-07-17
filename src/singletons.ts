import type { Config } from "@/lib/config"
import type { NativeAPI } from "@/lib/native/core";

// @ts-expect-error
export const native: NativeAPI = undefined

// @ts-expect-error
export const config: Config = __CONFIG__
