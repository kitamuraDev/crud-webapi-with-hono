import { sValidator } from '@hono/standard-validator';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { object, safeParse, string } from 'valibot';
import { todo } from '../db/schema';
import { transformTodoResponse, transformTodosResponse } from '../utils/transformers';
import { TodoCreateSchema, TodoResponseSchema, TodosResponseSchema } from '../validators/todo.schema';

/**
 * [x] GET: /todos         // タスク一覧取得
 * [x] GET: /todos/{id}    // タスク単一取得
 * [x] POST: /todos        // タスク作成
 * [x] PUT: /todos/{id}    // タスク更新
 * [ ] DELETE: /todos/{id} // タスク削除
 */
const todos = new Hono<{ Bindings: CloudflareBindings }>();

todos.get('/', async (c) => {
  try {
    const db = drizzle(c.env.todo);
    const result = await db.select().from(todo).where(eq(todo.user_id, 1)).all(); // TODO: user_idは認証（auth）API実装後に動的に取得すること

    const parsed = safeParse(TodosResponseSchema, transformTodosResponse(result));
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

todos.get('/:id', sValidator('param', object({ id: string() })), async (c) => {
  const id = Number(c.req.valid('param').id);

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .select()
      .from(todo)
      .where(and(eq(todo.user_id, 1), eq(todo.id, id)))
      .get();

    if (!result) {
      return c.json({ message: 'Not Found' }, 404);
    }

    const parsed = safeParse(TodoResponseSchema, transformTodoResponse(result));
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

todos.post('/', sValidator('json', TodoCreateSchema), async (c) => {
  const { title, isCompleted } = c.req.valid('json');

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .insert(todo)
      .values({
        user_id: 1,
        title: title,
        is_completed: isCompleted,
      })
      .returning()
      .get();

    const parsed = safeParse(TodoResponseSchema, transformTodoResponse(result));
    if (!parsed.success) {
      console.error(parsed.issues);
      return c.json({ message: 'Internal Server Error: Invalid response' }, 500);
    }

    return c.json(parsed.output, 201);
  } catch (e) {
    console.error(e);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

todos.put('/:id', sValidator('param', object({ id: string() })), sValidator('json', TodoCreateSchema), async (c) => {
  const id = Number(c.req.valid('param').id);
  const { title, isCompleted } = c.req.valid('json');

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .update(todo)
      .set({
        title: title,
        is_completed: isCompleted,
      })
      .where(and(eq(todo.user_id, 1), eq(todo.id, id)))
      .returning()
      .get();

    if (!result) {
      return c.json({ message: 'Not Found' }, 404);
    }

    const parsed = safeParse(TodoResponseSchema, transformTodoResponse(result));
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
