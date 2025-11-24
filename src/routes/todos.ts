import { sValidator } from '@hono/standard-validator';
import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { safeParse } from 'valibot';
import { createHonoApp } from '../app';
import { todo } from '../db/schema';
import type { ErrorCause } from '../middleware/error';
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

  const db = c.get('db');
  const result = await db.select(selectTodoSchema).from(todo).where(eq(todo.userId, userId)).all();

  const parsed = safeParse(ResponseTodosSchema, result);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: 'INVALID_RESPONSE_DATA' satisfies ErrorCause });
  }

  return c.json(parsed.output, 200);
});

todos.get('/:id', sValidator('param', TodoIdParamSchema), async (c) => {
  const id = c.req.valid('param').id;
  const userId = c.get('userId');

  const db = c.get('db');
  const result = await db
    .select(selectTodoSchema)
    .from(todo)
    .where(and(eq(todo.userId, userId), eq(todo.id, id)))
    .get();

  if (!result) {
    throw new HTTPException(404, { cause: 'NOT_FOUND' satisfies ErrorCause });
  }

  const parsed = safeParse(ResponseTodoSchema, result);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: 'INVALID_RESPONSE_DATA' satisfies ErrorCause });
  }

  return c.json(parsed.output, 200);
});

todos.post('/', sValidator('json', CreateTodoSchema), async (c) => {
  const { title } = c.req.valid('json');
  const userId = c.get('userId');

  const db = c.get('db');
  const result = await db.insert(todo).values({ userId: userId, title }).returning(selectTodoSchema).get();

  const parsed = safeParse(ResponseTodoSchema, result);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: 'INVALID_RESPONSE_DATA' satisfies ErrorCause });
  }

  return c.json(parsed.output, 201);
});

todos.put('/:id', sValidator('param', TodoIdParamSchema), sValidator('json', UpdateTodoSchema), async (c) => {
  const id = c.req.valid('param').id;
  const body = c.req.valid('json');
  const userId = c.get('userId');

  const db = c.get('db');
  const result = await db
    .update(todo)
    .set(body)
    .where(and(eq(todo.userId, userId), eq(todo.id, id)))
    .returning(selectTodoSchema)
    .get();

  if (!result) {
    throw new HTTPException(404, { cause: 'NOT_FOUND' satisfies ErrorCause });
  }

  const parsed = safeParse(ResponseTodoSchema, result);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: 'INVALID_RESPONSE_DATA' satisfies ErrorCause });
  }

  return c.json(parsed.output, 200);
});

todos.delete('/:id', sValidator('param', TodoIdParamSchema), async (c) => {
  const id = c.req.valid('param').id;
  const userId = c.get('userId');

  const db = c.get('db');
  const result = await db
    .delete(todo)
    .where(and(eq(todo.userId, userId), eq(todo.id, id)))
    .returning(selectTodoSchema)
    .get();

  if (!result) {
    throw new HTTPException(404, { cause: 'NOT_FOUND' satisfies ErrorCause });
  }

  return c.newResponse(null, { status: 204 });
});

export default todos;
