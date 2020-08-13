// https://stackoverflow.com/a/46899760/3538079
import { Context } from 'koa';
import { Observability } from './middleware/observability';

declare module 'koa' {
  interface Context {
    observability: Observability;
  }
}
