import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  password: text().notNull(),
});

export const todo = sqliteTable('todo', {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: int()
    .notNull()
    .references(() => user.id),
  title: text().notNull(),
  is_completed: integer().notNull(), // 0 or 1で管理（boolean型はsqliteに存在しないため）
});
