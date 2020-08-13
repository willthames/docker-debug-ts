import Router from 'koa-router';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const register = (router: Router) => {
  router.get('/sleep/:duration', async ctx => {
    await sleep(1000 * ctx.params.duration);
    ctx.status = 200;
    ctx.body = 'FIXME';
  });
};

export default { register };
