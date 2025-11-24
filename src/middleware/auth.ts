import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import type { Env } from '../app';
import type { ErrorCause } from './error';

// JWT認可ミドルウェア
export const jwtAuthMiddleware = async (c: Context<Env>, next: Next) => {
  const token = getCookie(c, 'token');
  if (!token) {
    throw new HTTPException(401, { cause: 'INVALID_TOKEN' satisfies ErrorCause });
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET_KEY);
    c.set('userId', payload.sub as string);

    await next();
  } catch (_e) {
    throw new HTTPException(401, { cause: 'INVALID_TOKEN' satisfies ErrorCause });
  }
};
