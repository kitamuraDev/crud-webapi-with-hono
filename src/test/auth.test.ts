import { getPlatformProxy } from 'wrangler';
import app from '..';
import { getAccessTokenFromSetCookie, login } from './test.helper';

const { env } = await getPlatformProxy<CloudflareBindings>();

describe('POST: /auth/login', () => {
  it('認証成功したときにユーザー名が返却されること', async () => {
    const res = await app.request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: env.TEST_USER_NAME,
          password: env.TEST_USER_PASSWORD,
        }),
      },
      env,
    );

    expect(res.status).toBe(200);

    // ユーザー名が返却されること
    const json = (await res.json()) satisfies { name: string };
    expect(json.name).toBe(env.TEST_USER_NAME);

    // レスポンスヘッダーの`set-cookie`にjwtがあること
    expect(getAccessTokenFromSetCookie(res.headers)).not.toBe('');
  });

  it('リクエストボディ(name)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await app.request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: env.TEST_USER_PASSWORD,
        }),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('リクエストボディ(password)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await app.request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: env.TEST_USER_NAME,
        }),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('リクエストボディ(全プロパティ)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await app.request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('存在しないユーザー名の場合、認証失敗を示す401番が返ること', async () => {
    const res = await app.request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'unknown_user', password: env.TEST_USER_PASSWORD }),
      },
      env,
    );

    expect(res.status).toBe(401);
  });

  it('パスワードに誤りがある場合、認証失敗を示す401番が返ること', async () => {
    const res = await app.request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: env.TEST_USER_NAME, password: '123456789' }),
      },
      env,
    );

    expect(res.status).toBe(401);
  });
});

describe('POST: /auth/logout', async () => {
  it('/auth/logout を叩くとアクセストークンが削除されて空文字になること', async () => {
    const cookie = await login(env, env.TEST_USER_NAME, env.TEST_USER_PASSWORD);
    const res = await app.request(
      '/api/auth/logout',
      {
        method: 'POST',
        headers: {
          Cookie: cookie,
        },
      },
      env,
    );

    expect(res.status).toBe(204);
    expect(getAccessTokenFromSetCookie(res.headers)).toBe('');
  });
});
