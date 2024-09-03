import {
  getOAuthLoginUrl,
  getTokenFormData,
  openIdTokenResponse,
} from "@/lib/oauth"
import { useUser } from "@/src/providers"
import type { CredentialStatus } from "@backend.keychain/auth_flow_pb"
import type { SIService } from "@backend.sis/api_connect"
import {
  GetCredentialStatusRequest,
  ProvideCredentialRequest,
} from "@backend.sis/api_pb"
import type { PromiseClient } from "@connectrpc/connect"
import { SpanStatusCode } from "@opentelemetry/api"
import { createFnSpanner, narrowError } from "@vcassist/ui"
import { CredentialFlow, type CredentialState } from "@vcassist/ui"
import { useRef } from "react"
import { native } from "../../singletons"
import { useSISClient } from "./providers"

const fnSpan = createFnSpanner("credentials")

function sisUserpassForm(
  sisClient: PromiseClient<typeof SIService>,
  status: CredentialStatus,
): CredentialState {
  if (!status.loginFlow.value) {
    throw new Error("loginFlow is undefined.")
  }
  if (status.loginFlow.case !== "usernamePassword") {
    throw new Error("not username password login flow")
  }

  return {
    name: status.name,
    provided: status.provided,
    picture: status.picture,
    loginFlow: {
      type: "usernamePassword",
      async onSubmit(username: string, password: string) {
        await sisClient.provideCredential(
          new ProvideCredentialRequest({
            credential: {
              case: "usernamePassword",
              value: { username, password },
            },
          }),
        )
      },
    },
  }
}

function sisOAuthForm(
  sisClient: PromiseClient<typeof SIService>,
  status: CredentialStatus,
): CredentialState {
  const loginFlow = status.loginFlow
  if (!loginFlow.value) {
    throw new Error("loginFlow is undefined.")
  }
  if (loginFlow.case !== "oauth") {
    throw new Error("not oauth login flow")
  }

  return {
    name: status.name,
    provided: status.provided,
    picture: status.picture,
    loginFlow: {
      type: "oauth",
      onStart() {
        return fnSpan(
          undefined,
          "intercept-token",
          async (span) => {
            return new Promise<void>((resolve, reject) => {
              ;(async () => {
                try {
                  span.addEvent(
                    "Opening webview - iOS wants a listener BEFORE loading URLs.",
                  )

                  const loginUrl = getOAuthLoginUrl(loginFlow.value)
                  span.setAttribute("loginUrl", loginUrl)

                  const userAgent = await native.userAgent()
                  await native.openWebview(loginUrl, userAgent)

                  const unsubscribeNav = await native.onWebviewNavigate(
                    async (urlStr) => {
                      span.addEvent("got token request!", { url: urlStr })

                      try {
                        const url = new URL(urlStr)
                        const code = url.searchParams.get("code")
                        if (!code) {
                          span.setStatus({
                            code: SpanStatusCode.ERROR,
                            message: "no token in url",
                          })
                          return
                        }

                        span.addEvent("requesting tokenFormData")
                        const tokenForm = getTokenFormData(
                          code,
                          loginFlow.value,
                        )
                        console.log("starting tokenForm Request")
                        const res = await fetch(
                          loginFlow.value.tokenRequestUrl,
                          {
                            method: "POST",
                            body: tokenForm,
                          },
                        )

                        const resText = await res.text()
                        const token = openIdTokenResponse.parse(
                          JSON.parse(resText),
                        )
                        console.log(token)

                        span.addEvent("submitting tokens to server!")

                        await sisClient.provideCredential(
                          new ProvideCredentialRequest({
                            credential: {
                              case: "token",
                              value: {
                                token: resText,
                              },
                            },
                          }),
                        )

                        console.log("done.")

                        resolve()

                        await native.closeWebview() // This is similar to the handler, in that it will not run if the webview is removed prematurely. No clue why.
                        await unsubscribeNav?.()
                      } catch (e) {
                        span.recordException(narrowError(e))
                        span.setStatus({
                          code: SpanStatusCode.ERROR,
                          message: "Submit token failure.",
                        })

                        reject(e)

                        await unsubscribeNav?.()
                        await native.closeWebview()
                      }

                      span.end()
                    },
                  )

                  const unsubscribeClosed = await native.onWebviewClosed(
                    async () => {
                      await unsubscribeClosed?.()
                    },
                  )
                } catch (e) {
                  span.recordException(narrowError(e))
                  span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: "Webview error.",
                  })
                  span.end()

                  reject(e)
                }
              })()
            })
          },
          true,
        )
      },
    },
  }
}

export function SISCredentialsPage(props: {
  onComplete: (credentials: CredentialStatus[]) => void
}) {
  const { profile } = useUser()
  const sisClient = useSISClient()
  const statuses = useRef<CredentialStatus[]>([])

  return (
    <CredentialFlow
      queryKey={["getCredentials", "sis", profile.email]}
      profile={profile}
      getCredentialStatuses={async (): Promise<CredentialState[]> => {
        const res = await sisClient.getCredentialStatus(
          new GetCredentialStatusRequest(),
        )
        if (!res.status) {
          throw new Error("Credential status is undefined.")
        }
        statuses.current = [res.status]

        switch (res.status.loginFlow.case) {
          case "usernamePassword":
            return [sisUserpassForm(sisClient, res.status)]
          case "oauth":
            return [sisOAuthForm(sisClient, res.status)]
        }
        return []
      }}
      onComplete={() => props.onComplete(statuses.current)}
    />
  )
}
