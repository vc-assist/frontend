import { readFileSync } from "node:fs"
import path from "node:path"
import JSON5 from "json5"
import merge from "lodash.merge"
import { z } from "zod"

export const configSchema = z.object({
  environment: z.enum(["dev", "prod"] as const),
  endpoints: z.object({
    traces: z.object({
      http_endpoint: z.string(),
      headers: z.record(z.string(), z.string()).optional(),
    }),
    metrics: z.object({
      http_endpoint: z.string(),
      headers: z.record(z.string(), z.string()).optional(),
    }),
    sis_service: z.string(),
    auth_service: z.string(),
  }),
})

export type Config = z.TypeOf<typeof configSchema>

export function loadConfig(): z.TypeOf<typeof configSchema> {
  const defaultConfigJson = readFileSync(
    path.join(__dirname, "../../config.json5"),
    "utf8",
  )
  const defaultConfig = configSchema.parse(JSON5.parse(defaultConfigJson))

  try {
    const localConfigJson = readFileSync(
      path.join(__dirname, "../../config.local.json5"),
      "utf8",
    )
    const localConfig = configSchema
      .deepPartial()
      .parse(JSON5.parse(localConfigJson))
    return merge(defaultConfig, localConfig)
  } catch (e) {
    if (!(e instanceof Error)) {
      throw new Error(String(e))
    }
  }

  return defaultConfig
}
