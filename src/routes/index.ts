import Koa from 'koa';
import Router from 'koa-router';
import { colour } from '../colour';

const register = (router: Router<Koa.DefaultState, Koa.Context>) => {
  router.get('/', async ctx => {
    await ctx.render('index', {
      buggy: process.env.ENABLE_BUGGY_FEATURE,
      colour,
      environs: process.env,
      headers: ctx.request.headers,
    });
  });
};

export default { register };
