import { context, propagation, trace, Tracer } from '@opentelemetry/api';
import { B3Propagator } from '@opentelemetry/core';
import { SimpleSpanProcessor, ConsoleSpanExporter, BasicTracerProvider } from '@opentelemetry/tracing';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

export function getTracer(url: string, serviceName: string): Tracer {
  // set global propagator
  propagation.setGlobalPropagator(new B3Propagator());

  // set global context manager
  const contextManager = new AsyncHooksContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);

  // Create a provider for activating and tracking spans
  const provider = new BasicTracerProvider();

  const options = {
    serviceName,
    url,
  };

  provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter(options)));
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return trace.getTracer(serviceName);
}
