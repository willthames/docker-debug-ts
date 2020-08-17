import Router from 'koa-router';
import Koa from 'koa';
import axios, { Method } from 'axios';
import { SpanKind } from '@opentelemetry/api';

import { factory } from '../../logging';

const log = factory.getLogger('proxy');

function inboundHeaders(headers: any, url: String): any {
  const result = Object.assign(headers);
  delete result['x-user-agent'];
  result.referer = url;
  return result;
}

function outboundHeaders(ctx: Koa.Context, headers: any) {
  Object.keys(headers).forEach(key => ctx.set(key, headers[key]));
}

async function makeRequest(ctx: Koa.Context, options: any) {
  try {
    const response = await axios(options);
    ctx.response.body = response.data;
    ctx.response.status = response.status;
    outboundHeaders(ctx, response.headers);
  } catch (error) {
    ctx.response.body = error.response.data;
    ctx.response.status = error.response.status;
    outboundHeaders(ctx, error.response.headers);
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
    headers: inboundHeaders(ctx.request.headers, ctx.request.URL.toString()),
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
