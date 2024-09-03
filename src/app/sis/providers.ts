import type { SIService } from "@backend.sis/api_connect"
import type { Data as SISData } from "@backend.sis/api_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { context } from "@vcassist/ui"

export const [SISClientProvider, useSISClient] =
  context<PromiseClient<typeof SIService>>()

export const [SISDataProvider, useSISData] = context<SISData>()
