import { AuthService } from "@backend.auth/api_connect"
import {
  ConsumeVerificationCodeRequest,
  StartLoginRequest,
  VerifyTokenRequest,
} from "@backend.auth/api_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import type { AuthState, UserProfile } from "@vcassist/ui"
import { AuthFlow } from "@vcassist/ui"
import { config } from "../singletons"

const transport = createConnectTransport({
  baseUrl: config.endpoints.vcassist_backend,
})
const client = createPromiseClient(AuthService, transport)

export function LoginPage(props: {
  state?: AuthState
  token?: string
  onLogin(token: string, profile: UserProfile): void
  onInvalidToken(): void
}) {
  return (
    <AuthFlow
      token={props.token}
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
      onInvalidToken={props.onInvalidToken}
      onLogin={props.onLogin}
    />
  )
}
