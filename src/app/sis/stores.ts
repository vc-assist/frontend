import type { SIService } from "@backend.sis/api_connect"
import type { Data } from "@backend.sis/api_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { create } from "zustand"

export type SISContext = {
  client: PromiseClient<typeof SIService>
  data: Data
  refetch(): Promise<void>
}

export const useSISContext = create<SISContext>((set) => ({
  client: undefined as unknown as PromiseClient<typeof SIService>,
  data: undefined as unknown as Data,
  async refetch() {
    const res = await this.client.getData({})
    set({ data: res.data })
  },
}))
