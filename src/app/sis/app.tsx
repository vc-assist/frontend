import {
  getOAuthLoginUrl,
  getTokenFormData,
  openIdTokenResponse,
} from "@/lib/oauth"
import { config, native } from "@/src/singletons"
import { SIService } from "@backend.sis/api_connect"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { SpanStatusCode } from "@opentelemetry/api"
import {
  type CredentialState,
  createFnSpanner,
  narrowError,
} from "@vcassist/ui"
import { MdCalculate, MdDashboard, MdTimeline } from "react-icons/md"
import type { AppModule } from "../App"
import Dashboard from "./routes/dashboard"
import GradeCalculator from "./routes/grade-calculator"
import GradeTrends from "./routes/grade-trends"
import { useSISContext } from "./stores"

const fnSpan = createFnSpanner("credentials")

export const sisModule: AppModule = {
  async afterLogin(token) {
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
    const client = createPromiseClient(SIService, transport)
    useSISContext.setState({ client })

    const res = await client.getCredentialStatus({})
    const status = res.status
    const loginFlow = res.status?.loginFlow
    if (!status || !loginFlow) {
      throw new Error("loginFlow is undefined.")
    }

    let credentialState: CredentialState
    switch (loginFlow.case) {
      case "usernamePassword":
        credentialState = {
          name: status.name,
          provided: status.provided,
          picture: status.picture,
          loginFlow: {
            type: "usernamePassword",
            async onSubmit(username: string, password: string) {
              await client.provideCredential({
                credential: {
                  case: "usernamePassword",
                  value: { username, password },
                },
              })
            },
          },
        }
        break
      case "oauth":
        credentialState = {
          name: "PowerSchool",
          provided: res.status?.provided ?? false,
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

                              await client.provideCredential({
                                credential: {
                                  case: "token",
                                  value: {
                                    token: resText,
                                  },
                                },
                              })

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
        break
      case undefined:
        credentialState = {
          name: "PowerSchool",
          provided: status.provided ?? false,
          loginFlow: {
            type: "usernamePassword",
            async onSubmit(username, password) {},
          },
        }
        break
      default:
        // @ts-ignore
        throw new Error(`unknown credential loginFlow case ${loginFlow.case}`)
    }

    return {
      credentialStates: [credentialState],
      async afterCredentialsProvided() {
        const res = await client.getData({})
        if (!res.data) {
          throw new Error("sis student data is undefined.")
        }
        useSISContext.setState({ data: res.data })

        return {
          async refetch() {
            const res = await client.getData({})
            if (!res.data) {
              throw new Error("sis student data is undefined.")
            }
            useSISContext.setState({ data: res.data })
          },
          routes: {
            "/dashboard": {
              title: "Dashboard",
              icon: MdDashboard,
              render() {
                const data = useSISContext((c) => c.data)
                return <Dashboard data={data} />
              },
            },
            "/grade-calculator": {
              title: "Grade Calculator",
              icon: MdCalculate,
              render() {
                const courses = useSISContext((c) => c.data.courses)
                return <GradeCalculator courses={courses} />
              },
            },
            "/grade-trends": {
              title: "Grade Trends",
              icon: MdTimeline,
              rootClassName: "h-full",
              render() {
                const courses = useSISContext((c) => c.data.courses)
                return <GradeTrends courses={courses} />
              },
            },
          },
        }
      },
    }
  },
}
