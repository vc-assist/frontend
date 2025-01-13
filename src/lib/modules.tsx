import { PublicService } from "@/backend/api/vcassist/public/v1/api_connect"
import { createClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { UsernamePasswordForm, OAuthForm} from "@/ui/foundation/credential-forms"
import { LoginMoodleRequest, LoginPowerschoolRequest } from "@/backend/api/vcassist/public/v1/api_pb"
import { fnSpan } from "./internal"
import { getOAuthLoginUrl, getTokenFormData, openIdTokenResponse } from "./oauth"
import { OAuthFlow } from "@/backend/proto/vcassist/services/keychain/v1/auth_flow_pb"
import { native } from "./native"
import { SpanStatusCode } from "@opentelemetry/api"
import { narrowError } from "@/ui"


//Authored by Justin Shi + Shengzhi Hu CO 2025
//This file sets up the boilerplate for powerschool and moodle login respectivly NOTE: SIS is used interchagbly for powerschool, if found
const mainClient = createClient(PublicService, createConnectTransport({baseUrl: "fill in later"})) //this client sends oauth tokens, usename passwords to the backend to be proccessed

export type Module = {
  name: string 
  picture: string 
  isLoggedIn(): boolean
  render(props: {onDone() : void}): React.ReactNode
}

//nessicary parameters to start powerschool login
const powerschoolParams = new OAuthFlow({
  baseLoginUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  accessType: "offline",
  scope: "openid email profile",
  redirectUri: "com.powerschool.portal://"
}
) 

export const Moodle : Module = {
  name: "moodle", 
  picture: "", 
  isLoggedIn() {
    const moodleToken = localStorage.getItem("moodleSessionToken"); //dear bryan: as much as your javascript brain wants to change this, as a avid c++ user can we please keep this for normalcy
    return moodleToken !== null;
  },
  render(props) {
    return (
      <UsernamePasswordForm color="white" credentialId="moodle" onSubmit={(username: string, password: string) => {
       const promise =  mainClient.loginMoodle(new LoginMoodleRequest ({username: username, password: password}))
       return promise.then( () => {
       }) //expects a promise due to async function .then wraps a promise 
      } }
      onSuccess= {() => {
        props.onDone()
      }}></UsernamePasswordForm>
    )
  }
  
}

export const Powerschool : Module = {
  name: "powerschool",
  picture: "",
  isLoggedIn() {
    const powerschoolToken = localStorage.getItem("powerschoolSessionToken");
    return powerschoolToken != null;
  },
  render(props) {
    return (
      <OAuthForm color="white" credentialId="powerschool" 
        onStart = {() => {
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

                  const loginUrl = getOAuthLoginUrl(powerschoolParams)
                  span.setAttribute("loginUrl", loginUrl)

                  const userAgent = await native.userAgent()
                  await native.openWebview(loginUrl, userAgent)

                  const unsubscribeNav =
                    await native.onWebviewNavigate(
                      async (urlStr: string) => {
                        span.addEvent("got token request!", {
                          url: urlStr,
                        })

                        try {
                          const url = new URL(urlStr)
                          const code = url.searchParams.get("code")
                          if (!code) {
                            //error
                            return
                          }

                          span.addEvent("requesting tokenFormData")
                          const tokenForm = getTokenFormData(
                            code,
                            powerschoolParams,
                          )
                          console.log("starting tokenForm Request")
                          const res = await fetch(
                            powerschoolParams.tokenRequestUrl,
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

                          span.addEvent(
                            "submitting tokens to server!",
                          )

                          await mainClient.loginPowerschool(
                            new LoginPowerschoolRequest(
                              {
                                token: token,
                              }                              
                            )
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

                  const unsubscribeClosed =
                    await native.onWebviewClosed(async () => {
                      await unsubscribeClosed?.()
                    })
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
      }}  onSuccess= {() => {
        props.onDone()
      }}></OAuthForm>
    )
  }
}


