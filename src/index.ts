import cors from '@koa/cors';
import http from 'http';
import Koa from 'koa';
import views from 'koa-views';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import { router } from './router';
import { appConfig, bodyParserConfig, corsConfig } from './config';
import { observability } from './middleware/observability';
import { logger } from './middleware/logger';
import { factory } from './logging';

const log = factory.getLogger('index');
const app = new Koa();

// Apply Middleware
app.use(logger);
app.use(observability);
app.use(bodyParser(bodyParserConfig));
app.use(cors(corsConfig));

const render = views(path.join(__dirname, '..', 'src', 'views'), {
  map: {
    html: 'handlebars',
  },
});

// Must be used before any router is used
app.use(render);

// Apply routes
app.use(router.routes());
app.use(serve(path.join(__dirname, '..', 'static')));

const httpServer = http.createServer(app.callback());

const { env, name, version, host, port, root } = appConfig;

if (root) {
  router.prefix(root);
}

httpServer.listen({ host, port }, () => {
  log.info(`${name}@${version} server listening on ${host}:${port}, in ${env}`);
});
