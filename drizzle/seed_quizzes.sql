-- Seed script for adding new quizzes
-- Run this script to populate the database with sample quizzes

-- Insert new quizzes
INSERT INTO quizzes (title, description, image_url, is_popular, is_new, max_score, collaborator_name, collaborator_logo, collaborator_link) VALUES
('Основы JavaScript', 'Проверьте свои знания основ JavaScript - переменные, функции, объекты и многое другое', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500', true, false, 50, 'MDN Web Docs', 'https://developer.mozilla.org/favicon.ico', 'https://developer.mozilla.org'),
('История России', 'Увлекательный квиз по истории России от древних времен до наших дней', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', false, true, 40, 'Российское историческое общество', null, 'https://historyrussia.org'),
('Космос и астрономия', 'Путешествие по вселенной: планеты, звезды, галактики и космические открытия', 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=500', true, true, 60, 'NASA', 'https://www.nasa.gov/favicon.ico', 'https://www.nasa.gov'),
('Кулинария мира', 'Тест на знание блюд разных стран и кулинарных традиций', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', false, false, 35, null, null, null),
('Искусство и живопись', 'Проверьте свои знания в области изобразительного искусства и великих художников', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500', true, false, 45, 'Третьяковская галерея', null, 'https://tretyakovgallery.ru');

-- Get the IDs of inserted quizzes (assuming they start from ID 1)
-- Quiz 1: JavaScript Basics
INSERT INTO categories (quiz_id, name) VALUES
(1, 'Переменные и типы данных'),
(1, 'Функции'),
(1, 'Объекты и массивы'),
(1, 'DOM манипуляции'),
(1, 'Асинхронность');

-- Quiz 2: Russian History
INSERT INTO categories (quiz_id, name) VALUES
(2, 'Древняя Русь'),
(2, 'Российская империя'),
(2, 'СССР'),
(2, 'Современная Россия');

-- Quiz 3: Space and Astronomy
INSERT INTO categories (quiz_id, name) VALUES
(3, 'Солнечная система'),
(3, 'Звезды и галактики'),
(3, 'Космические миссии'),
(3, 'Астрономические открытия');

-- Quiz 4: World Cuisine
INSERT INTO categories (quiz_id, name) VALUES
(4, 'Европейская кухня'),
(4, 'Азиатская кухня'),
(4, 'Американская кухня'),
(4, 'Африканская кухня');

-- Quiz 5: Art and Painting
INSERT INTO categories (quiz_id, name) VALUES
(5, 'Ренессанс'),
(5, 'Импрессионизм'),
(5, 'Современное искусство'),
(5, 'Русская живопись');

-- Questions for Quiz 1: JavaScript Basics
INSERT INTO questions (quiz_id, text, question_type, presentation_type, points) VALUES
(1, 'Какой из следующих способов объявления переменной является устаревшим в современном JavaScript?', 'multiple_choice', 'text', 5),
(1, 'Что выведет следующий код: console.log(typeof null)?', 'multiple_choice', 'code', 5),
(1, 'Какой метод используется для добавления элемента в конец массива?', 'multiple_choice', 'text', 5),
(1, 'Что такое замыкание (closure) в JavaScript?', 'multiple_choice', 'text', 10),
(1, 'Какой из методов НЕ является методом массива в JavaScript?', 'multiple_choice', 'text', 5),
(1, 'Что делает оператор === в JavaScript?', 'multiple_choice', 'text', 5),
(1, 'Как правильно объявить стрелочную функцию?', 'multiple_choice', 'code', 5),
(1, 'Что выведет код: console.log(1 + "2" + 3)?', 'multiple_choice', 'code', 5),
(1, 'Какой метод используется для поиска элемента в DOM по ID?', 'multiple_choice', 'text', 5),
(1, 'Что такое Promise в JavaScript?', 'multiple_choice', 'text', 10);

-- Answers for JavaScript questions
INSERT INTO answers (question_id, text, is_correct) VALUES
-- Question 1
(1, 'var', true),
(1, 'let', false),
(1, 'const', false),
(1, 'function', false),

-- Question 2
(2, '"null"', false),
(2, '"undefined"', false),
(2, '"object"', true),
(2, '"boolean"', false),

-- Question 3
(3, 'push()', true),
(3, 'pop()', false),
(3, 'shift()', false),
(3, 'splice()', false),

-- Question 4
(4, 'Функция внутри другой функции', false),
(4, 'Способность функции запоминать переменные из внешней области видимости', true),
(4, 'Метод объекта', false),
(4, 'Асинхронная функция', false),

-- Question 5
(5, 'map()', false),
(5, 'filter()', false),
(5, 'reduce()', false),
(5, 'split()', true),

-- Question 6
(6, 'Присваивает значение', false),
(6, 'Сравнивает значения без учета типа', false),
(6, 'Сравнивает значения с учетом типа', true),
(6, 'Проверяет на null', false),

-- Question 7
(7, 'function() => {}', false),
(7, '() => {}', true),
(7, 'arrow function() {}', false),
(7, '=>() {}', false),

-- Question 8
(8, '"123"', true),
(8, '6', false),
(8, '"6"', false),
(8, 'NaN', false),

-- Question 9
(9, 'getElementById()', true),
(9, 'querySelector()', false),
(9, 'getElementsByClassName()', false),
(9, 'getElementsByTagName()', false),

-- Question 10
(10, 'Синхронная функция', false),
(10, 'Объект для работы с асинхронными операциями', true),
(10, 'Метод массива', false),
(10, 'Тип данных', false);

-- Questions for Quiz 2: Russian History
INSERT INTO questions (quiz_id, text, question_type, presentation_type, points) VALUES
(2, 'В каком году было крещение Руси?', 'multiple_choice', 'text', 5),
(2, 'Кто основал Санкт-Петербург?', 'multiple_choice', 'text', 5),
(2, 'В каком году произошла Октябрьская революция?', 'multiple_choice', 'text', 5),
(2, 'Сколько лет длилась Великая Отечественная война?', 'multiple_choice', 'text', 5),
(2, 'Кто был первым президентом России?', 'multiple_choice', 'text', 5),
(2, 'В каком году пал Константинополь?', 'multiple_choice', 'text', 5),
(2, 'Как называлась первая русская летопись?', 'multiple_choice', 'text', 5),
(2, 'В каком году было отменено крепостное право?', 'multiple_choice', 'text', 5);

-- Answers for Russian History questions
INSERT INTO answers (question_id, text, is_correct) VALUES
-- Question 11
(11, '988', true),
(11, '980', false),
(11, '990', false),
(11, '1000', false),

-- Question 12
(12, 'Петр I', true),
(12, 'Екатерина II', false),
(12, 'Иван Грозный', false),
(12, 'Александр I', false),

-- Question 13
(13, '1917', true),
(13, '1916', false),
(13, '1918', false),
(13, '1919', false),

-- Question 14
(14, '4 года', true),
(14, '3 года', false),
(14, '5 лет', false),
(14, '6 лет', false),

-- Question 15
(15, 'Борис Ельцин', true),
(15, 'Владимир Путин', false),
(15, 'Михаил Горбачев', false),
(15, 'Дмитрий Медведев', false),

-- Question 16
(16, '1453', true),
(16, '1450', false),
(16, '1455', false),
(16, '1460', false),

-- Question 17
(17, 'Повесть временных лет', true),
(17, 'Слово о полку Игореве', false),
(17, 'Русская правда', false),
(17, 'Домострой', false),

-- Question 18
(18, '1861', true),
(18, '1860', false),
(18, '1862', false),
(18, '1863', false);

-- Questions for Quiz 3: Space and Astronomy
INSERT INTO questions (quiz_id, text, question_type, presentation_type, points) VALUES
(3, 'Какая планета является самой большой в Солнечной системе?', 'multiple_choice', 'text', 5),
(3, 'Сколько спутников у Марса?', 'multiple_choice', 'text', 5),
(3, 'Как называется ближайшая к Земле звезда?', 'multiple_choice', 'text', 5),
(3, 'В каком году человек впервые высадился на Луну?', 'multiple_choice', 'text', 5),
(3, 'Что такое черная дыра?', 'multiple_choice', 'text', 10),
(3, 'Какая галактика является ближайшей к Млечному Пути?', 'multiple_choice', 'text', 10),
(3, 'Сколько планет в Солнечной системе?', 'multiple_choice', 'text', 5),
(3, 'Кто первым полетел в космос?', 'multiple_choice', 'text', 5),
(3, 'Что такое световой год?', 'multiple_choice', 'text', 10),
(3, 'Какая планета имеет самые яркие кольца?', 'multiple_choice', 'text', 5),
(3, 'Как называется космический телескоп NASA?', 'multiple_choice', 'text', 5),
(3, 'Что происходит с звездой в конце её жизни?', 'multiple_choice', 'text', 10);

-- Answers for Space and Astronomy questions
INSERT INTO answers (question_id, text, is_correct) VALUES
-- Question 19
(19, 'Юпитер', true),
(19, 'Сатурн', false),
(19, 'Нептун', false),
(19, 'Уран', false),

-- Question 20
(20, '2', true),
(20, '1', false),
(20, '3', false),
(20, '4', false),

-- Question 21
(21, 'Солнце', true),
(21, 'Проксима Центавра', false),
(21, 'Альфа Центавра', false),
(21, 'Сириус', false),

-- Question 22
(22, '1969', true),
(22, '1968', false),
(22, '1970', false),
(22, '1971', false),

-- Question 23
(23, 'Область в космосе с очень сильной гравитацией', true),
(23, 'Планета без атмосферы', false),
(23, 'Мертвая звезда', false),
(23, 'Космический корабль', false),

-- Question 24
(24, 'Андромеда', true),
(24, 'Магеллановы облака', false),
(24, 'Треугольник', false),
(24, 'Водоворот', false),

-- Question 25
(25, '8', true),
(25, '9', false),
(25, '7', false),
(25, '10', false),

-- Question 26
(26, 'Юрий Гагарин', true),
(26, 'Нил Армстронг', false),
(26, 'Алан Шепард', false),
(26, 'Герман Титов', false),

-- Question 27
(27, 'Расстояние, которое свет проходит за год', true),
(27, 'Время полета до ближайшей звезды', false),
(27, 'Скорость света', false),
(27, 'Возраст вселенной', false),

-- Question 28
(28, 'Сатурн', true),
(28, 'Юпитер', false),
(28, 'Уран', false),
(28, 'Нептун', false),

-- Question 29
(29, 'Хаббл', true),
(29, 'Кеплер', false),
(29, 'Спитцер', false),
(29, 'Чандра', false),

-- Question 30
(30, 'Может стать белым карликом, нейтронной звездой или черной дырой', true),
(30, 'Всегда взрывается', false),
(30, 'Превращается в планету', false),
(30, 'Исчезает', false);

-- Update max_score for quizzes based on total points
UPDATE quizzes SET max_score = 50 WHERE id = 1;
UPDATE quizzes SET max_score = 40 WHERE id = 2;
UPDATE quizzes SET max_score = 90 WHERE id = 3;
UPDATE quizzes SET max_score = 35 WHERE id = 4;
UPDATE quizzes SET max_score = 45 WHERE id = 5;

-- Add some sample quiz results (optional)
-- INSERT INTO users (id, name, photo_url, total_score) VALUES
-- (1, 'Тестовый пользователь', 'https://via.placeholder.com/150', 0);

-- INSERT INTO quiz_results (user_id, quiz_id, score) VALUES
-- (1, 1, 35),
-- (1, 2, 25),
-- (1, 3, 60); 