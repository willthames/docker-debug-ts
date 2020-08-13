import { Context, Next } from 'koa';

export async function logger(ctx: Context, next: Next) {
  await next();
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
  } = ctx.observability;
  const timestamp = new Date().toISOString();
  console.log(
    `${timestamp} ${srcIp} ${userId} ${orgId} ${requestId} ${httpMethod} ${httpPath} ${httpStatus} ${httpUserAgent} "${httpReferrer}" ${httpBytes} ${durationMs}`,
  );
}
