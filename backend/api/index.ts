import type { IncomingMessage, ServerResponse } from 'http';

let expressApp: any;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!expressApp) {
    // Dynamic import from pre-compiled dist/ so esbuild never touches NestJS decorators.
    // nest build handles emitDecoratorMetadata; @vercel/node only compiles this tiny file.
    const { createApp } = await import('../dist/app-factory.js' as string);
    const app = await createApp();
    await app.init();
    expressApp = app.getHttpAdapter().getInstance();
  }
  expressApp(req, res);
}
