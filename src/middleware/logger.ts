import { Context, Next } from 'koa';

export async function logger(ctx: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const {
    requestId,
    srcIp,
    userId,
    orgId,
    durationMs,
    httpStatus,
    httpBytes,
    httpMethod,
    httpUserAgent,
    httpReferrer,
    httpPath,
  } = {
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
  const timestamp = new Date().toISOString();
  process.stdout.write(
    `${timestamp} ${srcIp} ${userId} ${orgId} ${requestId} ${httpMethod} ${httpPath} ${httpStatus} ${httpUserAgent} "${httpReferrer}" ${httpBytes} ${durationMs}\n`,
  );
}
