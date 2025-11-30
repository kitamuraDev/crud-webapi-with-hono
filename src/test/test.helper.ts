import app from '..';

/**
 * ログインを行う
 * テスト環境ではログインを行えばcookieが以降のリクエストに含まれるわけではないため、cookieをレスポンスから取得して返却（→ 各テストではリクエスト時にcookieを付与）するようにしている
 *
 * @param env
 * @param name
 * @param password
 * @returns cookie
 */
export const login = async (env: CloudflareBindings, name: string, password: string): Promise<string> => {
  const res = await app.request(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    },
    env,
  );

  return res.headers.get('set-cookie') ?? '';
};

/**
 * set-cookie ヘッダーからJWTを取得する
 *
 * @param headers
 * @returns JWT || ''
 */
export const getAccessTokenFromSetCookie = (headers: Headers) => {
  const token = headers
    .get('set-cookie')
    ?.split(';')
    .find((header) => header.includes('token'))
    ?.split('=')[1]; // [ 'key_is_token', 'value_is_jwt' ] から jwtを取得する

  return token ?? '';
};
