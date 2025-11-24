import { createHonoApp } from './app';
import { jwtAuthMiddleware } from './middleware/auth';
import auth from './routes/auth';
import todos from './routes/todos';

/**
 * エンドポイント一覧
 *  - タスク
 *    - GET: /todos         // タスク一覧取得
 *    - GET: /todos/{id}    // タスク単一取得
 *    - POST: /todos        // タスク作成
 *    - PUT: /todos/{id}    // タスク更新
 *    - DELETE: /todos/{id} // タスク削除
 *  - 認証
 *    - POST: /auth/login    // ログイン
 *    - POST: /auth/logout   // ログアウト
 */
const app = createHonoApp().basePath('/api');

app.use('/todos/*', jwtAuthMiddleware); // トークンの検証（認可制御）

app.route('/todos', todos);
app.route('/auth', auth);

export default app;
