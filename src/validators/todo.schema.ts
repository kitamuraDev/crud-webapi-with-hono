import { array, boolean, number, object, string } from 'valibot';

export const todoSchema = object({
  id: number(),
  title: string(),
  isCompleted: boolean(),
});
export const todosResponseSchema = array(todoSchema);
