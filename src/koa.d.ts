// https://stackoverflow.com/a/46899760/3538079
import { Context } from 'koa';
import { Tracer, TraceId, Instrumentation } from 'zipkin';
import { Observability } from './middleware/observability';

type MiddlewareOptions = {
  tracer: Tracer;
  serviceName: string;
  port: number;
};

declare module 'koa' {
  interface Context {
    recordResponse(ctx: Context, tracer: Tracer, instrumentation: Instrumentation.HttpServer, id: TraceId): void;
    observability: Observability;
  }
}
