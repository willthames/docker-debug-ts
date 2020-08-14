import Koa from 'koa';
import { colour } from '../colour';

export async function defaultPage(ctx: Koa.Context): Promise<void> {
  return ctx.render('index', {
    buggy: process.env.ENABLE_BUGGY_FEATURE,
    colour,
    environs: process.env,
    headers: ctx.request.headers,
  });
}
