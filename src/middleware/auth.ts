import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

// JWT認可ミドルウェア
export const jwtAuthMiddleware = async (c: Context<{ Bindings: CloudflareBindings }>, next: Next) => {
  const token = getCookie(c, 'token');
  if (!token) {
    return c.json({ message: 'Invalid token' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET_KEY);
    c.set('jwtPayload', payload);

    await next();
  } catch (e) {
    console.error(e);
    return c.json({ message: 'Invalid token' }, 401);
  }
};
