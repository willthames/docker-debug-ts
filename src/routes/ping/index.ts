import Router from 'koa-router';

const register = (router: Router) => {
  router.get('/ping', async ctx => {
    ctx.status = 200;
    ctx.body = 'pong';
  });
};

export default { register };
