import cors from '@koa/cors';
import http from 'http';
import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import { appConfig, bodyParserConfig, corsConfig } from './config';
import { router } from './router';
import { observability } from './middleware/observability';
import { logger } from './middleware/logger';

const app = new Koa();

// Apply Middleware
app.use(logger);
app.use(observability);
app.use(bodyParser(bodyParserConfig));
app.use(cors(corsConfig));

// Apply routes
app.use(router.routes());
app.use(serve(path.join(__dirname, '..', 'static')));

const httpServer = http.createServer(app.callback());

const { env, name, version, host, port, root } = appConfig;

if (root) {
  router.prefix(root);
}

httpServer.listen({ host, port }, () => {
  // eslint-disable-next-line no-console
  console.info(`${name}@${version} server listening on ${host}:${port}, in ${env}`);
});
