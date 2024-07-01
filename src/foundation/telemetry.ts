import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { config } from "./config"
import { BatchSpanProcessor, WebTracerProvider } from "@opentelemetry/sdk-trace-web"
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";
import { Span } from "@opentelemetry/api"
import { useEffect, useRef } from "react";
import { FnSpan } from "@/lib/telemetry";

export function initTelemetry() {
  const OTEL_RESOURCE = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: "frontend",
  });

  const exporter = new OTLPTraceExporter({
    url: config.traces_otlp_http_endpoint,
  })
  const provider = new WebTracerProvider({
    resource: OTEL_RESOURCE,
  })
  provider.addSpanProcessor(new BatchSpanProcessor(exporter))
  provider.register()
}

/**
 * Creates a span that will exist for the duration of a component's lifecycle.
 */
export function useSpan(
  fnSpan: FnSpan,
  parentSpan: Span | undefined,
  name: string,
): Span {
  const span = useRef<Span>();

  useEffect(() => {
    return () => {
      span.current?.end();
      span.current = undefined;
    };
  }, []);

  if (!span.current) {
    span.current = fnSpan(parentSpan, name, (s) => s, true, true);
  }

  return span.current as Span;
}
