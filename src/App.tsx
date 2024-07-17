import { StudentDataService } from "@backend.studentdata/api_connect"
import type { StudentData } from "@backend.studentdata/student_data_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { persistentSignal } from "@vcassist/ui"
import { useState } from "react"
import { z } from "zod"
import { LoginPage } from "./auth"
import { ProvideCredentialsPage } from "./credentials"
import { config } from "./singletons"
import { StudentDataProvider, UserProvider, type UserContext } from "./providers"
import { StudentDataLoadingPage } from "./studentdata"
import { Routes } from "./routes"

const token = persistentSignal({
  key: "token",
  schema: z.string(),
  defaultValue: ""
})

export function createClient(token: string) {
  const authHeader = `Bearer ${token}`
  const transport = createConnectTransport({
    baseUrl: config.endpoints.student_data_service,
    interceptors: [
      (next) => (req) => {
        req.header.append("Authorization", authHeader)
        return next(req)
      }
    ],
  })
  return createPromiseClient(StudentDataService, transport)
}

export function App() {
  const [user, setUser] = useState<UserContext>()
  const [completedCreds, setCompletedCreds] = useState(false)
  const [studentData, setStudentData] = useState<StudentData>()

  if (!user) {
    return (
      <LoginPage
        token={token.value}
        onLogin={(newToken, profile) => {
          token.value = newToken
          const studentDataClient = createClient(newToken)
          setUser({ profile, studentDataClient })
        }}
      />
    )
  }
  if (!completedCreds) {
    return (
      <UserProvider value={user}>
        <ProvideCredentialsPage
          onComplete={() => {
            setCompletedCreds(true)
          }}
        />
      </UserProvider>
    )
  }
  if (!studentData) {
    return (
      <UserProvider value={user}>
        <StudentDataLoadingPage
          onLoad={(data) => {
            setStudentData(data)
          }}
        />
      </UserProvider>
    )
  }

  return (
    <UserProvider value={user}>
      <StudentDataProvider value={studentData}>
        <Routes />
      </StudentDataProvider>
    </UserProvider>
  )
}
