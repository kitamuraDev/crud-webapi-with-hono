import { array, boolean, number, object, string } from 'valibot';

export const TodoResponseSchema = object({
  id: number(),
  title: string(),
  isCompleted: boolean(),
});

export const TodosResponseSchema = array(TodoResponseSchema);

export const TodoCreateSchema = object({
  title: string(),
  isCompleted: number(),
});
