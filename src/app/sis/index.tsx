import {
  CredentialsProvider,
  DataRefetchProvider,
  useReturnHome,
} from "@/src/providers"
import { config } from "@/src/singletons"
import { IconButton, Positioned, createFnSpanner } from "@/ui"
import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import { SIService } from "@backend.sis/api_connect"
import { RefreshDataRequest, type Data as SISData } from "@backend.sis/api_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { useSignals } from "@preact/signals-react/runtime"
import { useMemo, useState } from "react"
import { MdArrowBack } from "react-icons/md"
import { SISCredentialsPage } from "./credentials"
import { SISDataLoadingPage } from "./data-loading"
import { SISClientProvider, SISDataProvider } from "./providers"
import { Routes } from "./routes"

const fnSpan = createFnSpanner("app")

export default function SISModule(props: { token: string }) {
  useSignals()

  const sisClient = useMemo(() => {
    const authHeader = `Bearer ${props.token}`
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
  }, [props.token])

  const returnHome = useReturnHome()
  const [completedCreds, setCompletedCreds] = useState<CredentialStatus[]>()
  const [data, setData] = useState<SISData>()

  if (!completedCreds) {
    return (
      <div className="flex w-full h-full">
        <SISClientProvider value={sisClient}>
          <SISCredentialsPage
            onComplete={(creds) => {
              setCompletedCreds(creds)
            }}
          />
          {returnHome ? (
            <Positioned x="left" y="top" padding="2rem">
              <IconButton
                icon={MdArrowBack}
                label="Home"
                color="dark"
                horizontal
                onClick={returnHome}
              />
            </Positioned>
          ) : undefined}
        </SISClientProvider>
      </div>
    )
  }
  if (!data || !sisClient) {
    return (
      <SISClientProvider value={sisClient}>
        <CredentialsProvider value={completedCreds}>
          <SISDataLoadingPage
            onLoad={(data) => {
              setData(data)
            }}
          />
        </CredentialsProvider>
      </SISClientProvider>
    )
  }

  return (
    <SISClientProvider value={sisClient}>
      <CredentialsProvider value={completedCreds}>
        <DataRefetchProvider
          value={() => {
            return fnSpan(undefined, "refetchStudentData", async () => {
              const res = await sisClient.refreshData(new RefreshDataRequest())
              if (!res.data) {
                throw new Error("Empty refreshed data!")
              }
              setData(res.data)
            })
          }}
        >
          <SISDataProvider value={data}>
            <Routes />
          </SISDataProvider>
        </DataRefetchProvider>
      </CredentialsProvider>
    </SISClientProvider>
  )
}
