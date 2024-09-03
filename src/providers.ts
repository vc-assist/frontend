import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import type { SIService } from "@backend.sis/api_connect"
import type { Data as SISData } from "@backend.sis/api_pb"
import type { MoodleService as VCMoodleService } from "@backend.vcmoodle/api_connect"
import type { GetCoursesResponse as VCMoodleData } from "@backend.vcmoodle/api_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { type UserProfile, context } from "@vcassist/ui"

export type UserContext = {
  profile: UserProfile
  logout(): void
}

export const [SISClientProvider, useSISClient] =
  context<PromiseClient<typeof SIService>>()
export const [VCMoodleClientProvider, useVCMoodleClient] =
  context<PromiseClient<typeof VCMoodleService>>()
export const [SISDataProvider, useSISData] = context<SISData>()
export const [VCMoodleDataProvider, useVCMoodleData] = context<VCMoodleData>()

export const [UserProvider, useUser] = context<UserContext>()
export const [CredentialsProvider, useCredentials] =
  context<CredentialStatus[]>()
export const [DataRefetchProvider, useDataRefetch] =
  context<() => Promise<void>>()
export const [ReturnHomeProvider, useReturnHome] = context<
  (() => void) | undefined
>()
