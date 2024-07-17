import { readFileSync } from "node:fs"
import JSON5 from "json5"
import merge from "lodash.merge"
import { z } from "zod"

export const configSchema = z.object({
  environment: z.enum(["dev", "prod"] as const),
  endpoints: z.object({
    traces_otlp_http: z.string(),
    metrics_otlp_http: z.string(),
    student_data_service: z.string(),
    auth_service: z.string(),
  }),
})

export type Config = z.TypeOf<typeof configSchema>

export function loadConfig(): z.TypeOf<typeof configSchema> {
  const defaultConfigJson = readFileSync("config.json5", "utf8")
  const defaultConfig = configSchema.parse(JSON5.parse(defaultConfigJson))

  const localConfigJson = readFileSync("config.local.json5", "utf8")
  const localConfig = configSchema
    .deepPartial()
    .parse(JSON5.parse(localConfigJson))

  return merge(defaultConfig, localConfig)
}
