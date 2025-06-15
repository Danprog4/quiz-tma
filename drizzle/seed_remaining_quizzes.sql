-- Additional questions for Quiz 4: World Cuisine
INSERT INTO questions (quiz_id, text, question_type, presentation_type, points) VALUES
(4, 'Какое блюдо является национальным блюдом Италии?', 'multiple_choice', 'text', 5),
(4, 'Из какой страны происходит суши?', 'multiple_choice', 'text', 5),
(4, 'Что такое паэлья?', 'multiple_choice', 'text', 5),
(4, 'Какой соус является основой для французского блюда "Беф Бургиньон"?', 'multiple_choice', 'text', 5),
(4, 'Что такое тапас?', 'multiple_choice', 'text', 5),
(4, 'Какая специя придает желтый цвет индийскому карри?', 'multiple_choice', 'text', 5),
(4, 'Из чего готовят традиционный греческий цацики?', 'multiple_choice', 'text', 5);

-- Answers for World Cuisine questions
INSERT INTO answers (question_id, text, is_correct) VALUES
-- Question 31
(31, 'Паста', true),
(31, 'Пицца', false),
(31, 'Ризотто', false),
(31, 'Лазанья', false),

-- Question 32
(32, 'Япония', true),
(32, 'Китай', false),
(32, 'Корея', false),
(32, 'Таиланд', false),

-- Question 33
(33, 'Испанское блюдо из риса с морепродуктами', true),
(33, 'Итальянская паста', false),
(33, 'Французский суп', false),
(33, 'Греческий салат', false),

-- Question 34
(34, 'Красное вино', true),
(34, 'Белое вино', false),
(34, 'Бульон', false),
(34, 'Сливки', false),

-- Question 35
(35, 'Испанские закуски', true),
(35, 'Итальянские десерты', false),
(35, 'Французские соусы', false),
(35, 'Греческие салаты', false),

-- Question 36
(36, 'Куркума', true),
(36, 'Шафран', false),
(36, 'Карри', false),
(36, 'Имбирь', false),

-- Question 37
(37, 'Йогурт, огурцы и чеснок', true),
(37, 'Сыр фета и оливки', false),
(37, 'Томаты и лук', false),
(37, 'Мед и орехи', false);

-- Questions for Quiz 5: Art and Painting
INSERT INTO questions (quiz_id, text, question_type, presentation_type, points) VALUES
(5, 'Кто написал картину "Мона Лиза"?', 'multiple_choice', 'text', 5),
(5, 'В каком музее находится "Звездная ночь" Ван Гога?', 'multiple_choice', 'text', 5),
(5, 'Кто является автором картины "Герника"?', 'multiple_choice', 'text', 5),
(5, 'Какой художник известен своими "Водяными лилиями"?', 'multiple_choice', 'text', 5),
(5, 'Кто написал "Девочку с жемчужной сережкой"?', 'multiple_choice', 'text', 5),
(5, 'Какой русский художник написал "Бурлаки на Волге"?', 'multiple_choice', 'text', 5),
(5, 'Что такое импрессионизм?', 'multiple_choice', 'text', 10),
(5, 'Кто является автором скульптуры "Мыслитель"?', 'multiple_choice', 'text', 5),
(5, 'Какой художник отрезал себе ухо?', 'multiple_choice', 'text', 5);

-- Answers for Art and Painting questions
INSERT INTO answers (question_id, text, is_correct) VALUES
-- Question 38
(38, 'Леонардо да Винчи', true),
(38, 'Микеланджело', false),
(38, 'Рафаэль', false),
(38, 'Донателло', false),

-- Question 39
(39, 'Музей современного искусства (MoMA)', true),
(39, 'Лувр', false),
(39, 'Эрмитаж', false),
(39, 'Прадо', false),

-- Question 40
(40, 'Пабло Пикассо', true),
(40, 'Сальвадор Дали', false),
(40, 'Анри Матисс', false),
(40, 'Жоан Миро', false),

-- Question 41
(41, 'Клод Моне', true),
(41, 'Огюст Ренуар', false),
(41, 'Эдгар Дега', false),
(41, 'Камиль Писсарро', false),

-- Question 42
(42, 'Ян Вермеер', true),
(42, 'Рембрандт', false),
(42, 'Питер Брейгель', false),
(42, 'Иероним Босх', false),

-- Question 43
(43, 'Илья Репин', true),
(43, 'Иван Шишкин', false),
(43, 'Василий Суриков', false),
(43, 'Виктор Васнецов', false),

-- Question 44
(44, 'Художественное направление, передающее изменчивые впечатления', true),
(44, 'Точное воспроизведение реальности', false),
(44, 'Абстрактное искусство', false),
(44, 'Религиозная живопись', false),

-- Question 45
(45, 'Огюст Роден', true),
(45, 'Микеланджело', false),
(45, 'Донателло', false),
(45, 'Бернини', false),

-- Question 46
(46, 'Винсент ван Гог', true),
(46, 'Поль Гоген', false),
(46, 'Анри де Тулуз-Лотрек', false),
(46, 'Поль Сезанн', false);

-- Update max_score for remaining quizzes
UPDATE quizzes SET max_score = 35 WHERE id = 4;
UPDATE quizzes SET max_score = 45 WHERE id = 5; 