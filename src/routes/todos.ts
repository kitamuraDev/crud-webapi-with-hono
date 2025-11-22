import { sValidator } from '@hono/standard-validator';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { type Context, Hono } from 'hono';
import { safeParse } from 'valibot';
import { todo } from '../db/schema';
import { jwtAuthMiddleware } from '../middleware/auth';
import { transformTodoResponse, transformTodosResponse } from '../utils/transformers';
import {
  CreateTodoSchema,
  ResponseTodoSchema,
  ResponseTodosSchema,
  TodoIdParamSchema,
  UpdateTodoSchema,
} from '../validators/todo.schema';

const todos = new Hono<{ Bindings: CloudflareBindings }>();

// JWTペイロードからuserIdを取得するユーティリティ関数
const getUserIdFromPayload = (c: Context<{ Bindings: CloudflareBindings }>) => c.get('jwtPayload').sub as string;

// トークンの検証（認可制御）
todos.use('*', jwtAuthMiddleware);

todos.get('/', async (c) => {
  const userId = getUserIdFromPayload(c);

  try {
    const db = drizzle(c.env.todo);
    const result = await db.select().from(todo).where(eq(todo.userId, userId)).all();

    const parsed = safeParse(ResponseTodosSchema, transformTodosResponse(result));
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

todos.get('/:id', sValidator('param', TodoIdParamSchema), async (c) => {
  const id = c.req.valid('param').id;
  const userId = getUserIdFromPayload(c);

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .select()
      .from(todo)
      .where(and(eq(todo.userId, userId), eq(todo.id, id)))
      .get();

    if (!result) {
      return c.json({ message: 'Not Found' }, 404);
    }

    const parsed = safeParse(ResponseTodoSchema, transformTodoResponse(result));
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

todos.post('/', sValidator('json', CreateTodoSchema), async (c) => {
  const { title } = c.req.valid('json');
  const userId = getUserIdFromPayload(c);

  try {
    const db = drizzle(c.env.todo);
    const result = await db.insert(todo).values({ userId: userId, title }).returning().get();

    const parsed = safeParse(ResponseTodoSchema, transformTodoResponse(result));
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

todos.put('/:id', sValidator('param', TodoIdParamSchema), sValidator('json', UpdateTodoSchema), async (c) => {
  const id = c.req.valid('param').id;
  const body = c.req.valid('json');
  const userId = getUserIdFromPayload(c);

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .update(todo)
      .set(body)
      .where(and(eq(todo.userId, userId), eq(todo.id, id)))
      .returning()
      .get();

    if (!result) {
      return c.json({ message: 'Not Found' }, 404);
    }

    const parsed = safeParse(ResponseTodoSchema, transformTodoResponse(result));
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

todos.delete('/:id', sValidator('param', TodoIdParamSchema), async (c) => {
  const id = c.req.valid('param').id;
  const userId = getUserIdFromPayload(c);

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .delete(todo)
      .where(and(eq(todo.userId, userId), eq(todo.id, id)))
      .returning()
      .get();

    if (!result) {
      return c.json({ message: 'Not Found' }, 404);
    }

    return c.newResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

export default todos;
