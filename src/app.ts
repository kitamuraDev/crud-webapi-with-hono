import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';

export type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    db: DrizzleD1Database;
    userId: string;
  };
};

export const createHonoApp = () => {
  const app = new Hono<Env>();

  app.use(async (c, next) => {
    c.set('db', drizzle(c.env.todo));
    await next();
  });

  return app;
};
