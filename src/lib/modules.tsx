import { PublicService } from "@/backend/api/vcassist/public/v1/api_connect"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { UsernamePasswordForm, OAuthForm} from "@/ui/foundation/credential-forms"
import { LoginMoodleRequest, LoginPowerschoolRequest } from "@/backend/api/vcassist/public/v1/api_pb"
import { getOAuthLoginUrl, getTokenFormData, openIdTokenResponse } from "./oauth"
import { OAuthFlow } from "@/backend/proto/vcassist/services/keychain/v1/auth_flow_pb"
import { native } from "./native"
import Config from "@/vcassist.config" 
import { PowerschoolService } from "@/backend/api/vcassist/powerschool/v1/api_connect"
import { MoodleService } from "@/backend/api/vcassist/moodle/v1/api_connect"
import { LessonPlansResponse, RefreshResponse } from "@/backend/api/vcassist/moodle/v1/api_pb"
import { GetDataResponse } from "@/backend/proto/vcassist/services/sis/v1/api_pb"
import { DataResponse } from "@/backend/api/vcassist/powerschool/v1/api_pb"
import { CourseData } from "@/backend/proto/vcassist/services/sis/v1/data_pb"
//Authored by Justin Shi + Shengzhi Hu CO 2025
//This file sets up the boilerplate for powerschool and moodle login respectivly NOTE: SIS is used interchagbly for powerschool, if found
const mainClient = createPromiseClient(PublicService, createConnectTransport({baseUrl: Config.endpoints.vcassist_backend})) //this client sends oauth tokens, usename passwords to the backend to be proccessed
const powerschoolHelper = createPromiseClient(PowerschoolService, createConnectTransport({baseUrl: Config.endpoints.vcassist_backend}))
const moodleHelper = createPromiseClient(MoodleService, createConnectTransport({baseUrl: Config.endpoints.vcassist_backend}))

export type Module<T> = {
  name: string 
  picture: string 
  refresh() :  Promise<RefreshResponse> 
  getData() : Promise<T>,//unknown in replacement for two possible types LessonPlanReponse and GetDataReponse
  isLoggedIn(): boolean
  renderLogin(props: {onDone() : void}): React.ReactNode
}

//nessicary parameters to start powerschool login
const powerschoolParams = new OAuthFlow({
  baseLoginUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  accessType: "offline",
  scope: "openid email profile",
  redirectUri: "com.powerschool.portal://"
}
) 
//add get data function, render renders the login for each respective module, refresh rescrapes upon user request, add ret data to render properly in __root.tsx
export const Moodle : Module<LessonPlansResponse> = {
  name: "moodle", 
  picture: "", 
  async refresh() {
    return await moodleHelper.refresh({});
  },
  async getData() {
    return await moodleHelper.lessonPlans({})
  },
  isLoggedIn() {
    const moodleToken = localStorage.getItem("moodleSessionToken"); //dear bryan: as much as your javascript brain wants to change this, as a avid c++ user can we please keep this for normalcy
    return moodleToken !== null;
  },
  renderLogin(props) {
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

export const Powerschool : Module<DataResponse> = {
  name: "powerschool",
  picture: "",
  async refresh(){
    return await powerschoolHelper.refresh({})
  }, 
  async getData(){
    return await powerschoolHelper.data({})
  },
  isLoggedIn() {
    const powerschoolToken = localStorage.getItem("powerschoolSessionToken");
    return powerschoolToken != null;
  },
  renderLogin(props) {
    return (
      <OAuthForm color="white" credentialId="powerschool" 
        onStart = {() => {   
            return new Promise<void>((resolve, reject) => {
              ;(async () => {
                try {
                  const loginUrl = getOAuthLoginUrl(powerschoolParams)

                  const userAgent = await native.userAgent()
                  await native.openWebview(loginUrl, userAgent)

                  const unsubscribeNav =
                    await native.onWebviewNavigate(
                      async (urlStr: string) => {
                       
                        try {
                          const url = new URL(urlStr)
                          const code = url.searchParams.get("code")
                          if (!code) {
                            //error
                            return
                          }

                          const tokenForm = getTokenFormData(
                            code,
                            powerschoolParams,
                          )
                          console.log("starting token Form Request")
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
                          localStorage.setItem("powerschoolSessionToken", resText);
                          console.log(token)

                          await mainClient.loginPowerschool(
                            new LoginPowerschoolRequest(
                              {
                                token: token,
                              }                              
                            )
                          )
                          ,

                          await native.closeWebview() // This is similar to the handler, in that it will not run if the webview is removed prematurely. No clue why.
                          await unsubscribeNav?.()
                        } catch (e) {
                          console.log("submit token failure")

                          reject(e)

                          await unsubscribeNav?.()
                          await native.closeWebview()
                        }

                      },
                    )

                  const unsubscribeClosed =
                    await native.onWebviewClosed(async () => {
                      await unsubscribeClosed?.()
                    })
                } catch (e) {
                  console.log("webview error")
                  reject(e)
                }
              })()
            })
      }}  onSuccess= {() => {
        props.onDone()
      }}></OAuthForm>
    )
  }
}


