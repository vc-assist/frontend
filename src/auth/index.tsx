import { AuthService } from "@backend.auth/api_connect"
import {
  ConsumeVerificationCodeRequest,
  StartLoginRequest,
  VerifyTokenRequest,
} from "@backend.auth/api_pb"
import { createPromiseClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { Button, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMutation } from "@tanstack/react-query"
import { Panel, type UserProfile } from "@vcassist/ui"
import { useEffect, useRef, useState } from "react"
import { config } from "../singletons"
import { fnSpan } from "./internal"

const transport = createConnectTransport({
  baseUrl: config.endpoints.auth_service,
})
const client = createPromiseClient(AuthService, transport)

export enum State {
  WAITING_FOR_EMAIL = 0,
  WAITING_FOR_CODE = 1,
}

export function LoginPage(props: {
  token?: string
  state?: State
  onLogin(token: string, profile: UserProfile): void
  onInvalidToken(): void
}) {
  const tokenRef = useRef(props.token)
  const emailRef = useRef("")
  const [state, setState] = useState(props.state ?? State.WAITING_FOR_EMAIL)

  const startLogin = (email: string) =>
    client.startLogin(new StartLoginRequest({ email }))

  const consumeVerificationCode = (code: string, email: string) =>
    fnSpan(undefined, "consumeVerificationCode", async () => {
      const tokenRes = await client.consumeVerificationCode(
        new ConsumeVerificationCodeRequest({
          providedCode: code,
          email,
        }),
      )
      const res = await client.verifyToken(
        new VerifyTokenRequest({
          token: tokenRes.token,
        }),
      )
      return {
        token: tokenRes.token,
        profile: { email: res.email } satisfies UserProfile,
      }
    })

  useEffect(() => {
    if (!tokenRef.current) {
      return
    }
    client
      .verifyToken(
        new VerifyTokenRequest({
          token: tokenRef.current,
        }),
      )
      .then((res) => props.onLogin(tokenRef.current!, res))
      .catch(() => {
        tokenRef.current = undefined
        props.onInvalidToken()
      })
  }, [props.onLogin, props.onInvalidToken])

  if (tokenRef.current) {
    return
  }

  return (
    <div className="flex h-full">
      <Panel className="m-auto">
        {state === State.WAITING_FOR_EMAIL ? (
          <EmailPrompt
            onSubmit={async (email: string) => {
              await startLogin(email)
              emailRef.current = email
              setState(State.WAITING_FOR_CODE)
            }}
          />
        ) : undefined}

        {state === State.WAITING_FOR_CODE ? (
          <CodePrompt
            onSubmit={async (code: string) => {
              const res = await consumeVerificationCode(code, emailRef.current)
              props.onLogin(res.token, res.profile)
            }}
          />
        ) : undefined}
      </Panel>
    </div>
  )
}

function EmailPrompt(props: { onSubmit: (email: string) => Promise<void> }) {
  const form = useForm({
    initialValues: {
      email: "",
    },
  })

  const submitMutation = useMutation({
    mutationFn: (code: string) => props.onSubmit(code),
  })

  const submit = () => {
    if (form.validate().hasErrors) {
      return
    }
    submitMutation.mutate(form.values.email)
  }

  return (
    <div className="flex flex-col gap-3 min-w-[240px] max-w-[240px]">
      <Title order={3}>Log in...</Title>
      <TextInput
        placeholder="Email address"
        {...form.getInputProps("email")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit()
          }
        }}
      />

      <Button onClick={submit} loading={submitMutation.isPending}>
        Submit
      </Button>

      {submitMutation.error ? (
        <p className="text-red-700 font-normal max-w-[240px]">
          {submitMutation.error.message}
        </p>
      ) : undefined}
    </div>
  )
}

function CodePrompt(props: { onSubmit: (code: string) => Promise<void> }) {
  const form = useForm({
    initialValues: {
      code: "",
    },
  })

  const submitMutation = useMutation({
    mutationFn: (code: string) => props.onSubmit(code),
  })

  const submit = () => {
    if (form.validate().hasErrors) {
      return
    }
    submitMutation.mutate(form.values.code)
  }

  return (
    <div className="flex flex-col gap-3 min-w-[240px] max-w-[240px]">
      <div className="flex flex-col gap-1">
        <Title order={3}>Enter the code...</Title>
        <p className="text-dimmed italic">
          A verification code has been sent to your email address.
        </p>
      </div>

      <TextInput
        placeholder="Verification Code"
        {...form.getInputProps("code")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit()
          }
        }}
      />

      <Button className="" onClick={submit} loading={submitMutation.isPending}>
        Submit
      </Button>

      {submitMutation.error ? (
        <p className="text-red-700 font-normal max-w-[240px]">
          {submitMutation.error.message}
        </p>
      ) : undefined}
    </div>
  )
}
