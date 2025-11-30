import { getPlatformProxy } from 'wrangler';
import app from '..';
import { login } from './test.helper';

const { env } = await getPlatformProxy<CloudflareBindings>();
const cookie = await login(env, env.TEST_USER_NAME, env.TEST_USER_PASSWORD);

describe('GET: /todos', () => {
  it('認証済なら、200番が返ること', async () => {
    const res = await app.request(
      '/api/todos',
      {
        method: 'GET',
        headers: {
          Cookie: cookie,
        },
      },
      env,
    );

    expect(res.status).toBe(200);
  });

  it('未認証なら、認証失敗を示す401番が返ること', async () => {
    const res = await app.request(
      '/api/todos',
      {
        method: 'GET',
      },
      env,
    );

    expect(res.status).toBe(401);
  });
});

describe('GET: /todos/{id}', () => {
  it('idが存在する場合は、200番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'GET',
        headers: { Cookie: cookie },
      },
      env,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).not.toBeNull();
  });

  it('idが存在しない場合は、404番が返ること', async () => {
    const res = await app.request(
      `/api/todos/123456789`,
      {
        method: 'GET',
        headers: { Cookie: cookie },
      },
      env,
    );

    expect(res.status).toBe(404);
  });

  it('未認証なら、認証失敗を示す401番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'GET',
      },
      env,
    );

    expect(res.status).toBe(401);
  });
});

describe('POST: /todos', () => {
  it('有効なリクエストボディの場合は、追加したレコードが返却されて、201番が返ること', async () => {
    const res = await app.request(
      '/api/todos',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({
          title: 'new todo',
        }),
      },
      env,
    );

    expect(res.status).toBe(201);
    expect(await res.json()).not.toBeNull();
  });

  it('リクエストボディ(title)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await app.request(
      '/api/todos',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({}),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('未認証なら、認証失敗を示す401番が返ること', async () => {
    const res = await app.request(
      '/api/todos',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'new todo',
        }),
      },
      env,
    );

    expect(res.status).toBe(401);
  });
});

describe('PUT: /todos/{id}', () => {
  it('有効なリクエストボディの場合は、更新したレコードが返却されて、200番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({
          title: 'todo updated',
          isCompleted: true,
        }),
      },
      env,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).not.toBeNull();
  });

  it('リクエストボディ(title)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({
          isCompleted: true,
        }),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('リクエストボディ(isCompleted)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({
          title: 'todo updated',
        }),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('リクエストボディ(全プロパティ)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({}),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('idが存在しない場合は、404番が返ること', async () => {
    const res = await app.request(
      `/api/todos/123456789`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({
          title: 'todo updated',
          isCompleted: true,
        }),
      },
      env,
    );

    expect(res.status).toBe(404);
  });

  it('未認証なら、認証失敗を示す401番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'todo updated',
          isCompleted: true,
        }),
      },
      env,
    );

    expect(res.status).toBe(401);
  });
});

describe('DELETE: /todos/{id}', () => {
  it('idが存在する場合は、レコードが削除されて、204番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'DELETE',
        headers: { Cookie: cookie },
      },
      env,
    );

    expect(res.status).toBe(204);
  });

  it('idが存在しない場合は、404番が返ること', async () => {
    const res = await app.request(
      `/api/todos/123456789`,
      {
        method: 'DELETE',
        headers: { Cookie: cookie },
      },
      env,
    );

    expect(res.status).toBe(404);
  });

  it('未認証なら、認証失敗を示す401番が返ること', async () => {
    const res = await app.request(
      `/api/todos/${env.TEST_TODO_ID}`,
      {
        method: 'DELETE',
      },
      env,
    );

    expect(res.status).toBe(401);
  });
});
