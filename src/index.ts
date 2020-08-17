import cors from '@koa/cors';
import http from 'http';
import Koa from 'koa';
import views from 'koa-views';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import { eachSorted } from './handlebars';
import { router } from './router';
import { appConfig, bodyParserConfig, corsConfig, tracingConfig } from './config';
import { koaMiddleware } from './middleware/tracing';
import { logger } from './middleware/logger';
import { factory } from './logging';
import { getTracer } from './tracer';

const log = factory.getLogger('index');
const app = new Koa();

// Apply Middleware
app.use(logger);
app.use(bodyParser(bodyParserConfig));
app.use(cors(corsConfig));

const render = views(path.join(__dirname, '..', 'src', 'views'), {
  map: {
    html: 'handlebars',
  },
  options: {
    helpers: {
      eachSorted,
    },
  },
});

// Must be used before any router is used
app.use(render);
let tracingMiddleware;
if (tracingConfig.url) {
  const tracer = getTracer(`${tracingConfig.url}/api/v2/spans`, tracingConfig.name);
  tracingMiddleware = koaMiddleware(tracer);
} else {
  tracingMiddleware = async function nullMiddleware(ctx: Koa.Context, next: Koa.Next) {
    await next();
  };
}
// Apply routes
const ourRouter = router(tracingMiddleware);
app.use(ourRouter.routes());
app.use(serve(path.join(__dirname, '..', 'static')));

const httpServer = http.createServer(app.callback());

const { env, name, version, host, port, root } = appConfig;

if (root) {
  ourRouter.prefix(root);
}

httpServer.listen({ host, port }, () => {
  log.info(`${name}@${version} server listening on ${host}:${port}, in ${env}`);
});
