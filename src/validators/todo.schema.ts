import { array, boolean, nanoid, object, pipe, string } from 'valibot';

export const ResponseTodoSchema = object({
  id: pipe(string(), nanoid()),
  title: string(),
  isCompleted: boolean(),
});

export const ResponseTodosSchema = array(ResponseTodoSchema);

export const CreateTodoSchema = object({
  title: string(),
});

export const UpdateTodoSchema = object({
  title: string(),
  isCompleted: boolean(),
});

export const TodoIdParamSchema = object({
  id: pipe(string(), nanoid()),
});
