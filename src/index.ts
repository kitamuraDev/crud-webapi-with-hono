import { Hono } from 'hono';
import auth from './routes/auth';
import todos from './routes/todos';

const app = new Hono<{ Bindings: CloudflareBindings }>().basePath('/api');

/**
 * エンドポイント一覧
 *  - タスク（※`user_id`はHonoのMiddlewareでJWTをパースして取得するため、パスやクエリには含めない）
 *    - GET: /todos         // タスク一覧取得
 *    - GET: /todos/{id}    // タスク単一取得
 *    - POST: /todos        // タスク作成
 *    - PUT: /todos/{id}    // タスク更新
 *    - DELETE: /todos/{id} // タスク削除
 *  - 認証
 *    - POST: /auth/login    // ログイン
 *    - POST: /auth/logout   // ログアウト
 */
app.route('/todos', todos);
app.route('/auth', auth);

export default app;
