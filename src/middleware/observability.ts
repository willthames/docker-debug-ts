import { Context, Next } from 'koa';

export interface Observability {
  requestId: string;
  userId: string;
  orgId: string;
  durationMs: number;
  httpStatus: number;
  httpBytes: number;
  httpPath: string;
  httpMethod: string;
  httpUserAgent: string;
  httpReferrer: string;
  srcIp: string;
}

export async function observability(ctx: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.observability = {
    requestId: ctx.request.get('X-Request-Id') || '-',
    userId: ctx.request.get('X-User-Id') || '-',
    orgId: ctx.request.get('X-Org-Id') || '-',
    durationMs: ms,
    httpStatus: ctx.response.status,
    httpBytes: ctx.response.length || 0,
    httpPath: ctx.request.path,
    httpMethod: ctx.request.method,
    httpUserAgent: ctx.request.get('User-Agent') || '-',
    httpReferrer: ctx.request.get('Referer') || '-',
    srcIp: ctx.request.ip,
  };
}
