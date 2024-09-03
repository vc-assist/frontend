import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import { SIService } from "@backend.sis/api_connect"
import { type Data, RefreshDataRequest } from "@backend.sis/api_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { useSignals } from "@preact/signals-react/runtime"
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
    baseUrl: config.endpoints.vcassist_backend,
    interceptors: [
      (next) => (req) => {
        req.header.append("Authorization", authHeader)
        return next(req)
      },
    ],
  })
  return createPromiseClient(SIService, transport)
}

export function App() {
  useSignals()

  const [user, setUser] = useState<UserContext>()
  const [completedCreds, setCompletedCreds] = useState<CredentialStatus[]>()
  const [studentData, setStudentData] = useState<Data>()

  if (!user) {
    return (
      <LoginPage
        token={token.value}
        onLogin={(newToken, profile) => {
          token.value = newToken
          const sisClient = createClient(newToken)
          setUser({
            profile,
            sisClient,
            logout: () => {
              setUser(undefined)
              setCompletedCreds(undefined)
              setStudentData(undefined)
              token.value = ""
            },
          })
        }}
        onInvalidToken={() => {
          token.value = ""
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
              const res = await user.sisClient.refreshData(
                new RefreshDataRequest(),
              )
              if (!res.data) {
                throw new Error("Empty refreshed data!")
              }
              setStudentData(res.data)
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
