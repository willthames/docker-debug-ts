import Router from 'koa-router';
import Koa from 'koa';

function random(percent: number): Boolean {
  return percent > 100 * Math.random();
}

const register = (
  router: Router<Koa.DefaultState, Koa.Context>,
  zipkinMiddleware: Koa.Middleware<Koa.DefaultState, Koa.Context>,
) => {
  router.get('/random/:status/:percent', zipkinMiddleware, async ctx => {
    if (random(ctx.params.percent)) {
      ctx.status = parseInt(ctx.params.status, 10);
      ctx.body = 'Oh no!';
    } else {
      ctx.status = 200;
      ctx.body = 'Yay!';
    }
  });
};

export default { register };
