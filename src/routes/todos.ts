import { sValidator } from '@hono/standard-validator';
import { and, eq } from 'drizzle-orm';
import { safeParse } from 'valibot';
import { createHonoApp } from '../app';
import { todo } from '../db/schema';
import {
  CreateTodoSchema,
  ResponseTodoSchema,
  ResponseTodosSchema,
  TodoIdParamSchema,
  UpdateTodoSchema,
} from '../validators/todo.schema';

const selectTodoSchema = {
  id: todo.id,
  title: todo.title,
  isCompleted: todo.isCompleted,
};

const todos = createHonoApp();

todos.get('/', async (c) => {
  const userId = c.get('userId');

  try {
    const db = c.get('db');
    const result = await db.select(selectTodoSchema).from(todo).where(eq(todo.userId, userId)).all();

    const parsed = safeParse(ResponseTodosSchema, result);
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
  const userId = c.get('userId');

  try {
    const db = c.get('db');
    const result = await db
      .select(selectTodoSchema)
      .from(todo)
      .where(and(eq(todo.userId, userId), eq(todo.id, id)))
      .get();

    if (!result) {
      return c.json({ message: 'Not Found' }, 404);
    }

    const parsed = safeParse(ResponseTodoSchema, result);
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
  const userId = c.get('userId');

  try {
    const db = c.get('db');
    const result = await db.insert(todo).values({ userId: userId, title }).returning(selectTodoSchema).get();

    const parsed = safeParse(ResponseTodoSchema, result);
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
  const userId = c.get('userId');

  try {
    const db = c.get('db');
    const result = await db
      .update(todo)
      .set(body)
      .where(and(eq(todo.userId, userId), eq(todo.id, id)))
      .returning(selectTodoSchema)
      .get();

    if (!result) {
      return c.json({ message: 'Not Found' }, 404);
    }

    const parsed = safeParse(ResponseTodoSchema, result);
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
  const userId = c.get('userId');

  try {
    const db = c.get('db');
    const result = await db
      .delete(todo)
      .where(and(eq(todo.userId, userId), eq(todo.id, id)))
      .returning(selectTodoSchema)
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
