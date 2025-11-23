import { sValidator } from '@hono/standard-validator';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import { user } from '../db/schema';
import { LoginBodySchema } from '../validators/auth.schema';

const auth = new Hono<{ Bindings: CloudflareBindings }>();

auth.post('/login', sValidator('json', LoginBodySchema), async (c) => {
  const body = c.req.valid('json');

  try {
    const db = drizzle(c.env.todo);
    const result = await db.select().from(user).where(eq(user.name, body.name)).get();

    if (!result) {
      return c.json({ message: 'Invalid credentials' }, 401);
    }

    const isMatch = await bcrypt.compare(body.password, result.password);
    if (!isMatch) {
      return c.json({ message: 'Invalid credentials' }, 401);
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
  } catch (e) {
    console.error(e);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

auth.post('/logout', async (c) => {
  deleteCookie(c, 'token', {
    httpOnly: true,
    sameSite: 'Strict',
  });

  return c.json({ message: 'Logged out successfully' }, 200);
});

export default auth;
