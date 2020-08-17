import opentelemetry, { Tracer } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/tracing';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
// import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

export function getTracer(url: string, serviceName: string): Tracer {
  const provider = new NodeTracerProvider({
    plugins: {
      http: {
        enabled: true,
        path: '@opentelemetry/plugin-http',
      },
    },
  });
  /*
  const options = {
    url,
    serviceName,
  };
  */
  const contextManager = new AsyncHooksContextManager();
  contextManager.enable();
  // provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter(options)));
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register({
    contextManager,
  });

  return opentelemetry.trace.getTracer(serviceName);
}
