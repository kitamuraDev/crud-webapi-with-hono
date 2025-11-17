import { array, boolean, object, string } from 'valibot';

export const TodoResponseSchema = object({
  id: string(),
  title: string(),
  isCompleted: boolean(),
});

export const TodosResponseSchema = array(TodoResponseSchema);

export const TodoCreateSchema = object({
  title: string(),
});

export const TodoUpdateSchema = object({
  title: string(),
  isCompleted: boolean(),
});
