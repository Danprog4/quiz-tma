-- Очистка таблиц (если нужно)
-- DELETE FROM answers;
-- DELETE FROM questions;
-- DELETE FROM quizzes;

-- Создание 3 квизов в разных категориях
INSERT INTO quizzes (title, category, description, image_url, is_popular, is_new, max_score, collaborator_name, collaborator_logo, collaborator_link) VALUES
('Великие события истории', 'История', 'Проверьте свои знания о важнейших исторических событиях', 'https://example.com/history-quiz.jpg', true, false, 25, 'Исторический музей', 'https://example.com/museum-logo.png', 'https://example.com/museum'),
('Основы физики', 'Наука', 'Тест на знание основных физических законов и явлений', 'https://example.com/physics-quiz.jpg', false, true, 25, 'Научный центр', 'https://example.com/science-logo.png', 'https://example.com/science-center'),
('Футбольные легенды', 'Спорт', 'Всё о великих футболистах и знаменитых матчах', 'https://example.com/football-quiz.jpg', true, true, 25, 'Спортивный канал', 'https://example.com/sport-logo.png', 'https://example.com/sport-channel');

-- Вопросы для квиза "Великие события истории"
INSERT INTO questions (quiz_id, text, question_type, presentation_type, media_url, explanation, points) VALUES
((SELECT id FROM quizzes WHERE title = 'Великие события истории'), 'В каком году началась Вторая мировая война?', 'multiple_choice', 'text', null, 'Вторая мировая война началась 1 сентября 1939 года с нападения Германии на Польшу.', 5),
((SELECT id FROM quizzes WHERE title = 'Великие события истории'), 'Кто был первым человеком, высадившимся на Луну?', 'multiple_choice', 'text', null, 'Нил Армстронг стал первым человеком, ступившим на поверхность Луны 20 июля 1969 года.', 5),
((SELECT id FROM quizzes WHERE title = 'Великие события истории'), 'В каком году пала Берлинская стена?', 'multiple_choice', 'text', null, 'Берлинская стена была разрушена в 1989 году, что символизировало окончание холодной войны.', 5),
((SELECT id FROM quizzes WHERE title = 'Великие события истории'), 'Кто написал "Коммунистический манифест"?', 'multiple_choice', 'text', null, 'Карл Маркс и Фридрих Энгельс написали "Коммунистический манифест" в 1848 году.', 5),
((SELECT id FROM quizzes WHERE title = 'Великие события истории'), 'В каком году была открыта Америка Колумбом?', 'multiple_choice', 'text', null, 'Христофор Колумб открыл Америку в 1492 году.', 5);

-- Вопросы для квиза "Основы физики"
INSERT INTO questions (quiz_id, text, question_type, presentation_type, media_url, explanation, points) VALUES
((SELECT id FROM quizzes WHERE title = 'Основы физики'), 'Что такое сила тяжести?', 'multiple_choice', 'text', null, 'Сила тяжести - это сила притяжения между объектами, обладающими массой.', 5),
((SELECT id FROM quizzes WHERE title = 'Основы физики'), 'Какая скорость света в вакууме?', 'multiple_choice', 'text', null, 'Скорость света в вакууме составляет приблизительно 299,792,458 м/с.', 5),
((SELECT id FROM quizzes WHERE title = 'Основы физики'), 'Что изучает термодинамика?', 'multiple_choice', 'text', null, 'Термодинамика изучает тепловые явления и превращения энергии.', 5),
((SELECT id FROM quizzes WHERE title = 'Основы физики'), 'Кто сформулировал законы движения?', 'multiple_choice', 'text', null, 'Исаак Ньютон сформулировал три основных закона движения.', 5),
((SELECT id FROM quizzes WHERE title = 'Основы физики'), 'Что такое электрический ток?', 'multiple_choice', 'text', null, 'Электрический ток - это направленное движение электрических зарядов.', 5);

-- Вопросы для квиза "Футбольные легенды"
INSERT INTO questions (quiz_id, text, question_type, presentation_type, media_url, explanation, points) VALUES
((SELECT id FROM quizzes WHERE title = 'Футбольные легенды'), 'Сколько игроков играет в футбол на поле от одной команды?', 'multiple_choice', 'text', null, 'В футболе на поле одновременно играет 11 игроков от каждой команды.', 5),
((SELECT id FROM quizzes WHERE title = 'Футбольные легенды'), 'Кто считается лучшим футболистом всех времен?', 'multiple_choice', 'text', null, 'Пеле считается одним из величайших футболистов в истории.', 5),
((SELECT id FROM quizzes WHERE title = 'Футбольные легенды'), 'Какая страна выиграла первый чемпионат мира по футболу?', 'multiple_choice', 'text', null, 'Уругвай выиграл первый чемпионат мира по футболу в 1930 году.', 5),
((SELECT id FROM quizzes WHERE title = 'Футбольные легенды'), 'Сколько длится футбольный матч?', 'multiple_choice', 'text', null, 'Футбольный матч длится 90 минут (два тайма по 45 минут) плюс добавленное время.', 5),
((SELECT id FROM quizzes WHERE title = 'Футбольные легенды'), 'Какой клуб выиграл больше всего Лиг чемпионов?', 'multiple_choice', 'text', null, 'Реал Мадрид выиграл наибольшее количество титулов Лиги чемпионов.', 5);

-- Ответы для вопросов квиза "Великие события истории"
INSERT INTO answers (question_id, text, is_correct) VALUES
-- В каком году началась Вторая мировая война?
((SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?'), '1939', true),
((SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?'), '1940', false),
((SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?'), '1941', false),
((SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?'), '1938', false),

-- Кто был первым человеком, высадившимся на Луну?
((SELECT id FROM questions WHERE text = 'Кто был первым человеком, высадившимся на Луну?'), 'Нил Армстронг', true),
((SELECT id FROM questions WHERE text = 'Кто был первым человеком, высадившимся на Луну?'), 'Базз Олдрин', false),
((SELECT id FROM questions WHERE text = 'Кто был первым человеком, высадившимся на Луну?'), 'Юрий Гагарин', false),
((SELECT id FROM questions WHERE text = 'Кто был первым человеком, высадившимся на Луну?'), 'Джон Гленн', false),

-- В каком году пала Берлинская стена?
((SELECT id FROM questions WHERE text = 'В каком году пала Берлинская стена?'), '1989', true),
((SELECT id FROM questions WHERE text = 'В каком году пала Берлинская стена?'), '1990', false),
((SELECT id FROM questions WHERE text = 'В каком году пала Берлинская стена?'), '1988', false),
((SELECT id FROM questions WHERE text = 'В каком году пала Берлинская стена?'), '1991', false),

-- Кто написал "Коммунистический манифест"?
((SELECT id FROM questions WHERE text = 'Кто написал "Коммунистический манифест"?'), 'Карл Маркс и Фридрих Энгельс', true),
((SELECT id FROM questions WHERE text = 'Кто написал "Коммунистический манифест"?'), 'Владимир Ленин', false),
((SELECT id FROM questions WHERE text = 'Кто написал "Коммунистический манифест"?'), 'Иосиф Сталин', false),
((SELECT id FROM questions WHERE text = 'Кто написал "Коммунистический манифест"?'), 'Лев Троцкий', false),

-- В каком году была открыта Америка Колумбом?
((SELECT id FROM questions WHERE text = 'В каком году была открыта Америка Колумбом?'), '1492', true),
((SELECT id FROM questions WHERE text = 'В каком году была открыта Америка Колумбом?'), '1491', false),
((SELECT id FROM questions WHERE text = 'В каком году была открыта Америка Колумбом?'), '1493', false),
((SELECT id FROM questions WHERE text = 'В каком году была открыта Америка Колумбом?'), '1490', false);

-- Ответы для вопросов квиза "Основы физики"
INSERT INTO answers (question_id, text, is_correct) VALUES
-- Что такое сила тяжести?
((SELECT id FROM questions WHERE text = 'Что такое сила тяжести?'), 'Сила притяжения между объектами с массой', true),
((SELECT id FROM questions WHERE text = 'Что такое сила тяжести?'), 'Сила отталкивания', false),
((SELECT id FROM questions WHERE text = 'Что такое сила тяжести?'), 'Электромагнитная сила', false),
((SELECT id FROM questions WHERE text = 'Что такое сила тяжести?'), 'Ядерная сила', false),

-- Какая скорость света в вакууме?
((SELECT id FROM questions WHERE text = 'Какая скорость света в вакууме?'), '299,792,458 м/с', true),
((SELECT id FROM questions WHERE text = 'Какая скорость света в вакууме?'), '300,000,000 м/с', false),
((SELECT id FROM questions WHERE text = 'Какая скорость света в вакууме?'), '299,000,000 м/с', false),
((SELECT id FROM questions WHERE text = 'Какая скорость света в вакууме?'), '298,000,000 м/с', false),

-- Что изучает термодинамика?
((SELECT id FROM questions WHERE text = 'Что изучает термодинамика?'), 'Тепловые явления и превращения энергии', true),
((SELECT id FROM questions WHERE text = 'Что изучает термодинамика?'), 'Движение тел', false),
((SELECT id FROM questions WHERE text = 'Что изучает термодинамика?'), 'Электрические явления', false),
((SELECT id FROM questions WHERE text = 'Что изучает термодинамика?'), 'Световые явления', false),

-- Кто сформулировал законы движения?
((SELECT id FROM questions WHERE text = 'Кто сформулировал законы движения?'), 'Исаак Ньютон', true),
((SELECT id FROM questions WHERE text = 'Кто сформулировал законы движения?'), 'Альберт Эйнштейн', false),
((SELECT id FROM questions WHERE text = 'Кто сформулировал законы движения?'), 'Галилео Галилей', false),
((SELECT id FROM questions WHERE text = 'Кто сформулировал законы движения?'), 'Никола Тесла', false),

-- Что такое электрический ток?
((SELECT id FROM questions WHERE text = 'Что такое электрический ток?'), 'Направленное движение электрических зарядов', true),
((SELECT id FROM questions WHERE text = 'Что такое электрический ток?'), 'Статическое электричество', false),
((SELECT id FROM questions WHERE text = 'Что такое электрический ток?'), 'Магнитное поле', false),
((SELECT id FROM questions WHERE text = 'Что такое электрический ток?'), 'Световая волна', false);

-- Ответы для вопросов квиза "Футбольные легенды"
INSERT INTO answers (question_id, text, is_correct) VALUES
-- Сколько игроков играет в футбол на поле от одной команды?
((SELECT id FROM questions WHERE text = 'Сколько игроков играет в футбол на поле от одной команды?'), '11', true),
((SELECT id FROM questions WHERE text = 'Сколько игроков играет в футбол на поле от одной команды?'), '10', false),
((SELECT id FROM questions WHERE text = 'Сколько игроков играет в футбол на поле от одной команды?'), '12', false),
((SELECT id FROM questions WHERE text = 'Сколько игроков играет в футбол на поле от одной команды?'), '9', false),

-- Кто считается лучшим футболистом всех времен?
((SELECT id FROM questions WHERE text = 'Кто считается лучшим футболистом всех времен?'), 'Пеле', true),
((SELECT id FROM questions WHERE text = 'Кто считается лучшим футболистом всех времен?'), 'Марадона', false),
((SELECT id FROM questions WHERE text = 'Кто считается лучшим футболистом всех времен?'), 'Месси', false),
((SELECT id FROM questions WHERE text = 'Кто считается лучшим футболистом всех времен?'), 'Роналду', false),

-- Какая страна выиграла первый чемпионат мира по футболу?
((SELECT id FROM questions WHERE text = 'Какая страна выиграла первый чемпионат мира по футболу?'), 'Уругвай', true),
((SELECT id FROM questions WHERE text = 'Какая страна выиграла первый чемпионат мира по футболу?'), 'Бразилия', false),
((SELECT id FROM questions WHERE text = 'Какая страна выиграла первый чемпионат мира по футболу?'), 'Аргентина', false),
((SELECT id FROM questions WHERE text = 'Какая страна выиграла первый чемпионат мира по футболу?'), 'Италия', false),

-- Сколько длится футбольный матч?
((SELECT id FROM questions WHERE text = 'Сколько длится футбольный матч?'), '90 минут', true),
((SELECT id FROM questions WHERE text = 'Сколько длится футбольный матч?'), '80 минут', false),
((SELECT id FROM questions WHERE text = 'Сколько длится футбольный матч?'), '100 минут', false),
((SELECT id FROM questions WHERE text = 'Сколько длится футбольный матч?'), '120 минут', false),

-- Какой клуб выиграл больше всего Лиг чемпионов?
((SELECT id FROM questions WHERE text = 'Какой клуб выиграл больше всего Лиг чемпионов?'), 'Реал Мадрид', true),
((SELECT id FROM questions WHERE text = 'Какой клуб выиграл больше всего Лиг чемпионов?'), 'Барселона', false),
((SELECT id FROM questions WHERE text = 'Какой клуб выиграл больше всего Лиг чемпионов?'), 'Манчестер Юнайтед', false),
((SELECT id FROM questions WHERE text = 'Какой клуб выиграл больше всего Лиг чемпионов?'), 'Милан', false); 