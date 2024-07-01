import { ErrorBoundary as ErrorBoundaryComponent } from "react-error-boundary"
import { Code, Text, Title } from "@mantine/core";
import { useState } from "react";
import Panel from "@/lib/components/Panel";
import { notifications } from "@mantine/notifications";
import { config } from "./config";
import { createFnSpanner } from "@/lib/telemetry";

export function notifyError(err: unknown) {
  if (config.environment === "prod") {
    notifications.show({
      message: "Something went wrong!",
      autoClose: 3000,
      color: "red",
    });
  } else {
    notifications.show({
      message: err instanceof Error ? err.message : String(err),
      title: "Something went wrong!",
      autoClose: 10000,
      color: "red",
    });
  }
}

function ErrorPage(
  props: Partial<{
    errorId: string;
    description: string;
    shortVersion: string;
    longVersion: string;
    children: React.ReactNode;
  }>,
) {
  const [isLongVersion, setIsLongVersion] = useState<boolean>(false);

  return (
    <div className="flex h-full">
      <Panel className="flex flex-col gap-3 m-auto max-w-[80%]">
        <Title order={2}>Uh oh!</Title>
        <Text>An error has occurred.</Text>

        {props.errorId ? (
          <>
            <Text className="font-semibold">Message:</Text>
            <Code block>{props.errorId}</Code>
          </>
        ) : undefined}

        {props.description ? (
          <>
            <Text className="overflow-x-auto font-semibold">Description:</Text>
            <Code className="whitespace-pre" block>
              {props.description}
            </Code>
          </>
        ) : undefined}

        {props.shortVersion ? (
          <Text>
            Version:{" "}
            <Code
              onMouseEnter={() => setIsLongVersion(true)}
              onMouseLeave={() => setIsLongVersion(false)}
            >
              {isLongVersion ? props.longVersion : props.shortVersion}
            </Code>
          </Text>
        ) : undefined}

        {props.children}
      </Panel>
    </div>
  );
}

const fnSpan = createFnSpanner("global-error")

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      fallbackRender={({ error: err }) => {
        notifyError(err);

        if (err instanceof Error) {
          let cause = String(err.cause);
          if (typeof err.cause === "object") {
            try {
              cause = JSON.stringify(err.cause);
            } catch { }
          }

          fnSpan(undefined, "fatal-error", (span) => {
            span.setAttribute("exception.name", err.name)
            span.setAttribute("exception.message", err.message)
            span.setAttribute("exception.stack", err.stack ?? "<undefined>")
            span.setAttribute("exception.cause", cause)
          })

          return (
            <ErrorPage errorId={err.message} description={err.stack ?? ""} />
          );
        }

        fnSpan(undefined, "fatal-error", (span) => {
          span.setAttribute("exception.value", String(err))
        })

        return (
          <ErrorPage
            errorId="Unknown error"
            description="Something went wrong!"
          />
        );
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
