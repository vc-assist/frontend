import { z } from "zod"
import { readFileSync } from "node:fs"
import JSON5 from "json5"
import merge from "lodash.merge"

export const configSchema = z.object({
  traces_otlp_http_endpoint: z.string(),
  environment: z.enum(["dev", "prod"] as const)
})

export type Config = z.TypeOf<typeof configSchema>

export function loadConfig(): z.TypeOf<typeof configSchema> {
  const defaultConfigJson = readFileSync("config.json5", "utf8")
  const defaultConfig = configSchema.parse(JSON5.parse(defaultConfigJson))

  const localConfigJson = readFileSync("config.local.json5", "utf8")
  const localConfig = configSchema.deepPartial().parse(JSON5.parse(localConfigJson))

  return merge(defaultConfig, localConfig)
}

