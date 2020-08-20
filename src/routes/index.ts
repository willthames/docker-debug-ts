import Koa from 'koa';
import Router from 'koa-router';
import { defaultPage } from '../controllers/default';

const register = (
  router: Router<Koa.DefaultState, Koa.Context>,
  zipkinMiddleware: Koa.Middleware<Koa.DefaultState, Koa.Context>,
) => {
  router.get('/', zipkinMiddleware, async ctx => {
    return defaultPage(ctx);
  });
};

export default { register };
