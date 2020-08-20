import { propagation, trace, Tracer } from '@opentelemetry/api';
import { B3Propagator } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

export function getTracer(url: string, serviceName: string): Tracer {
  // set global propagator
  propagation.setGlobalPropagator(new B3Propagator());

  // Create a provider for activating and tracking spans
  const provider = new NodeTracerProvider();

  const options = {
    serviceName,
    url,
  };

  provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter(options)));
  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return trace.getTracer(serviceName);
}
