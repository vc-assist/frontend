import type { Config } from "@/lib/config"
import type { NativeAPI } from "@/lib/native"
import NoopAPI from "@/lib/native/noop"

// @ts-expect-error
export const config: Config = __CONFIG__

async function loadNativeAPI(): Promise<NativeAPI> {
  // the module name is put in a variable to prevent vite from doing any smart tricks with path resolution
  // on the dynamic import and messing with the path
  const module = "./native_api.js"

  try {
    const imported = (await import(module)).default
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
