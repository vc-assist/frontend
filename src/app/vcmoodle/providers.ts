import type { MoodleService as VCMoodleService } from "@backend.vcmoodle/api_connect"
import type { Course } from "@backend.vcmoodle/api_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { context } from "@vcassist/ui"

export const [VCMoodleClientProvider, useVCMoodleClient] =
  context<PromiseClient<typeof VCMoodleService>>()

export const [VCMoodleDataProvider, useVCMoodleData] = context<Course[]>()
