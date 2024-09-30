import type { MoodleService as VCMoodleService } from "@backend.vcmoodle/api_connect"
import type { Course } from "@backend.vcmoodle/api_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { create } from "zustand"

export type MoodleContext = {
  client: PromiseClient<typeof VCMoodleService>
  data: Course[]
  refetch(): Promise<void>
}

export const useMoodleContext = create<MoodleContext>((set) => ({
  client: undefined as unknown as PromiseClient<typeof VCMoodleService>,
  data: undefined as unknown as Course[],
  async refetch() {
    const res = await this.client.getCourses({})
    set({ data: res.courses })
  },
}))
