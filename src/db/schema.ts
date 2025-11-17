import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  password: text('password').notNull(),
});

export const todo = sqliteTable('todo', {
  id: int('id').primaryKey({ autoIncrement: true }),
  userId: int('user_id')
    .notNull()
    .references(() => user.id),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
});
