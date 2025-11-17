import type { InferSelectModel } from 'drizzle-orm';
import type { InferOutput } from 'valibot';
import type { todo } from '../db/schema';
import type { ResponseTodoSchema } from '../validators/todo.schema';

type InputTodoType = InferSelectModel<typeof todo>;
type OutputTodoType = InferOutput<typeof ResponseTodoSchema>;

export const transformTodoResponse = (todo: InputTodoType): OutputTodoType => {
  return {
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted!,
  };
};

export const transformTodosResponse = (todos: InputTodoType[]): OutputTodoType[] => {
  return todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    isCompleted: todo.isCompleted!,
  }));
};
