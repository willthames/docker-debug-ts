import Router from 'koa-router';
import Koa from 'koa';
import axios, { Method } from 'axios';

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

async function proxy(ctx: Koa.Context, protocol: String, host: String, port: number, rest: String) {
  if (protocol !== 'http' && protocol !== 'https') {
    ctx.status = 500;
    ctx.body = 'Only HTTP and HTTPS protocols are supported';
    log.error(`Unsupported protocol ${protocol}`);
    return;
  }
  const url = `${protocol}://${host}:${port}/${rest}`;
  const options = {
    method: ctx.request.method as Method,
    headers: inboundHeaders(ctx.request.headers, ctx.request.URL.toString()),
    data: ctx.request.body,
    url,
  };
  await axios(options)
    .then(response => {
      ctx.response.body = response.data;
      ctx.response.status = response.status;
      outboundHeaders(ctx, response.headers);
    })
    .catch(error => {
      ctx.response.body = error.response.data;
      ctx.response.status = error.response.status;
      outboundHeaders(ctx, error.response.headers);
    });
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
