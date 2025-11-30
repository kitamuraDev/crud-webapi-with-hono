import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HTTPResponseError } from 'hono/types';
import type { Env } from '../app';

export type ErrorCause = 'INVALID_CREDENTIALS' | 'INVALID_TOKEN' | 'NOT_FOUND' | 'INVALID_RESPONSE_DATA';

// エラーハンドリングミドルウェア
export const errorHandlingMiddleware = (err: Error | HTTPResponseError, c: Context<Env>) => {
  const cause = err.cause as ErrorCause;

  if (err instanceof HTTPException) {
    switch (cause) {
      case 'INVALID_CREDENTIALS':
        return c.json({ message: 'Invalid Credentials' }, 401);
      case 'INVALID_TOKEN':
        return c.json({ message: 'Invalid Token' }, 401);
      case 'NOT_FOUND':
        return c.json({ message: 'Not Found' }, 404);
      case 'INVALID_RESPONSE_DATA':
        return c.json({ message: 'Invalid Response Data' }, 500);
      default:
        throw new Error(cause satisfies never);
    }
  }

  // 予期しないサーバーエラー
  return c.json({ message: 'Internal Server Error' }, 500);
};
