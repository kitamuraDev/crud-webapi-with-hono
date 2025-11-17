import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const user = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid())
    .notNull(),
  name: text('name').unique().notNull(),
  password: text('password').notNull(),
});

export const todo = sqliteTable('todo', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid())
    .notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
});
