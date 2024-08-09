import { native } from "@/src/singletons"
import {
  type CredentialStatus,
  ProvideCredentialRequest,
} from "@backend.studentdata/api_pb"
import { Button, PasswordInput, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { SpanStatusCode } from "@opentelemetry/api"
import { narrowError } from "@vcassist/ui"
import { useState } from "react"
import { useUser } from "../providers"
import { fnSpan } from "./internal"
import {
  getOAuthLoginUrl,
  getTokenFormData,
  openIdTokenResponse,
} from "./oauth"
import { useMutation } from "@tanstack/react-query"

export function OAuthForm(props: {
  credentialId: string
  loginFlow: CredentialStatus["loginFlow"]
  color: string
  onSubmit(): void
}) {
  const { studentDataClient } = useUser()

  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <Button
        loading={loading}
        style={{ backgroundColor: props.color }}
        color={props.color}
        onClick={() => {
          return fnSpan(
            undefined,
            "intercept-token",
            async (span) => {
              setLoading(true)
              try {
                const authFlow = props.loginFlow
                if (authFlow.case !== "oauth") {
                  throw new Error(
                    "Cannot use OAuthFlow with non oauth authFlow.",
                  )
                }
                span.addEvent(
                  "Opening webview - iOS wants a listener BEFORE loading URLs.",
                )

                const loginUrl = getOAuthLoginUrl(authFlow.value)
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
                      const tokenForm = getTokenFormData(code, authFlow.value)
                      console.log("starting tokenForm Request")
                      const res = await fetch(authFlow.value.tokenRequestUrl, {
                        method: "POST",
                        body: tokenForm,
                      })

                      const resText = await res.text()
                      const token = openIdTokenResponse.parse(
                        JSON.parse(resText),
                      )
                      console.log(token)

                      span.addEvent("submitting tokens to server!")

                      await studentDataClient.provideCredential(
                        new ProvideCredentialRequest({
                          id: props.credentialId,
                          provided: {
                            case: "oauthToken",
                            value: {
                              token: resText,
                            },
                          },
                        }),
                      )

                      console.log("done.")
                      await native.closeWebview() // This is similar to the handler, in that it will not run if the webview is removed prematurely. No clue why.
                      await unsubscribeNav?.()

                      props.onSubmit()
                    } catch (e) {
                      span.recordException(narrowError(e))
                      span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: "Submit token failure.",
                      })

                      setInvalid(true)
                      setLoading(false)

                      await unsubscribeNav?.()
                      await native.closeWebview()
                    }

                    span.end()
                  },
                )

                const unsubscribeClosed = await native.onWebviewClosed(
                  async () => {
                    setLoading(false)
                    await unsubscribeClosed?.()
                  },
                )
              } catch (e) {
                setLoading(false)
                span.recordException(narrowError(e))
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: "Webview error.",
                })
                span.end()
              }
            },
            true,
          )
        }}
      >
        Login
      </Button>
      {invalid ? (
        <Text c="red" size="sm">
          Authorization failed.
        </Text>
      ) : undefined}
    </div>
  )
}

export function UsernamePasswordForm(props: {
  credentialId: string
  loginFlow: CredentialStatus["loginFlow"]
  color: string
  onSubmit(): void
}) {
  const { studentDataClient } = useUser()

  const form = useForm<{
    username: string
    password: string
  }>({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (c) => (c ? null : "Username required."),
      password: (c) => (c ? null : "Password required."),
    },
  })

  const submitMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: { username: string; password: string }) =>
      fnSpan(undefined, "provideUsernamePassword", async () => {
        await studentDataClient.provideCredential(
          new ProvideCredentialRequest({
            id: props.credentialId,
            provided: {
              case: "usernamePassword",
              value: {
                username: username,
                password: password,
              },
            },
          }),
        )
        props.onSubmit()
      }),
  })

  const submitForm = () => {
    form.validate()
    if (!form.isValid()) {
      return
    }
    submitMutation.mutate({
      username: form.values.username,
      password: form.values.password,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <TextInput
        placeholder="Username"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitForm()
          }
        }}
        {...form.getInputProps("username")}
      />
      <PasswordInput
        placeholder="Password"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitForm()
          }
        }}
        {...form.getInputProps("password")}
      />

      <Button
        className="font-bold"
        style={{ backgroundColor: props.color }}
        color={props.color}
        loading={submitMutation.isPending}
        onClick={submitForm}
      >
        Authorize
      </Button>

      {submitMutation.error ? (
        <Text c="red" size="sm">
          {submitMutation.error.message}
        </Text>
      ) : undefined}
    </div>
  )
}
