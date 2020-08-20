import Koa from 'koa';
import { propagation, Tracer } from '@opentelemetry/api';

import { factory } from '../logging';

const log = factory.getLogger('tracing');

/**
 * @typedef {Object} MiddlewareOptions
 * @property {Object} tracer
 * @property {string} serviceName
 * @property {number} port
 */

/**
 * @param {MiddlewareOptions}
 * @return {ZipkinKoaMiddleware}
 */
export function koaMiddleware(tracer: Tracer) {
  /**
   * @method
   * @typedef {function} ZipkinKoaMiddleware
   * @param {Object} ctx
   * @param {function()} next
   */
  return async function zipkinKoaMiddleware(ctx: Koa.Context, next: Koa.Next) {
    ctx.tracer = tracer;
    let ourContext;
    try {
      ourContext = propagation.extract(ctx.request.headers);
    } catch (error) {
      log.error("Couldn't get propagation: ", error);
      next();
      return;
    }
    const span = tracer.startSpan(
      `${ctx.request.method} ${ctx.request.path}`,
      {
        kind: 1,
        attributes: {
          'http.path': ctx.request.path,
          'http.method': ctx.request.method,
        },
      },
      ourContext,
    );
    ctx.span = span;
    log.info(`New span: ${span.context().traceId} ${span.context().spanId}`);
    const recordResponse = () => {
      span.setAttribute('http.status', ctx.response.status);
      if (ctx.response.body) {
        span.setAttribute('http.bytes', ctx.response.body.length);
      }
      if (ctx.request.get('User-Agent')) {
        span.setAttribute('http.user_agent', ctx.request.get('User-Agent'));
      }
      if (ctx.request.get('Referer')) {
        span.setAttribute('http.referrer', ctx.request.get('Referer'));
      }
      span.end();
    };
    const recordError = () => {
      span.setAttribute('error', true);
    };
    try {
      await next();
      recordResponse();
    } catch {
      recordError();
      recordResponse();
    }
  };
}
