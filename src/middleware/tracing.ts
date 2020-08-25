import Koa from 'koa';
import { propagation, Tracer, Span } from '@opentelemetry/api';
import { getExtractedSpanContext } from '@opentelemetry/core';

import { factory } from '../logging';

const log = factory.getLogger('tracing');

const recordResponse = (ctx: Koa.Context, span: Span) => {
  span.setAttribute('http.status_code', ctx.response.status);
  span.setAttribute('http.status_line', ctx.response.message);
  if (ctx.response.body) {
    span.setAttribute('http.bytes', ctx.response.body.length);
  }
  if (ctx.request.get('User-Agent')) {
    span.setAttribute('http.user_agent', ctx.request.get('User-Agent'));
  }
  if (ctx.request.get('Referer')) {
    span.setAttribute('http.referrer', ctx.request.get('Referer'));
  }
};

const recordError = (span: Span) => {
  span.setAttribute('error', true);
};

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
    const ourContext = propagation.extract(ctx.request.headers);

    let span: Span | undefined;
    if (getExtractedSpanContext(ourContext)) {
      span = tracer.startSpan(
        `${ctx.request.method} ${ctx.request.path}`,
        {
          kind: 1,
          attributes: {
            'http.path': ctx.request.path,
            'http.method': ctx.request.method,
            'http.url': ctx.request.url,
          },
        },
        ourContext,
      );
      if (ctx.request.headers['X-Request-Id']) {
        span.setAttribute('request_id', 'X-Request-Id');
      }
      ctx.span = span;
      log.info(`New span: ${span.context().traceId} ${span.context().spanId}`);
    }

    try {
      await next();
    } catch (error) {
      if (span) {
        recordError(span);
      }
      throw error;
    } finally {
      if (span) {
        recordResponse(ctx, span);
        span.end();
      }
    }
  };
}
