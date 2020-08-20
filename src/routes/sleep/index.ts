import Koa from 'koa';
import Router from 'koa-router';
import { defaultPage } from '../../controllers/default';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const register = (
  router: Router<Koa.DefaultState, Koa.Context>,
  zipkinMiddleware: Koa.Middleware<Koa.DefaultState, Koa.Context>,
) => {
  router.get('/sleep/:duration', zipkinMiddleware, async ctx => {
    await sleep(1000 * ctx.params.duration);
    return defaultPage(ctx);
  });
};

export default { register };
