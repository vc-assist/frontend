import { AuthService } from "@backend.auth/api_connect"
import { ConsumeVerificationCodeRequest, StartLoginRequest, VerifyTokenRequest } from "@backend.auth/api_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { Button, PinInput, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useEffect, useRef, useState } from "react"
import { config } from "../singletons"
import { narrowError, type UserProfile } from "@vcassist/ui"
import { fnSpan } from "./internal"

const transport = createConnectTransport({
  baseUrl: config.endpoints.auth_service
})
const client = createPromiseClient(AuthService, transport)

enum State {
  WAITING_FOR_EMAIL = 0,
  WAITING_FOR_CODE = 1,
}

export function LoginPage(props: {
  token?: string
  onLogin(token: string, profile: UserProfile): void
}) {
  const tokenRef = useRef(props.token)
  const emailRef = useRef("")
  const [state, setState] = useState(State.WAITING_FOR_EMAIL)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!tokenRef.current) {
      return
    }
    client.verifyToken(new VerifyTokenRequest({
      token: tokenRef.current,
    }))
      .then(res => props.onLogin(tokenRef.current!, res))
      .catch(() => {
        tokenRef.current = undefined
      })
  }, [props.onLogin])

  if (tokenRef.current) {
    return
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col gap-3 m-auto">
        {state === State.WAITING_FOR_EMAIL ?
          <EmailPrompt
            onSubmit={async (email: string) => {
              try {
                await client.startLogin(new StartLoginRequest({ email }))
                emailRef.current = email
                setState(State.WAITING_FOR_CODE)
              } catch (err) {
                setError(narrowError(err).toString())
              }
            }}
          />
          : undefined}

        {state === State.WAITING_FOR_CODE ?
          <CodePrompt
            onSubmit={(code: string) => {
              return fnSpan(undefined, "consumeVerificationCode", async () => {
                try {
                  const tokenRes = await client.consumeVerificationCode(
                    new ConsumeVerificationCodeRequest({
                      providedCode: code,
                      email: emailRef.current,
                    }),
                  )
                  const res = await client.verifyToken(new VerifyTokenRequest({
                    token: tokenRes.token,
                  }))
                  props.onLogin(tokenRes.token, { email: res.email })
                } catch (err) {
                  setError(narrowError(err).toString())
                }
              })
            }}
          />
          : undefined}

        {error ? <p className="text-red">{error}</p> : undefined}
      </div>
    </div>
  )
}

function EmailPrompt(props: { onSubmit: (email: string) => void }) {
  const form = useForm({
    initialValues: {
      email: "",
    },
  });

  return (
    <>
      <Title order={4}>Log in...</Title>
      <TextInput
        placeholder="Email address"
        {...form.getInputProps("email")}
      />
      <Button
        onClick={() => {
          if (form.validate().hasErrors) {
            return;
          }
          props.onSubmit(form.values.email)
        }}
      >
        Login
      </Button>
    </>
  )
}

function CodePrompt(props: { onSubmit: (code: string) => void }) {
  const form = useForm({
    initialValues: {
      code: ""
    },
  });

  return (
    <>
      <Title order={4}>Enter the verification code sent to your email...</Title>
      <PinInput
        length={6}
        type="alphanumeric"
        {...form.getInputProps("code")}
      />
      <Button
        onClick={() => {
          if (form.validate().hasErrors) {
            return;
          }
          props.onSubmit(form.values.code)
        }}
      >
        Verify
      </Button>
    </>
  )
}

