import Router from 'koa-router';
import Koa from 'koa';
import PingRoutes from './routes/ping';
import SleepRoutes from './routes/sleep';
import RandomRoutes from './routes/random';
import RootRoutes from './routes';
import ProxyRoutes from './routes/proxy';

export function router(
  zipkinMiddleware: Koa.Middleware<Koa.DefaultState, Koa.Context>,
): Router<Koa.DefaultState, Koa.Context> {
  const newRouter = new Router<Koa.DefaultState, Koa.Context>();
  PingRoutes.register(newRouter);
  SleepRoutes.register(newRouter, zipkinMiddleware);
  RandomRoutes.register(newRouter, zipkinMiddleware);
  RootRoutes.register(newRouter, zipkinMiddleware);
  ProxyRoutes.register(newRouter, zipkinMiddleware);
  return newRouter;
}
