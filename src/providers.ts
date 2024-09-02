import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import type { SIService } from "@backend.sis/api_connect"
import type { Data } from "@backend.sis/api_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { type UserProfile, context } from "@vcassist/ui"

export type UserContext = {
  studentDataClient: PromiseClient<typeof SIService>
  profile: UserProfile
  logout(): void
}

export const [UserProvider, useUser] = context<UserContext>()

export const [CredentialsProvider, useCredentials] =
  context<CredentialStatus[]>()

export const [StudentDataProvider, useStudentData] = context<Data>()
export const [StudentDataRefetchProvider, useStudentDataRefetch] =
  context<() => Promise<void>>()
