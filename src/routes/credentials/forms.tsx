import { useState } from "react";
import { fnSpan } from "./internal";
import { Button, PasswordInput, TextInput, Text } from "@mantine/core";
import { SpanStatusCode } from "@opentelemetry/api";
import { useForm } from "@mantine/form";
import { UserProfile, narrowError } from "@vcassist/ui"
import { z } from "zod";
import type { Webview } from "@/lib/native";

export type TokenRequest = {
  redirectUri: string
  clientId: string
  scope: string
  code: string
  codeVerifier?: string
};

export function getTokenFormData(req: TokenRequest): FormData {
  const form = new FormData();
  form.append("grant_type", "authorization_code");
  form.append("client_id", req.clientId);
  form.append("scope", req.scope);
  form.append("code", req.code);
  if (req.codeVerifier) {
    form.append("code_verifier", req.codeVerifier);
  }
  form.append("redirect_uri", req.redirectUri);
  return form;
}

export const openIdTokenResponse = z.object({
  refresh_token: z.string().optional(),
  access_token: z.string(),
  id_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
});

export type ValidateFunction = (
  username: string,
  password: string,
) => Promise<boolean>;

export type AuthFormProps = {
  user: UserProfile;
  color: string
  onSubmit: ValidateFunction;
};

export function OAuthForm(props: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);

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
              setLoading(true);
              try {
                const authFlow = props.driver.authFlow;
                if (authFlow.type !== "oauth") {
                  throw new Error(
                    "Cannot use OAuthFlow with non oauth authFlow.",
                  );
                }
                console.log(
                  "Opening webview - iOS wants a listener BEFORE loading URLs.",
                );

                const info = await Device.getInfo();
                let userAgent = "";
                switch (await getPlatform()) {
                  case "ios":
                    userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS ${info.osVersion
                      } like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${info.osVersion.split(".")[0] ?? 13
                      } Mobile/15E148 Safari/604.1`;
                    break;
                }

                console.log("OPEN", authFlow.loginUrl, "UA", userAgent);
                await Webview.open(authFlow.loginUrl, {
                  userAgent: userAgent,
                });

                const unsubscribeNav = await Webview.listenNavigate(
                  async (urlStr) => {
                    // e === undefined when closing the webview
                    console.log("got token request!");

                    try {
                      const url = new URL(urlStr);
                      const code = url.searchParams.get("code");
                      if (!code) {
                        console.log("no token in url", urlStr);
                        return;
                      }

                      console.log("requesting tokenFormData");
                      const tokenForm = getTokenFormData({
                        ...authFlow.tokenRequest,
                        code: code,
                      });
                      console.log("starting tokenForm Request");
                      const res = await fetch(authFlow.tokenRequest.url, {
                        method: "POST",
                        body: tokenForm,
                      });

                      const tokens = openIdTokenResponse.parse(await res.json());
                      console.log(tokens);
                      console.log("submitting tokens to server!");
                      const valid = await props.onSubmit(
                        props.user.email,
                        JSON.stringify(tokens),
                      );
                      setInvalid(!valid);
                      console.log("done.");
                      await Webview.close(); // This is similar to the handler, in that it will not run if the webview is removed prematurely. No clue why.
                      await unsubscribeNav?.();
                    } catch (e) {
                      span.recordException(narrowError(e));
                      span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: "Submit token failure.",
                      });
                      setLoading(false);

                      await unsubscribeNav?.();
                      await Webview.close();
                    }

                    span.end();
                  },
                );

                const unsubscribeClosed = await Webview.listenClosed(
                  async () => {
                    setLoading(false);
                    await unsubscribeClosed?.();
                  },
                );
              } catch (e) {
                setLoading(false);
                span.recordException(narrowError(e));
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: "Webview error.",
                });
                span.end();
              }
            },
            true,
          );
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
  );
}

export function UsernamePasswordForm(props: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const form = useForm<{
    username: string;
    password: string;
  }>({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (c) => (c ? null : "Username required."),
      password: (c) => (c ? null : "Password required."),
    },
  });

  const submitForm = () => {
    form.validate();
    if (form.isValid()) {
      setLoading(true);
      props
        .onSubmit(form.values.username, form.values.password)
        .then((valid) => {
          setLoading(false);
          setInvalid(!valid);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <TextInput
        placeholder="Username"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitForm();
          }
        }}
        {...form.getInputProps("username")}
      />
      <PasswordInput
        placeholder="Password"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitForm();
          }
        }}
        {...form.getInputProps("password")}
      />
      <Button
        className="font-bold"
        style={{ backgroundColor: props.color }}
        color={props.color}
        loading={loading}
        onClick={submitForm}
      >
        Authorize
      </Button>
      {invalid ? (
        <Text c="red" size="sm">
          Invalid username or password.
        </Text>
      ) : undefined}
    </div>
  );
}
