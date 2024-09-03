import {
  CredentialsProvider,
  DataRefetchProvider,
  useReturnHome,
} from "@/src/providers"
import { config } from "@/src/singletons"
import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import { MoodleService } from "@backend.vcmoodle/api_connect"
import type { GetCoursesResponse } from "@backend.vcmoodle/api_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { useSignals } from "@preact/signals-react/runtime"
import { IconButton, Positioned } from "@vcassist/ui"
import { useMemo, useState } from "react"
import { MdArrowBack } from "react-icons/md"
import { VCMoodleCredentialsPage } from "./credentials"
import { VCMoodleDataLoadingPage } from "./data-loading"
import { VCMoodleClientProvider, VCMoodleDataProvider } from "./providers"
import { Routes } from "./routes"

export default function VCMoodleModule(props: { token: string }) {
  useSignals()

  const vcmoodleClient = useMemo(() => {
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
    return createPromiseClient(MoodleService, transport)
  }, [props.token])

  const returnHome = useReturnHome()
  const [completedCreds, setCompletedCreds] = useState<CredentialStatus[]>()
  const [data, setData] = useState<GetCoursesResponse>()

  if (!completedCreds) {
    return (
      <VCMoodleClientProvider value={vcmoodleClient}>
        <div className="flex w-full h-full">
          <VCMoodleCredentialsPage
            onComplete={(creds) => {
              setCompletedCreds(creds)
            }}
          />
          {returnHome ? (
            <Positioned x="left" y="top" padding="2rem">
              <IconButton
                icon={MdArrowBack}
                label="Back"
                color="dark"
                horizontal
                onClick={returnHome}
              />
            </Positioned>
          ) : undefined}
        </div>
      </VCMoodleClientProvider>
    )
  }
  if (!data || !vcmoodleClient) {
    return (
      <VCMoodleClientProvider value={vcmoodleClient}>
        <CredentialsProvider value={completedCreds}>
          <VCMoodleDataLoadingPage
            onLoad={(data) => {
              setData(data)
            }}
          />
        </CredentialsProvider>
      </VCMoodleClientProvider>
    )
  }

  return (
    <VCMoodleClientProvider value={vcmoodleClient}>
      <CredentialsProvider value={completedCreds}>
        <DataRefetchProvider
          value={() => {
            throw new Error("Currently unimplmented!")
          }}
        >
          <VCMoodleDataProvider value={data}>
            <Routes />
          </VCMoodleDataProvider>
        </DataRefetchProvider>
      </CredentialsProvider>
    </VCMoodleClientProvider>
  )
}
