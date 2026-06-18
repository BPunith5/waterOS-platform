import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/app-factory.js';

let expressApp: ((req: IncomingMessage, res: ServerResponse) => void) | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!expressApp) {
    const app = await createApp();
    await app.init();
    expressApp = app.getHttpAdapter().getInstance() as typeof expressApp;
  }
  (expressApp as NonNullable<typeof expressApp>)(req, res);
}
