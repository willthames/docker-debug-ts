import Router from 'koa-router';
import Koa from 'koa';
import PingRoutes from './routes/ping';
import SleepRoutes from './routes/sleep';
import RandomRoutes from './routes/random';
import RootRoutes from './routes';
import ProxyRoutes from './routes/proxy';

const router = new Router<Koa.DefaultState, Koa.Context>();

PingRoutes.register(router);
SleepRoutes.register(router);
RandomRoutes.register(router);
RootRoutes.register(router);
ProxyRoutes.register(router);

export { router };
