import { array, boolean, number, object, string } from 'valibot';

export const TodoSchema = object({
  id: number(),
  title: string(),
  isCompleted: boolean(),
});
export const TodosResponseSchema = array(TodoSchema);
