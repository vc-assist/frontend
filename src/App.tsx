import { StudentDataService } from "@backend.studentdata/api_connect"
import {
  type CredentialStatus,
  RefreshDataRequest,
} from "@backend.studentdata/api_pb"
import type { StudentData } from "@backend.studentdata/student_data_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { persistentSignal } from "@vcassist/ui"
import { useState } from "react"
import { z } from "zod"
import { LoginPage } from "./auth"
import { fnSpan } from "./auth/internal"
import { ProvideCredentialsPage } from "./credentials"
import {
  CredentialsProvider,
  StudentDataProvider,
  StudentDataRefetchProvider,
  type UserContext,
  UserProvider,
} from "./providers"
import { Routes } from "./routes"
import { config } from "./singletons"
import { StudentDataLoadingPage } from "./studentdata"

const token = persistentSignal({
  key: "token",
  schema: z.string(),
  defaultValue: "",
})

export function createClient(token: string) {
  const authHeader = `Bearer ${token}`
  const transport = createConnectTransport({
    baseUrl: config.endpoints.student_data_service,
    interceptors: [
      (next) => (req) => {
        req.header.append("Authorization", authHeader)
        return next(req)
      },
    ],
  })
  return createPromiseClient(StudentDataService, transport)
}

export function App() {
  const [user, setUser] = useState<UserContext>()
  const [completedCreds, setCompletedCreds] = useState<CredentialStatus[]>()
  const [studentData, setStudentData] = useState<StudentData>()

  if (!user) {
    return (
      <LoginPage
        token={token.value}
        onLogin={(newToken, profile) => {
          token.value = newToken
          const studentDataClient = createClient(newToken)
          setUser({
            profile,
            studentDataClient,
            logout: () => {
              setUser(undefined)
              setCompletedCreds(undefined)
              setStudentData(undefined)
              token.value = ""
            },
          })
        }}
      />
    )
  }
  if (!completedCreds) {
    return (
      <UserProvider value={user}>
        <ProvideCredentialsPage
          onComplete={(creds) => {
            setCompletedCreds(creds)
          }}
        />
      </UserProvider>
    )
  }
  if (!studentData) {
    return (
      <UserProvider value={user}>
        <CredentialsProvider value={completedCreds}>
          <StudentDataLoadingPage
            onLoad={(data) => {
              setStudentData(data)
            }}
          />
        </CredentialsProvider>
      </UserProvider>
    )
  }

  return (
    <UserProvider value={user}>
      <CredentialsProvider value={completedCreds}>
        <StudentDataRefetchProvider
          value={() => {
            return fnSpan(undefined, "refetchStudentData", async () => {
              const res = await user.studentDataClient.refreshData(
                new RefreshDataRequest(),
              )
              if (!res.refreshed) {
                throw new Error("Empty refreshed data!")
              }
              setStudentData(res.refreshed)
            })
          }}
        >
          <StudentDataProvider value={studentData}>
            <Routes />
          </StudentDataProvider>
        </StudentDataRefetchProvider>
      </CredentialsProvider>
    </UserProvider>
  )
}
