import type { Config } from "@/lib/config"
import type { NativeAPI } from "@/lib/native/core"

// @ts-expect-error
export const config: Config = __CONFIG__

export const native: NativeAPI = config.target === "capacitor" ?
  new (await import("@/lib/native/capacitor")).CapacitorAPI() :
  (() => {
    throw new Error(`Unknown config.target ${config.target}`)
  })()
