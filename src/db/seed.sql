-- データリセット
DELETE FROM todo;
DELETE FROM user;

-- userテーブル初期データ
INSERT INTO user (id, name, password) VALUES (1, 'Alice', 'password1');
INSERT INTO user (id, name, password) VALUES (2, 'Bob', 'password2');

-- todoテーブル初期データ
INSERT INTO todo (id, user_id, title, is_completed) VALUES (1, 1, 'Buy groceries', 0);
INSERT INTO todo (id, user_id, title, is_completed) VALUES (2, 1, 'Read a book', 1);
INSERT INTO todo (id, user_id, title, is_completed) VALUES (3, 1, 'Go for a walk', 0);
INSERT INTO todo (id, user_id, title, is_completed) VALUES (4, 2, 'Write code', 1);
INSERT INTO todo (id, user_id, title, is_completed) VALUES (5, 2, 'Test app', 0);
INSERT INTO todo (id, user_id, title, is_completed) VALUES (6, 2, 'Deploy app', 0);
