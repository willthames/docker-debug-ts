// heavily based on
// https://github.com/openzipkin/zipkin-js/blob/master/packages/zipkin-instrumentation-koa/src/koaMiddleware.js
// with overrides for recordResponse and recordRequest

import { option, Instrumentation, Tracer, TraceId } from 'zipkin';
import Koa from 'koa';
import axios, { AxiosInstance } from 'axios';
import wrapAxios from 'zipkin-instrumentation-axiosjs';

/**
 * @typedef {Object} MiddlewareOptions
 * @property {Object} tracer
 * @property {string} serviceName
 * @property {number} port
 */
type MiddlewareOptions = {
  tracer: Tracer;
  serviceName: string;
  port: number;
};

function getHostAndPort(protocol: string, hostname: string) {
  const tokens = hostname.split(':');
  let port: number;
  if (tokens.length === 2) {
    port = parseInt(tokens[1], 10);
  } else if (protocol.toLowerCase() === 'https') {
    port = 443;
  } else {
    port = 80;
  }
  return { host: tokens[0], port };
}

export function zipkinAxios(ctx: Koa.Context): AxiosInstance {
  if (ctx.tracer) {
    const { host, port } = getHostAndPort(ctx.request.protocol, ctx.request.host);
    const options = { tracer: ctx.tracer, serviceName: host, port };
    return wrapAxios(axios, options);
  }
  return axios;
}

// spanNameFromRoute is from packages/zipkin/src/instrumentation/httpServer.js
// until it's added to zipkin's type declarations file
function spanNameFromRoute(method: string, route: any, code: number) {
  if (code > 299 && code < 400) return `${method} redirected`;
  if (code === 404) return `${method} not_found`;
  if (!route || route === '') return method;
  return `${method} ${route}`;
}

function defaultRecordResponse(
  ctx: Koa.Context,
  tracer: Tracer,
  instrumentation: Instrumentation.HttpServer,
  id: TraceId,
) {
  tracer.letId(id, () => {
    const matchedPath = ctx.routePath;
    const method = ctx.request.method.toUpperCase();
    tracer.recordRpc(spanNameFromRoute(method, matchedPath, ctx.status));
    instrumentation.recordResponse(id, ctx.status.toString());
  });
}

function defaultRecordRequest(ctx: Koa.Context, instrumentation: Instrumentation.HttpServer): TraceId {
  function readHeader(header: any) {
    const val = ctx.request.headers[header.toLowerCase()];
    return val != null ? new option.Some(val) : option.None;
  }
  return instrumentation.recordRequest(ctx.request.method.toUpperCase(), ctx.request.href, readHeader);
}

/**
 * @param {MiddlewareOptions}
 * @return {ZipkinKoaMiddleware}
 */
export function koaMiddleware({ tracer, serviceName, port = 0 }: MiddlewareOptions) {
  const instrumentation = new Instrumentation.HttpServer({ tracer, serviceName, port });

  /**
   * @method
   * @typedef {function} ZipkinKoaMiddleware
   * @param {Object} ctx
   * @param {function()} next
   */
  return function zipkinKoaMiddleware(ctx: Koa.Context, next: Koa.Next) {
    ctx.tracer = tracer;
    return tracer.scoped(() => {
      const id = defaultRecordRequest(ctx, instrumentation);
      ctx.recordResponse = defaultRecordResponse;
      Object.defineProperty(ctx.request, '_trace_id', { configurable: false, get: () => id });
      const recordResponse = () => {
        ctx.recordResponse(ctx, tracer, instrumentation, id);
      };
      return next()
        .then(recordResponse)
        .catch(recordResponse);
    });
  };
}
