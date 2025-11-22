-- データリセット
DELETE FROM todo;
DELETE FROM user;

-- userテーブル初期データ
INSERT INTO user (id, name, password) VALUES ('tfi4wB9ZRyhzVE7EhIyht', 'Lillie', '$2b$10$U/PFBvBN3DKunefWBZ.hou/W8I/gjERN9svdYjnBNJDUOglSdTS7S');
INSERT INTO user (id, name, password) VALUES ('haymmUwLc0Osqh4zguRyb', 'Garcello', '$2b$10$ZdhcQITOOgVb0LjHCq.J8euD8BV0lF8qf7ptlPhD.xJD5U0kJkw6a');

-- todoテーブル初期データ
INSERT INTO todo (id, user_id, title, is_completed) VALUES ('bnzbOPCZuPz1_QVz67GtA', 'tfi4wB9ZRyhzVE7EhIyht', 'Buy groceries', 0);
INSERT INTO todo (id, user_id, title, is_completed) VALUES ('IUh_dL9ntx5CGYYWcHodC', 'tfi4wB9ZRyhzVE7EhIyht', 'Read a book', 1);
INSERT INTO todo (id, user_id, title, is_completed) VALUES ('R5R4gv6RZPX8ctT2JAiNi', 'tfi4wB9ZRyhzVE7EhIyht', 'Go for a walk', 0);
INSERT INTO todo (id, user_id, title, is_completed) VALUES ('_PCWeUxEbuBNz_mJqTCeZ', 'haymmUwLc0Osqh4zguRyb', 'Write code', 1);
INSERT INTO todo (id, user_id, title, is_completed) VALUES ('JIBr2VUPLsT-b2mtN55Zo', 'haymmUwLc0Osqh4zguRyb', 'Test app', 0);
INSERT INTO todo (id, user_id, title, is_completed) VALUES ('N--t1qdNDKq_KEgmx1mh8', 'haymmUwLc0Osqh4zguRyb', 'Deploy app', 0);
