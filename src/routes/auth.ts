import { sValidator } from '@hono/standard-validator';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { deleteCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { sign } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import { createHonoApp } from '../app';
import { user } from '../db/schema';
import type { ErrorCause } from '../middleware/error';
import { LoginBodySchema } from '../validators/auth.schema';

const auth = createHonoApp();

auth.post('/login', sValidator('json', LoginBodySchema), async (c) => {
  const body = c.req.valid('json');

  const db = c.get('db');
  const result = await db.select().from(user).where(eq(user.name, body.name)).get();

  if (!result) {
    throw new HTTPException(401, { cause: 'INVALID_CREDENTIALS' satisfies ErrorCause });
  }

  const isMatch = await bcrypt.compare(body.password, result.password);
  if (!isMatch) {
    throw new HTTPException(401, { cause: 'INVALID_CREDENTIALS' satisfies ErrorCause });
  }

  const payload: JWTPayload = {
    sub: result.id,
    exp: Math.floor(Date.now() / 1000) + 60 * Number(c.env.JWT_EXPIRATION_MINUTES),
  };
  const jwt = await sign(payload, c.env.JWT_SECRET_KEY);

  setCookie(c, 'token', jwt, {
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: 60 * Number(c.env.JWT_EXPIRATION_MINUTES),
  });

  return c.json({ name: result.name }, 200);
});

auth.post('/logout', async (c) => {
  deleteCookie(c, 'token', {
    httpOnly: true,
    sameSite: 'Strict',
  });

  return c.newResponse(null, { status: 204 });
});

export default auth;
