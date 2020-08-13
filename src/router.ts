import Router from 'koa-router';
import PingRoutes from './routes/ping';
import SleepRoutes from './routes/sleep';
import RandomRoutes from './routes/random';

const router = new Router();

PingRoutes.register(router);
SleepRoutes.register(router);
RandomRoutes.register(router);

export { router };
