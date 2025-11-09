import type { InferSelectModel } from 'drizzle-orm';
import type { InferOutput } from 'valibot';
import type { todo } from '../db/schema';
import type { todosResponseSchema } from '../validators/todo.schema';

type InputTodoType = InferSelectModel<typeof todo>;
type OutputTodoType = InferOutput<typeof todosResponseSchema>;

export function transformTodoResponse(todos: InputTodoType[]): OutputTodoType {
  return todos.map((t) => ({
    id: t.id,
    title: t.title,
    isCompleted: t.is_completed === 1,
  }));
}
