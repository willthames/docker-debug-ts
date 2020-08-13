import Router from 'koa-router';

function random(percent: number): Boolean {
  return percent > 100 * Math.random();
}

const register = (router: Router) => {
  router.get('/random/:status/:percent', async ctx => {
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
