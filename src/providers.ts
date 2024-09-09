import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import { type UserProfile, context } from "@vcassist/ui"

export type UserContext = {
  profile: UserProfile
  logout(): void
}

export const [UserProvider, useUser] = context<UserContext>()
export const [CredentialsProvider, useCredentials] =
  context<CredentialStatus[]>()
export const [DataRefetchProvider, useDataRefetch] =
  context<() => Promise<void>>()
export const [ReturnHomeProvider, useReturnHome] = context<
  (() => void) | undefined
>()
