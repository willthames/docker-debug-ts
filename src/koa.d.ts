// https://stackoverflow.com/a/46899760/3538079
import { Context } from 'koa';
import { Tracer, Span } from '@opentelemetry/api';

type MiddlewareOptions = {
  tracer: Tracer;
  serviceName: string;
  port: number;
};

declare module 'koa' {
  interface Context {
    recordResponse(ctx: Context): void;
    tracer?: Tracer;
    span?: Span;
  }
}
