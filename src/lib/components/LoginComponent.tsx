import { AuthService } from "@backend.auth/api_connect"

import vcassistConfig from "@/vcassist.config"
import {
  ConsumeVerificationCodeRequest,
  StartLoginRequest,
  VerifyTokenRequest,
} from "@backend.auth/api_pb"
import { createClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { AuthFlow, type AuthState, type UserProfile } from "@vcassist/ui"
import { useAtom } from "jotai"
import { UserAtom } from "../stores"
const transport = createConnectTransport({
  baseUrl: vcassistConfig.endpoints.vcassist_backend,
})
const client = createClient(AuthService, transport)

export default function LoginComponent(props: {
  // Dependency injection for Storybook
  state?: AuthState
  token?: string
  onLogin?: (token: string, profile: UserProfile) => void
  onInvalidToken?: () => void
}) {
  const [user, setUser] = useAtom(UserAtom)
  return (
    <main className="h-screen">
      <AuthFlow
        token={user.token!}
        state={props.state}
        startLogin={async (email) => {
          await client.startLogin(new StartLoginRequest({ email }))
        }}
        consumeVerificationCode={async (email, code) => {
          return client.consumeVerificationCode(
            new ConsumeVerificationCodeRequest({
              email,
              providedCode: code,
            }),
          )
        }}
        verifyToken={(token) => {
          return client.verifyToken(new VerifyTokenRequest({ token }))
        }}
        onInvalidToken={
          props.onInvalidToken ??
          (() => {
            setUser({ token: null, profile: null })
          })
        }
        onLogin={
          props.onLogin ??
          (async (token, profile) => {
            setUser({ token, profile })
          })
        }
      />
    </main>
  )
}
