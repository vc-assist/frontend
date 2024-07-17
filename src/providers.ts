import { context, type UserProfile } from "@vcassist/ui";
import type { PromiseClient } from "@connectrpc/connect";
import type { StudentDataService } from "@backend.studentdata/api_connect";
import type { StudentData } from "@backend.studentdata/student_data_pb";

export type UserContext = {
  studentDataClient: PromiseClient<typeof StudentDataService>
  profile: UserProfile
}

export const [UserProvider, useUser] = context<UserContext>()

export const [StudentDataProvider, useStudentData] = context<StudentData>()

