import { sValidator } from '@hono/standard-validator';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { object, safeParse, string } from 'valibot';
import { todo } from '../db/schema';
import { transformTodoResponse, transformTodosResponse } from '../utils/transformers';
import { TodoCreateSchema, TodoResponseSchema, TodosResponseSchema, TodoUpdateSchema } from '../validators/todo.schema';

const todos = new Hono<{ Bindings: CloudflareBindings }>();
const userDamyId = 'tfi4wB9ZRyhzVE7EhIyht';

todos.get('/', async (c) => {
  try {
    const db = drizzle(c.env.todo);
    const result = await db.select().from(todo).where(eq(todo.userId, userDamyId)).all(); // TODO: user_idは認証（auth）API実装後に動的に取得すること

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
  const id = c.req.valid('param').id;

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .select()
      .from(todo)
      .where(and(eq(todo.userId, userDamyId), eq(todo.id, id)))
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
  const { title } = c.req.valid('json');

  try {
    const db = drizzle(c.env.todo);
    const result = await db.insert(todo).values({ userId: userDamyId, title }).returning().get();

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

todos.put('/:id', sValidator('param', object({ id: string() })), sValidator('json', TodoUpdateSchema), async (c) => {
  const id = c.req.valid('param').id;
  const body = c.req.valid('json');

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .update(todo)
      .set(body)
      .where(and(eq(todo.userId, userDamyId), eq(todo.id, id)))
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

todos.delete('/:id', sValidator('param', object({ id: string() })), async (c) => {
  const id = c.req.valid('param').id;

  try {
    const db = drizzle(c.env.todo);
    const result = await db
      .delete(todo)
      .where(and(eq(todo.userId, userDamyId), eq(todo.id, id)))
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
