import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { safeParse } from 'valibot';

import { todo } from '../db/schema';
import { transformTodoResponse } from '../utils/transformers';
import { todosResponseSchema } from '../validators/todo.schema';

/**
 * [x] GET: /todos         // タスク一覧取得
 * [ ] GET: /todos/{id}    // タスク単一取得
 * [ ] POST: /todos        // タスク作成
 * [ ] PUT: /todos/{id}    // タスク更新
 * [ ] DELETE: /todos/{id} // タスク削除
 */
const todos = new Hono<{ Bindings: CloudflareBindings }>();

todos.get('/', async (c) => {
  try {
    const db = drizzle(c.env.todo);
    const result = await db.select().from(todo).where(eq(todo.user_id, 1)).all(); // TODO: user_idは認証（auth）API実装後に動的に取得すること

    const parsed = safeParse(todosResponseSchema, transformTodoResponse(result));
    if (!parsed.success) {
      console.error(parsed.issues);
      return c.json({ message: 'Internal Server Error: Invalid response' }, 500);
    }

    return c.json(parsed.output, 200);
  } catch (e) {
    console.error(e);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

export default todos;
