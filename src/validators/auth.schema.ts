import { object, string } from 'valibot';

export const LoginBodySchema = object({
  name: string(),
  password: string(),
});
