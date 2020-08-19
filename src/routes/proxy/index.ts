import Router from 'koa-router';
import Koa from 'koa';
import axios, { Method } from 'axios';
import { SpanKind, propagation, context, defaultSetter } from '@opentelemetry/api';
import { setActiveSpan } from '@opentelemetry/core';

import { factory } from '../../logging';

const log = factory.getLogger('proxy');

function requestHeaders(ctx: Koa.Context): any {
  const result = Object.assign(ctx.request.headers);
  delete result['user-agent'];
  result.referer = ctx.request.URL.toString();
  let ourContext = context.active();
  if (ctx.span) {
    ourContext = setActiveSpan(ourContext, ctx.span);
    propagation.inject(result, defaultSetter, ourContext);
  }
  return result;
}

function responseHeaders(ctx: Koa.Context, headers: any) {
  Object.keys(headers).forEach(key => ctx.set(key, headers[key]));
}

async function makeRequest(ctx: Koa.Context, options: any) {
  try {
    const response = await axios(options);
    ctx.response.body = response.data;
    ctx.response.status = response.status;
    responseHeaders(ctx, response.headers);
  } catch (error) {
    ctx.response.body = error.response.data;
    ctx.response.status = error.response.status;
    responseHeaders(ctx, error.response.headers);
  }
}

async function proxy(ctx: Koa.Context, protocol: String, host: String, port: number, rest: String) {
  if (protocol !== 'http' && protocol !== 'https') {
    ctx.status = 500;
    ctx.body = 'Only HTTP and HTTPS protocols are supported';
    log.error(`Unsupported protocol ${protocol}`);
    return;
  }
  const url = `${protocol}://${host}:${port}/${rest}`;
  const axiosOptions = {
    method: ctx.request.method as Method,
    headers: requestHeaders(ctx),
    data: ctx.request.body,
    url,
  };
  if (ctx.tracer) {
    const currentSpan = ctx.span || ctx.tracer.getCurrentSpan();
    const span = ctx.tracer.startSpan(`${axiosOptions.method} ${axiosOptions.url}`, {
      parent: currentSpan,
      kind: SpanKind.CLIENT,
    });
    await ctx.tracer.withSpan(span, async () => {
      await makeRequest(ctx, axiosOptions);
    });
    span.end();
  } else {
    await makeRequest(ctx, axiosOptions);
  }
}

const register = (
  router: Router<Koa.DefaultState, Koa.Context>,
  zipkinMiddleware: Koa.Middleware<Koa.DefaultState, Koa.Context>,
) => {
  router.all('/proxy/:protocol/:host/:port/:rest(.*)', zipkinMiddleware, async ctx => {
    await proxy(ctx, ctx.params.protocol, ctx.params.host, ctx.params.port, ctx.params.rest);
  });
};

export default { register };
