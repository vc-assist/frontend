import type { StudentDataService } from "@backend.studentdata/api_connect"
import type { CredentialStatus } from "@backend.studentdata/api_pb"
import type { StudentData } from "@backend.studentdata/student_data_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { type UserProfile, context } from "@vcassist/ui"

export type UserContext = {
  studentDataClient: PromiseClient<typeof StudentDataService>
  profile: UserProfile
  logout(): void
}

export const [UserProvider, useUser] = context<UserContext>()

export const [CredentialsProvider, useCredentials] =
  context<CredentialStatus[]>()

export const [StudentDataProvider, useStudentData] = context<StudentData>()
export const [StudentDataRefetchProvider, useStudentDataRefetch] =
  context<() => Promise<void>>()
