BEGIN;

-- ---------------------------------------------------------------------------
-- Static dictionaries
-- ---------------------------------------------------------------------------
INSERT INTO public.continents (code, name_cs, name_en)
VALUES
	('EU', 'Evropa', 'Europe'),
	('AS', 'Asie', 'Asia'),
	('NA', 'Severní Amerika', 'North America'),
	('SA', 'Jižní Amerika', 'South America'),
	('AF', 'Afrika', 'Africa'),
	('OC', 'Oceánie', 'Oceania')
ON CONFLICT (code) DO UPDATE
SET
	name_cs = EXCLUDED.name_cs,
	name_en = EXCLUDED.name_en,
	updated_at = timezone('utc', now());

INSERT INTO public.countries (id, iso2, continent_code, name_cs, name_en)
VALUES
	('00000000-0000-0000-0000-000000000101', 'CZ', 'EU', 'Česko', 'Czech Republic'),
	('00000000-0000-0000-0000-000000000102', 'SK', 'EU', 'Slovensko', 'Slovakia'),
	('00000000-0000-0000-0000-000000000103', 'PL', 'EU', 'Polsko', 'Poland'),
	('00000000-0000-0000-0000-000000000104', 'DE', 'EU', 'Německo', 'Germany'),
	('00000000-0000-0000-0000-000000000105', 'AT', 'EU', 'Rakousko', 'Austria'),
	('00000000-0000-0000-0000-000000000106', 'HU', 'EU', 'Maďarsko', 'Hungary'),
	('00000000-0000-0000-0000-000000000107', 'IT', 'EU', 'Itálie', 'Italy'),
	('00000000-0000-0000-0000-000000000108', 'FR', 'EU', 'Francie', 'France'),
	('00000000-0000-0000-0000-000000000109', 'BE', 'EU', 'Belgie', 'Belgium'),
	('00000000-0000-0000-0000-000000000110', 'ES', 'EU', 'Španělsko', 'Spain'),
	('00000000-0000-0000-0000-000000000111', 'PT', 'EU', 'Portugalsko', 'Portugal'),
	('00000000-0000-0000-0000-000000000112', 'GR', 'EU', 'Řecko', 'Greece'),
	('00000000-0000-0000-0000-000000000113', 'JP', 'AS', 'Japonsko', 'Japan'),
	('00000000-0000-0000-0000-000000000114', 'IN', 'AS', 'Indie', 'India'),
	('00000000-0000-0000-0000-000000000115', 'TH', 'AS', 'Thajsko', 'Thailand'),
	('00000000-0000-0000-0000-000000000116', 'VN', 'AS', 'Vietnam', 'Vietnam'),
	('00000000-0000-0000-0000-000000000117', 'ID', 'AS', 'Indonésie', 'Indonesia'),
	('00000000-0000-0000-0000-000000000118', 'MY', 'AS', 'Malajsie', 'Malaysia'),
	('00000000-0000-0000-0000-000000000119', 'KR', 'AS', 'Jižní Korea', 'South Korea'),
	('00000000-0000-0000-0000-000000000120', 'MX', 'NA', 'Mexiko', 'Mexico')
ON CONFLICT (iso2) DO UPDATE
SET
	continent_code = EXCLUDED.continent_code,
	name_cs = EXCLUDED.name_cs,
	name_en = EXCLUDED.name_en,
	updated_at = timezone('utc', now());

INSERT INTO public.allergens (id, code, name_cs, name_en)
VALUES
	('00000000-0000-0000-0000-000000000201', 'gluten', 'Lepek', 'Gluten'),
	('00000000-0000-0000-0000-000000000202', 'lactose', 'Laktóza', 'Lactose'),
	('00000000-0000-0000-0000-000000000203', 'nuts', 'Ořechy', 'Nuts'),
	('00000000-0000-0000-0000-000000000204', 'eggs', 'Vejce', 'Eggs'),
	('00000000-0000-0000-0000-000000000205', 'soy', 'Sója', 'Soy'),
	('00000000-0000-0000-0000-000000000206', 'seafood', 'Mořské plody', 'Seafood')
ON CONFLICT (code) DO UPDATE
SET
	name_cs = EXCLUDED.name_cs,
	name_en = EXCLUDED.name_en,
	updated_at = timezone('utc', now());

INSERT INTO public.diet_types (id, code, name_cs, name_en)
VALUES
	('00000000-0000-0000-0000-000000000301', 'vegan', 'Veganská', 'Vegan'),
	('00000000-0000-0000-0000-000000000302', 'vegetarian', 'Vegetariánská', 'Vegetarian'),
	('00000000-0000-0000-0000-000000000303', 'pescatarian', 'Pescatariánská', 'Pescatarian'),
	('00000000-0000-0000-0000-000000000304', 'gluten_free', 'Bezlepková', 'Gluten Free'),
	('00000000-0000-0000-0000-000000000305', 'low_carb', 'Low-carb', 'Low Carb')
ON CONFLICT (code) DO UPDATE
SET
	name_cs = EXCLUDED.name_cs,
	name_en = EXCLUDED.name_en,
	updated_at = timezone('utc', now());

INSERT INTO public.recipe_categories (id, code, name_cs, name_en)
VALUES
	('00000000-0000-0000-0000-000000000401', 'breakfast', 'Snídaně', 'Breakfast'),
	('00000000-0000-0000-0000-000000000402', 'lunch', 'Oběd', 'Lunch'),
	('00000000-0000-0000-0000-000000000403', 'dinner', 'Večeře', 'Dinner'),
	('00000000-0000-0000-0000-000000000404', 'snack', 'Svačina', 'Snack'),
	('00000000-0000-0000-0000-000000000405', 'dessert', 'Dezert', 'Dessert'),
	('00000000-0000-0000-0000-000000000406', 'drink', 'Nápoj', 'Drink')
ON CONFLICT (code) DO UPDATE
SET
	name_cs = EXCLUDED.name_cs,
	name_en = EXCLUDED.name_en,
	updated_at = timezone('utc', now());

INSERT INTO public.recipe_tags (id, code, name_cs, name_en)
VALUES
	('00000000-0000-0000-0000-000000000501', 'quick', 'Rychlé', 'Quick'),
	('00000000-0000-0000-0000-000000000502', 'budget', 'Levné', 'Budget'),
	('00000000-0000-0000-0000-000000000503', 'healthy', 'Zdravé', 'Healthy'),
	('00000000-0000-0000-0000-000000000504', 'high_protein', 'Vysoký protein', 'High Protein'),
	('00000000-0000-0000-0000-000000000505', 'comfort_food', 'Comfort food', 'Comfort Food'),
	('00000000-0000-0000-0000-000000000506', 'meal_prep', 'Meal prep', 'Meal Prep'),
	('00000000-0000-0000-0000-000000000507', 'spicy', 'Pikantní', 'Spicy'),
	('00000000-0000-0000-0000-000000000508', 'party', 'Párty', 'Party'),
	('00000000-0000-0000-0000-000000000509', 'traditional', 'Tradiční', 'Traditional')
ON CONFLICT (code) DO UPDATE
SET
	name_cs = EXCLUDED.name_cs,
	name_en = EXCLUDED.name_en,
	updated_at = timezone('utc', now());

INSERT INTO public.ingredients (id, canonical_name, default_unit)
VALUES
	('00000000-0000-0000-0000-000000000601', 'rice', 'g'),
	('00000000-0000-0000-0000-000000000602', 'chicken', 'g'),
	('00000000-0000-0000-0000-000000000603', 'beef', 'g'),
	('00000000-0000-0000-0000-000000000604', 'pasta', 'g'),
	('00000000-0000-0000-0000-000000000605', 'eggs', 'pcs'),
	('00000000-0000-0000-0000-000000000606', 'tomato', 'g'),
	('00000000-0000-0000-0000-000000000607', 'onion', 'g'),
	('00000000-0000-0000-0000-000000000608', 'garlic', 'g'),
	('00000000-0000-0000-0000-000000000609', 'olive_oil', 'ml'),
	('00000000-0000-0000-0000-000000000610', 'potato', 'g'),
	('00000000-0000-0000-0000-000000000611', 'flour', 'g'),
	('00000000-0000-0000-0000-000000000612', 'milk', 'ml')
ON CONFLICT (canonical_name) DO UPDATE
SET
	default_unit = EXCLUDED.default_unit,
	updated_at = timezone('utc', now());

INSERT INTO public.level_config (level, xp_required_total)
SELECT lvl, ((lvl - 1) * (lvl - 1) * 120)::bigint
FROM generate_series(1, 30) AS lvl
ON CONFLICT (level) DO UPDATE
SET xp_required_total = EXCLUDED.xp_required_total;

INSERT INTO public.badges (id, code, name_cs, name_en, description_cs, description_en)
VALUES
	('00000000-0000-0000-0000-000000000701', 'first_recipe', 'První recept', 'First Recipe', 'Dokončil/a jsi první recept.', 'You completed your first recipe.'),
	('00000000-0000-0000-0000-000000000702', 'world_traveler', 'Světoběžník', 'World Traveler', 'Uvařil/a jsi recept z každého kontinentu.', 'Cooked a recipe from every continent.'),
	('00000000-0000-0000-0000-000000000703', 'streak_7', '7denní streak', '7-Day Streak', 'Vařil/a jsi 7 dní po sobě.', 'Cooked for 7 days in a row.'),
	('00000000-0000-0000-0000-000000000704', 'chapter_master', 'Mistr kapitoly', 'Chapter Master', 'Dokončil/a jsi kapitolu na 100%.', 'Completed a chapter at 100%.'),
	('00000000-0000-0000-0000-000000000705', 'challenge_winner', 'Challenge vítěz', 'Challenge Winner', 'Vyhrál/a jsi komunitní challenge.', 'Won a community challenge.'),
	('00000000-0000-0000-0000-000000000706', 'creator', 'Tvůrce', 'Creator', 'Vytvořil/a jsi vlastní recept.', 'Created your own recipe.'),
	('00000000-0000-0000-0000-000000000707', 'graduate', 'Absolvent', 'Graduate', 'Dokončil/a jsi kampaňovou větev.', 'Completed a campaign branch.'),
	('00000000-0000-0000-0000-000000000708', 'clan_player', 'Klanový hráč', 'Clan Player', 'Přidal/a ses do skupiny.', 'Joined a group.'),
	('00000000-0000-0000-0000-000000000709', 'food_photographer', 'Fotograf', 'Food Photographer', 'Nahrál/a jsi 10 fotek jídel.', 'Uploaded 10 food photos.')
ON CONFLICT (code) DO UPDATE
SET
	name_cs = EXCLUDED.name_cs,
	name_en = EXCLUDED.name_en,
	description_cs = EXCLUDED.description_cs,
	description_en = EXCLUDED.description_en,
	updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Recipes (20 curated demo recipes)
-- ---------------------------------------------------------------------------
WITH recipe_seed AS (
	SELECT *
	FROM (VALUES
		('10000000-0000-0000-0000-000000000001', 'IT', 'EU', 'dinner', 3, 20, 15, 2, 'Pizza Margherita', 'Pizza Margherita', 'Klasická neapolská pizza s rajčaty, mozzarellou a bazalkou.', 'Classic Neapolitan pizza with tomatoes, mozzarella, and basil.'),
		('10000000-0000-0000-0000-000000000002', 'IT', 'EU', 'dinner', 4, 10, 15, 2, 'Cacio e Pepe', 'Cacio e Pepe', 'Římská pasta se sýrem a pepřem.', 'Roman pasta with cheese and black pepper.'),
		('10000000-0000-0000-0000-000000000003', 'FR', 'EU', 'dinner', 5, 30, 180, 4, 'Boeuf Bourguignon', 'Boeuf Bourguignon', 'Pomalé hovězí na víně s kořenovou zeleninou.', 'Slow-cooked beef in red wine with root vegetables.'),
		('10000000-0000-0000-0000-000000000004', 'MX', 'NA', 'dinner', 3, 40, 25, 4, 'Tacos al Pastor', 'Tacos al Pastor', 'Marinované vepřové tacos s ananasem.', 'Marinated pork tacos with pineapple.'),
		('10000000-0000-0000-0000-000000000005', 'JP', 'AS', 'dinner', 4, 30, 600, 4, 'Tonkotsu Ramen', 'Tonkotsu Ramen', 'Silný vepřový vývar s ramen nudlemi.', 'Rich pork broth with ramen noodles.'),
		('10000000-0000-0000-0000-000000000006', 'TH', 'AS', 'dinner', 3, 15, 10, 2, 'Pad Thai', 'Pad Thai', 'Smažené rýžové nudle s tamarindem.', 'Stir-fried rice noodles with tamarind.'),
		('10000000-0000-0000-0000-000000000007', 'VN', 'AS', 'dinner', 4, 25, 180, 4, 'Pho Bo', 'Pho Bo', 'Vietnamská hovězí polévka s bylinkami.', 'Vietnamese beef noodle soup with herbs.'),
		('10000000-0000-0000-0000-000000000008', 'IN', 'AS', 'dinner', 3, 20, 35, 3, 'Chicken Tikka Masala', 'Chicken Tikka Masala', 'Krémové kuřecí kari s rajčaty a kořením.', 'Creamy chicken curry with tomato and spices.'),
		('10000000-0000-0000-0000-000000000009', 'IN', 'AS', 'dinner', 2, 20, 60, 4, 'Dal Makhani', 'Dal Makhani', 'Pomalé čočkové kari s máslem.', 'Slow-cooked lentil curry with butter.'),
		('10000000-0000-0000-0000-000000000010', 'ES', 'EU', 'lunch', 3, 25, 35, 4, 'Paella Valenciana', 'Paella Valenciana', 'Španělská paella se šafránem.', 'Traditional Valencian saffron paella.'),
		('10000000-0000-0000-0000-000000000011', 'PT', 'EU', 'dessert', 2, 25, 20, 6, 'Pasteis de Nata', 'Pasteis de Nata', 'Křehké košíčky s vanilkovým krémem.', 'Crisp tarts with vanilla custard.'),
		('10000000-0000-0000-0000-000000000012', 'GR', 'EU', 'lunch', 3, 25, 45, 4, 'Spanakopita', 'Spanakopita', 'Řecký koláč se špenátem a fetou.', 'Greek pie with spinach and feta.'),
		('10000000-0000-0000-0000-000000000013', 'CZ', 'EU', 'dinner', 3, 30, 90, 4, 'Svíčková', 'Svíčková', 'Česká klasika s omáčkou a knedlíkem.', 'Czech classic with cream sauce and dumplings.'),
		('10000000-0000-0000-0000-000000000014', 'PL', 'EU', 'dinner', 2, 30, 25, 4, 'Pierogi Ruskie', 'Pierogi Ruskie', 'Plněné taštičky s bramborami a tvarohem.', 'Dumplings filled with potato and curd cheese.'),
		('10000000-0000-0000-0000-000000000015', 'AT', 'EU', 'dinner', 2, 20, 15, 2, 'Wiener Schnitzel', 'Wiener Schnitzel', 'Telecí řízek smažený dozlatova.', 'Golden fried veal schnitzel.'),
		('10000000-0000-0000-0000-000000000016', 'DE', 'EU', 'dinner', 2, 20, 30, 2, 'Bratwurst mit Sauerkraut', 'Bratwurst mit Sauerkraut', 'Klobása s kysaným zelím.', 'Bratwurst with sauerkraut.'),
		('10000000-0000-0000-0000-000000000017', 'HU', 'EU', 'lunch', 2, 20, 60, 4, 'Guláš', 'Goulash', 'Pikantní hovězí guláš s paprikou.', 'Paprika-rich beef goulash.'),
		('10000000-0000-0000-0000-000000000018', 'BE', 'EU', 'dinner', 2, 15, 20, 2, 'Moules Frites', 'Moules Frites', 'Slávky ve víně s hranolky.', 'Mussels in white wine with fries.'),
		('10000000-0000-0000-0000-000000000019', 'MY', 'AS', 'dinner', 2, 15, 12, 2, 'Nasi Goreng', 'Nasi Goreng', 'Indonéská smažená rýže.', 'Indonesian fried rice.'),
		('10000000-0000-0000-0000-000000000020', 'KR', 'AS', 'dinner', 3, 20, 25, 2, 'Bibimbap', 'Bibimbap', 'Korejská miska s rýží, zeleninou a vejcem.', 'Korean bowl with rice, vegetables, and egg.')
	) AS r(id, iso2, continent_code, category_code, difficulty, prep_minutes, cook_minutes, servings, title_cs, title_en, description_cs, description_en)
)
INSERT INTO public.recipes (
	id,
	owner_user_id,
	type,
	visibility,
	difficulty,
	prep_time_minutes,
	cook_time_minutes,
	servings,
	country_id,
	continent_code,
	category_id,
	is_published,
	ai_generated
)
SELECT
	r.id::uuid,
	NULL,
	'curated'::public.recipe_type,
	'public'::public.recipe_visibility,
	r.difficulty,
	r.prep_minutes,
	r.cook_minutes,
	r.servings,
	c.id,
	r.continent_code,
	rc.id,
	true,
	false
FROM recipe_seed r
JOIN public.countries c ON c.iso2 = r.iso2
JOIN public.recipe_categories rc ON rc.code = r.category_code
ON CONFLICT (id) DO UPDATE
SET
	difficulty = EXCLUDED.difficulty,
	prep_time_minutes = EXCLUDED.prep_time_minutes,
	cook_time_minutes = EXCLUDED.cook_time_minutes,
	servings = EXCLUDED.servings,
	country_id = EXCLUDED.country_id,
	continent_code = EXCLUDED.continent_code,
	category_id = EXCLUDED.category_id,
	updated_at = timezone('utc', now());

WITH recipe_seed AS (
	SELECT *
	FROM (VALUES
		('10000000-0000-0000-0000-000000000001', 'Pizza Margherita', 'Pizza Margherita', 'Klasická neapolská pizza s rajčaty, mozzarellou a bazalkou.', 'Classic Neapolitan pizza with tomatoes, mozzarella, and basil.'),
		('10000000-0000-0000-0000-000000000002', 'Cacio e Pepe', 'Cacio e Pepe', 'Římská pasta se sýrem a pepřem.', 'Roman pasta with cheese and black pepper.'),
		('10000000-0000-0000-0000-000000000003', 'Boeuf Bourguignon', 'Boeuf Bourguignon', 'Pomalé hovězí na víně s kořenovou zeleninou.', 'Slow-cooked beef in red wine with root vegetables.'),
		('10000000-0000-0000-0000-000000000004', 'Tacos al Pastor', 'Tacos al Pastor', 'Marinované vepřové tacos s ananasem.', 'Marinated pork tacos with pineapple.'),
		('10000000-0000-0000-0000-000000000005', 'Tonkotsu Ramen', 'Tonkotsu Ramen', 'Silný vepřový vývar s ramen nudlemi.', 'Rich pork broth with ramen noodles.'),
		('10000000-0000-0000-0000-000000000006', 'Pad Thai', 'Pad Thai', 'Smažené rýžové nudle s tamarindem.', 'Stir-fried rice noodles with tamarind.'),
		('10000000-0000-0000-0000-000000000007', 'Pho Bo', 'Pho Bo', 'Vietnamská hovězí polévka s bylinkami.', 'Vietnamese beef noodle soup with herbs.'),
		('10000000-0000-0000-0000-000000000008', 'Chicken Tikka Masala', 'Chicken Tikka Masala', 'Krémové kuřecí kari s rajčaty a kořením.', 'Creamy chicken curry with tomato and spices.'),
		('10000000-0000-0000-0000-000000000009', 'Dal Makhani', 'Dal Makhani', 'Pomalé čočkové kari s máslem.', 'Slow-cooked lentil curry with butter.'),
		('10000000-0000-0000-0000-000000000010', 'Paella Valenciana', 'Paella Valenciana', 'Španělská paella se šafránem.', 'Traditional Valencian saffron paella.'),
		('10000000-0000-0000-0000-000000000011', 'Pastéis de Nata', 'Pasteis de Nata', 'Křehké košíčky s vanilkovým krémem.', 'Crisp tarts with vanilla custard.'),
		('10000000-0000-0000-0000-000000000012', 'Spanakopita', 'Spanakopita', 'Řecký koláč se špenátem a fetou.', 'Greek pie with spinach and feta.'),
		('10000000-0000-0000-0000-000000000013', 'Svíčková', 'Svíčková', 'Česká klasika s omáčkou a knedlíkem.', 'Czech classic with cream sauce and dumplings.'),
		('10000000-0000-0000-0000-000000000014', 'Pierogi Ruskie', 'Pierogi Ruskie', 'Plněné taštičky s bramborami a tvarohem.', 'Dumplings filled with potato and curd cheese.'),
		('10000000-0000-0000-0000-000000000015', 'Wiener Schnitzel', 'Wiener Schnitzel', 'Telecí řízek smažený dozlatova.', 'Golden fried veal schnitzel.'),
		('10000000-0000-0000-0000-000000000016', 'Bratwurst mit Sauerkraut', 'Bratwurst mit Sauerkraut', 'Klobása s kysaným zelím.', 'Bratwurst with sauerkraut.'),
		('10000000-0000-0000-0000-000000000017', 'Guláš', 'Goulash', 'Pikantní hovězí guláš s paprikou.', 'Paprika-rich beef goulash.'),
		('10000000-0000-0000-0000-000000000018', 'Moules Frites', 'Moules Frites', 'Slávky ve víně s hranolky.', 'Mussels in white wine with fries.'),
		('10000000-0000-0000-0000-000000000019', 'Nasi Goreng', 'Nasi Goreng', 'Indonéská smažená rýže.', 'Indonesian fried rice.'),
		('10000000-0000-0000-0000-000000000020', 'Bibimbap', 'Bibimbap', 'Korejská miska s rýží, zeleninou a vejcem.', 'Korean bowl with rice, vegetables, and egg.')
	) AS r(recipe_id, title_cs, title_en, description_cs, description_en)
)
INSERT INTO public.recipe_translations (recipe_id, locale, title, description)
SELECT r.recipe_id::uuid, 'cs'::public.app_language, r.title_cs, r.description_cs
FROM recipe_seed r
ON CONFLICT (recipe_id, locale) DO UPDATE
SET
	title = EXCLUDED.title,
	description = EXCLUDED.description,
	updated_at = timezone('utc', now());

WITH recipe_seed AS (
	SELECT *
	FROM (VALUES
		('10000000-0000-0000-0000-000000000001', 'Pizza Margherita', 'Classic Neapolitan pizza with tomatoes, mozzarella, and basil.'),
		('10000000-0000-0000-0000-000000000002', 'Cacio e Pepe', 'Roman pasta with cheese and black pepper.'),
		('10000000-0000-0000-0000-000000000003', 'Boeuf Bourguignon', 'Slow-cooked beef in red wine with root vegetables.'),
		('10000000-0000-0000-0000-000000000004', 'Tacos al Pastor', 'Marinated pork tacos with pineapple.'),
		('10000000-0000-0000-0000-000000000005', 'Tonkotsu Ramen', 'Rich pork broth with ramen noodles.'),
		('10000000-0000-0000-0000-000000000006', 'Pad Thai', 'Stir-fried rice noodles with tamarind.'),
		('10000000-0000-0000-0000-000000000007', 'Pho Bo', 'Vietnamese beef noodle soup with herbs.'),
		('10000000-0000-0000-0000-000000000008', 'Chicken Tikka Masala', 'Creamy chicken curry with tomato and spices.'),
		('10000000-0000-0000-0000-000000000009', 'Dal Makhani', 'Slow-cooked lentil curry with butter.'),
		('10000000-0000-0000-0000-000000000010', 'Paella Valenciana', 'Traditional Valencian saffron paella.'),
		('10000000-0000-0000-0000-000000000011', 'Pasteis de Nata', 'Crisp tarts with vanilla custard.'),
		('10000000-0000-0000-0000-000000000012', 'Spanakopita', 'Greek pie with spinach and feta.'),
		('10000000-0000-0000-0000-000000000013', 'Svíčková', 'Czech classic with cream sauce and dumplings.'),
		('10000000-0000-0000-0000-000000000014', 'Pierogi Ruskie', 'Dumplings filled with potato and curd cheese.'),
		('10000000-0000-0000-0000-000000000015', 'Wiener Schnitzel', 'Golden fried veal schnitzel.'),
		('10000000-0000-0000-0000-000000000016', 'Bratwurst mit Sauerkraut', 'Bratwurst with sauerkraut.'),
		('10000000-0000-0000-0000-000000000017', 'Goulash', 'Paprika-rich beef goulash.'),
		('10000000-0000-0000-0000-000000000018', 'Moules Frites', 'Mussels in white wine with fries.'),
		('10000000-0000-0000-0000-000000000019', 'Nasi Goreng', 'Indonesian fried rice.'),
		('10000000-0000-0000-0000-000000000020', 'Bibimbap', 'Korean bowl with rice, vegetables, and egg.')
	) AS r(recipe_id, title_en, description_en)
)
INSERT INTO public.recipe_translations (recipe_id, locale, title, description)
SELECT r.recipe_id::uuid, 'en'::public.app_language, r.title_en, r.description_en
FROM recipe_seed r
ON CONFLICT (recipe_id, locale) DO UPDATE
SET
	title = EXCLUDED.title,
	description = EXCLUDED.description,
	updated_at = timezone('utc', now());

INSERT INTO public.recipe_steps (id, recipe_id, step_number, default_timer_seconds)
SELECT
	gen_random_uuid(),
	r.id,
	s.step_number,
	CASE WHEN s.step_number = 2 THEN 600 ELSE NULL END
FROM public.recipes r
CROSS JOIN (VALUES (1), (2), (3)) AS s(step_number)
WHERE r.id::text LIKE '10000000-0000-0000-0000-0000000000%'
	AND NOT EXISTS (
		SELECT 1
		FROM public.recipe_steps rs
		WHERE rs.recipe_id = r.id
			AND rs.step_number = s.step_number
	);

INSERT INTO public.recipe_step_translations (step_id, locale, instruction, tip)
SELECT
	rs.id,
	'cs'::public.app_language,
	CASE rs.step_number
		WHEN 1 THEN 'Připrav si všechny suroviny a pracovní plochu.'
		WHEN 2 THEN 'Uvař hlavní část receptu podle doporučeného času.'
		ELSE 'Dokonči servírování a dochuť podle chuti.'
	END,
	CASE rs.step_number
		WHEN 2 THEN 'Komunikuj se Šéfem, pokud potřebuješ náhradu surovin.'
		ELSE NULL
	END
FROM public.recipe_steps rs
JOIN public.recipes r ON r.id = rs.recipe_id
WHERE r.id::text LIKE '10000000-0000-0000-0000-0000000000%'
	AND NOT EXISTS (
		SELECT 1
		FROM public.recipe_step_translations rst
		WHERE rst.step_id = rs.id
			AND rst.locale = 'cs'
	);

INSERT INTO public.recipe_step_translations (step_id, locale, instruction, tip)
SELECT
	rs.id,
	'en'::public.app_language,
	CASE rs.step_number
		WHEN 1 THEN 'Prepare all ingredients and your workspace.'
		WHEN 2 THEN 'Cook the main part of the recipe for the suggested time.'
		ELSE 'Finish plating and adjust seasoning to taste.'
	END,
	CASE rs.step_number
		WHEN 2 THEN 'Ask Chef AI if you need ingredient substitutions.'
		ELSE NULL
	END
FROM public.recipe_steps rs
JOIN public.recipes r ON r.id = rs.recipe_id
WHERE r.id::text LIKE '10000000-0000-0000-0000-0000000000%'
	AND NOT EXISTS (
		SELECT 1
		FROM public.recipe_step_translations rst
		WHERE rst.step_id = rs.id
			AND rst.locale = 'en'
	);

INSERT INTO public.recipe_ingredients (id, recipe_id, custom_name, amount, unit, prep_note, is_optional, sort_order)
SELECT gen_random_uuid(), r.id, 'hlavní surovina', 1, 'portion', NULL, false, 1
FROM public.recipes r
WHERE r.id::text LIKE '10000000-0000-0000-0000-0000000000%'
	AND NOT EXISTS (
		SELECT 1 FROM public.recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.sort_order = 1
	);

INSERT INTO public.recipe_ingredients (id, recipe_id, custom_name, amount, unit, prep_note, is_optional, sort_order)
SELECT gen_random_uuid(), r.id, 'dochucení', 1, 'pinch', NULL, true, 2
FROM public.recipes r
WHERE r.id::text LIKE '10000000-0000-0000-0000-0000000000%'
	AND NOT EXISTS (
		SELECT 1 FROM public.recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.sort_order = 2
	);

INSERT INTO public.recipe_tag_links (recipe_id, tag_id)
SELECT r.id, t.id
FROM public.recipes r
JOIN public.recipe_tags t ON t.code IN ('traditional', 'comfort_food')
WHERE r.id::text LIKE '10000000-0000-0000-0000-0000000000%'
ON CONFLICT DO NOTHING;

INSERT INTO public.recipe_tag_links (recipe_id, tag_id)
SELECT r.id, t.id
FROM public.recipes r
JOIN public.recipe_tags t ON t.code = 'quick'
WHERE r.id::text IN (
	'10000000-0000-0000-0000-000000000006',
	'10000000-0000-0000-0000-000000000019',
	'10000000-0000-0000-0000-000000000020'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id
FROM public.recipes r
JOIN public.allergens a ON a.code = 'gluten'
WHERE r.id::text IN (
	'10000000-0000-0000-0000-000000000001',
	'10000000-0000-0000-0000-000000000002',
	'10000000-0000-0000-0000-000000000011',
	'10000000-0000-0000-0000-000000000014'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id
FROM public.recipes r
JOIN public.allergens a ON a.code = 'lactose'
WHERE r.id::text IN (
	'10000000-0000-0000-0000-000000000001',
	'10000000-0000-0000-0000-000000000002',
	'10000000-0000-0000-0000-000000000003',
	'10000000-0000-0000-0000-000000000013'
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Campaign structure (1 visible tree with 5 playable nodes)
-- ---------------------------------------------------------------------------
INSERT INTO public.campaigns (
	id,
	slug,
	is_active,
	title_cs,
	title_en,
	description_cs,
	description_en
)
VALUES (
	'20000000-0000-0000-0000-000000000001',
	'zemloveka-main',
	true,
	'žemLOVEka: Cesta kuchaře',
	'zemLOVEka: Chef Journey',
	'Hlavní příběhová kampaň se stromovou progresí a větvením.',
	'Main story campaign with tree progression and branching.'
)
ON CONFLICT (slug) DO UPDATE
SET
	is_active = EXCLUDED.is_active,
	title_cs = EXCLUDED.title_cs,
	title_en = EXCLUDED.title_en,
	description_cs = EXCLUDED.description_cs,
	description_en = EXCLUDED.description_en,
	updated_at = timezone('utc', now());

INSERT INTO public.campaign_nodes (
	id,
	campaign_id,
	node_key,
	chapter_order,
	map_x,
	map_y,
	suggested_skill_level,
	is_start_node,
	is_branching_node,
	is_demo_playable
)
VALUES
	('20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', 'first_dinner', 1, 0, 0, 1, true, true, true),
	('20000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000001', 'move_out', 2, -2, 1, 2, false, false, true),
	('20000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000001', 'quick_weeknight', 2, 2, 1, 2, false, false, true),
	('20000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000001', 'date_night', 3, -3, 2, 3, false, false, true),
	('20000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000001', 'first_party', 3, 3, 2, 3, false, false, true),
	('20000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000001', 'holiday_feast', 4, -4, 3, 5, false, true, false),
	('20000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000001', 'world_cuisine', 4, 4, 3, 5, false, true, false),
	('20000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000001', 'master_chef', 5, 0, 4, 7, false, false, false)
ON CONFLICT (campaign_id, node_key) DO UPDATE
SET
	chapter_order = EXCLUDED.chapter_order,
	map_x = EXCLUDED.map_x,
	map_y = EXCLUDED.map_y,
	suggested_skill_level = EXCLUDED.suggested_skill_level,
	is_start_node = EXCLUDED.is_start_node,
	is_branching_node = EXCLUDED.is_branching_node,
	is_demo_playable = EXCLUDED.is_demo_playable,
	updated_at = timezone('utc', now());

INSERT INTO public.campaign_node_translations (node_id, locale, title, summary, narrative_intro)
VALUES
	('20000000-0000-0000-0000-000000000011', 'cs', 'První večeře', 'Začni od základů.', 'Právě ses rozhodl/a vařit místo objednávky.'),
	('20000000-0000-0000-0000-000000000011', 'en', 'First Dinner', 'Start with the basics.', 'You decide to cook instead of ordering out.'),
	('20000000-0000-0000-0000-000000000012', 'cs', 'Odstěhování od rodiny', 'Jídla na každý den.', 'Máš vlastní kuchyň a omezený rozpočet.'),
	('20000000-0000-0000-0000-000000000012', 'en', 'Moving Out', 'Everyday meals.', 'You now have your own kitchen and a limited budget.'),
	('20000000-0000-0000-0000-000000000013', 'cs', 'Rychlé večery', 'Rychle a efektivně.', 'Potřebuješ vařit i ve dnech, kdy nestíháš.'),
	('20000000-0000-0000-0000-000000000013', 'en', 'Quick Weeknights', 'Fast and efficient.', 'You need recipes for busy evenings.'),
	('20000000-0000-0000-0000-000000000014', 'cs', 'Rande večeře', 'Vaření pro dva.', 'Chceš někoho ohromit vlastním jídlem.'),
	('20000000-0000-0000-0000-000000000014', 'en', 'Date Night', 'Cooking for two.', 'You want to impress someone with your cooking.'),
	('20000000-0000-0000-0000-000000000015', 'cs', 'První večírek', 'Vaření pro skupinu.', 'Hosté už jsou na cestě, ty zapínáš plotnu.'),
	('20000000-0000-0000-0000-000000000015', 'en', 'First Party', 'Cooking for a group.', 'Guests are on their way and the stove is on.'),
	('20000000-0000-0000-0000-000000000016', 'cs', 'Sváteční hostina', 'Pokročilé techniky.', 'Teď už nejde jen o chuť, ale i o prezentaci.'),
	('20000000-0000-0000-0000-000000000016', 'en', 'Holiday Feast', 'Advanced techniques.', 'Now it is not only about taste but presentation too.'),
	('20000000-0000-0000-0000-000000000017', 'cs', 'Světová kuchyně', 'Objevuj chutě světa.', 'Vydej se mimo komfortní zónu.'),
	('20000000-0000-0000-0000-000000000017', 'en', 'World Cuisine', 'Explore global flavors.', 'Step beyond your comfort zone.'),
	('20000000-0000-0000-0000-000000000018', 'cs', 'Mistr kuchyně', 'Finální zkouška.', 'Propojíš všechno, co ses naučil/a.'),
	('20000000-0000-0000-0000-000000000018', 'en', 'Master Chef', 'Final exam.', 'Combine everything you have learned.')
ON CONFLICT (node_id, locale) DO UPDATE
SET
	title = EXCLUDED.title,
	summary = EXCLUDED.summary,
	narrative_intro = EXCLUDED.narrative_intro,
	updated_at = timezone('utc', now());

INSERT INTO public.campaign_edges (
	id,
	campaign_id,
	from_node_id,
	to_node_id,
	decision_key,
	decision_label_cs,
	decision_label_en,
	sort_order,
	is_default_path
)
VALUES
	('20000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000012', 'healthy_path', 'Zdravě a pravidelně', 'Healthy and consistent', 1, true),
	('20000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000013', 'fast_path', 'Rychle a prakticky', 'Fast and practical', 2, false),
	('20000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000014', NULL, NULL, NULL, 1, true),
	('20000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000015', NULL, NULL, NULL, 1, true),
	('20000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000016', NULL, NULL, NULL, 1, true),
	('20000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000017', NULL, NULL, NULL, 1, true),
	('20000000-0000-0000-0000-000000000027', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000018', NULL, NULL, NULL, 1, true),
	('20000000-0000-0000-0000-000000000028', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000018', NULL, NULL, NULL, 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cutscenes (id, node_id, phase, script_json, ai_generated)
VALUES
	('20000000-0000-0000-0000-000000000031', '20000000-0000-0000-0000-000000000011', 'pre_level', '{"scene":"intro","lines":["Vítej v žemLOVEka.","Začínáme prvním jídlem."]}'::jsonb, false),
	('20000000-0000-0000-0000-000000000032', '20000000-0000-0000-0000-000000000012', 'pre_level', '{"scene":"move_out","lines":["Nový byt.","Nová kuchyň."]}'::jsonb, false),
	('20000000-0000-0000-0000-000000000033', '20000000-0000-0000-0000-000000000013', 'pre_level', '{"scene":"quick_night","lines":["Máš málo času.","Jdeme vařit rychle."]}'::jsonb, false),
	('20000000-0000-0000-0000-000000000034', '20000000-0000-0000-0000-000000000014', 'pre_level', '{"scene":"date_night","lines":["Večeře pro dva.","Každý detail se počítá."]}'::jsonb, false),
	('20000000-0000-0000-0000-000000000035', '20000000-0000-0000-0000-000000000015', 'pre_level', '{"scene":"party","lines":["Přichází hosté.","Potřebuješ plán."]}'::jsonb, false)
ON CONFLICT (node_id, phase) DO UPDATE
SET
	script_json = EXCLUDED.script_json,
	ai_generated = EXCLUDED.ai_generated,
	updated_at = timezone('utc', now());

INSERT INTO public.campaign_tasks (id, node_id, task_kind, task_order, xp_reward)
VALUES
	('20000000-0000-0000-0000-000000000041', '20000000-0000-0000-0000-000000000011', 'main', 1, 100),
	('20000000-0000-0000-0000-000000000042', '20000000-0000-0000-0000-000000000011', 'subtask', 2, 50),
	('20000000-0000-0000-0000-000000000043', '20000000-0000-0000-0000-000000000012', 'main', 1, 100),
	('20000000-0000-0000-0000-000000000044', '20000000-0000-0000-0000-000000000012', 'subtask', 2, 50),
	('20000000-0000-0000-0000-000000000045', '20000000-0000-0000-0000-000000000013', 'main', 1, 100),
	('20000000-0000-0000-0000-000000000046', '20000000-0000-0000-0000-000000000013', 'subtask', 2, 50),
	('20000000-0000-0000-0000-000000000047', '20000000-0000-0000-0000-000000000014', 'main', 1, 100),
	('20000000-0000-0000-0000-000000000048', '20000000-0000-0000-0000-000000000014', 'subtask', 2, 50),
	('20000000-0000-0000-0000-000000000049', '20000000-0000-0000-0000-000000000015', 'main', 1, 100),
	('20000000-0000-0000-0000-000000000050', '20000000-0000-0000-0000-000000000015', 'subtask', 2, 50)
ON CONFLICT (node_id, task_order) DO UPDATE
SET
	task_kind = EXCLUDED.task_kind,
	xp_reward = EXCLUDED.xp_reward,
	updated_at = timezone('utc', now());

INSERT INTO public.campaign_task_translations (task_id, locale, title, description, objective)
VALUES
	('20000000-0000-0000-0000-000000000041', 'cs', 'První talíř', 'Uvař hlavní recept kapitoly.', 'Dokonči recept bez přerušení.'),
	('20000000-0000-0000-0000-000000000041', 'en', 'First Plate', 'Cook the chapter main recipe.', 'Finish the recipe in one flow.'),
	('20000000-0000-0000-0000-000000000042', 'cs', 'Volitelný trénink', 'Zkus vedlejší recept.', 'Dokonči aspoň 1 vedlejší recept.'),
	('20000000-0000-0000-0000-000000000042', 'en', 'Optional Practice', 'Try a side recipe.', 'Complete at least 1 side recipe.'),
	('20000000-0000-0000-0000-000000000043', 'cs', 'Každodenní vaření', 'Postav si rutinu.', 'Navař kompletní večeři.'),
	('20000000-0000-0000-0000-000000000043', 'en', 'Daily Cooking', 'Build your cooking routine.', 'Cook one complete dinner.'),
	('20000000-0000-0000-0000-000000000044', 'cs', 'Bonus recept', 'Rozšiř repertoár.', 'Uvař bonusový recept.'),
	('20000000-0000-0000-0000-000000000044', 'en', 'Bonus Recipe', 'Expand your repertoire.', 'Cook one bonus recipe.'),
	('20000000-0000-0000-0000-000000000045', 'cs', 'Rychlá mise', 'Stihni to do hodiny.', 'Dokonči recept pod 60 minut.'),
	('20000000-0000-0000-0000-000000000045', 'en', 'Quick Mission', 'Finish within an hour.', 'Complete recipe under 60 minutes.'),
	('20000000-0000-0000-0000-000000000046', 'cs', 'Mikro challenge', 'Zkus alternativu.', 'Použij aspoň 1 náhradu suroviny.'),
	('20000000-0000-0000-0000-000000000046', 'en', 'Micro Challenge', 'Try an alternative.', 'Use at least 1 ingredient substitution.'),
	('20000000-0000-0000-0000-000000000047', 'cs', 'Večeře pro dva', 'Udělej dojem.', 'Připrav jídlo ve dvou porcích.'),
	('20000000-0000-0000-0000-000000000047', 'en', 'Dinner for Two', 'Make an impression.', 'Prepare the meal for two servings.'),
	('20000000-0000-0000-0000-000000000048', 'cs', 'Vylepšení servisu', 'Zaměř se na prezentaci.', 'Přidej finální plating.'),
	('20000000-0000-0000-0000-000000000048', 'en', 'Plating Upgrade', 'Focus on presentation.', 'Add final plating touches.'),
	('20000000-0000-0000-0000-000000000049', 'cs', 'Hostitelská mise', 'Navař pro skupinu.', 'Připrav alespoň 4 porce.'),
	('20000000-0000-0000-0000-000000000049', 'en', 'Host Mission', 'Cook for a group.', 'Prepare at least 4 servings.'),
	('20000000-0000-0000-0000-000000000050', 'cs', 'Předkrm navíc', 'Přidej bonus.', 'Uvař i druhý recept.'),
	('20000000-0000-0000-0000-000000000050', 'en', 'Extra Starter', 'Add a bonus dish.', 'Cook a second recipe too.')
ON CONFLICT (task_id, locale) DO UPDATE
SET
	title = EXCLUDED.title,
	description = EXCLUDED.description,
	objective = EXCLUDED.objective,
	updated_at = timezone('utc', now());

INSERT INTO public.campaign_task_recipes (campaign_task_id, recipe_id, is_primary)
VALUES
	('20000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000001', true),
	('20000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000002', false),
	('20000000-0000-0000-0000-000000000043', '10000000-0000-0000-0000-000000000013', true),
	('20000000-0000-0000-0000-000000000044', '10000000-0000-0000-0000-000000000014', false),
	('20000000-0000-0000-0000-000000000045', '10000000-0000-0000-0000-000000000006', true),
	('20000000-0000-0000-0000-000000000046', '10000000-0000-0000-0000-000000000019', false),
	('20000000-0000-0000-0000-000000000047', '10000000-0000-0000-0000-000000000003', true),
	('20000000-0000-0000-0000-000000000048', '10000000-0000-0000-0000-000000000011', false),
	('20000000-0000-0000-0000-000000000049', '10000000-0000-0000-0000-000000000010', true),
	('20000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000018', false)
ON CONFLICT (campaign_task_id, recipe_id) DO UPDATE
SET is_primary = EXCLUDED.is_primary;

-- ---------------------------------------------------------------------------
-- Challenges (public demo placeholders)
-- ---------------------------------------------------------------------------
INSERT INTO public.challenges (
	id,
	challenge_type,
	difficulty,
	status,
	title_cs,
	title_en,
	description_cs,
	description_en,
	generated_by_ai,
	ai_model,
	starts_at,
	ends_at,
	voting_ends_at,
	created_by_user_id
)
VALUES
	(
		'30000000-0000-0000-0000-000000000001',
		'personal',
		'easy',
		'active',
		'Denní challenge: 5 surovin',
		'Daily Challenge: 5 Ingredients',
		'Uvař jídlo pouze z pěti surovin.',
		'Cook a dish using only five ingredients.',
		true,
		'gemini-3.1-flash-lite',
		timezone('utc', now()) - interval '2 hours',
		timezone('utc', now()) + interval '22 hours',
		NULL,
		NULL
	),
	(
		'30000000-0000-0000-0000-000000000002',
		'community',
		NULL,
		'active',
		'Týdenní challenge: Itálie',
		'Weekly Challenge: Italy',
		'Uvař vlastní interpretaci italského jídla.',
		'Cook your own interpretation of an Italian dish.',
		true,
		'gemini-3.1-flash-lite',
		timezone('utc', now()) - interval '1 day',
		timezone('utc', now()) + interval '6 days',
		timezone('utc', now()) + interval '7 days',
		NULL
	)
ON CONFLICT (id) DO UPDATE
SET
	status = EXCLUDED.status,
	title_cs = EXCLUDED.title_cs,
	title_en = EXCLUDED.title_en,
	description_cs = EXCLUDED.description_cs,
	description_en = EXCLUDED.description_en,
	starts_at = EXCLUDED.starts_at,
	ends_at = EXCLUDED.ends_at,
	voting_ends_at = EXCLUDED.voting_ends_at,
	updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Glossary (20 terms)
-- ---------------------------------------------------------------------------
INSERT INTO public.glossary_terms (id, slug)
VALUES
	('40000000-0000-0000-0000-000000000001', 'mise-en-place'),
	('40000000-0000-0000-0000-000000000002', 'deglaze'),
	('40000000-0000-0000-0000-000000000003', 'blanching'),
	('40000000-0000-0000-0000-000000000004', 'searing'),
	('40000000-0000-0000-0000-000000000005', 'al-dente'),
	('40000000-0000-0000-0000-000000000006', 'julienne'),
	('40000000-0000-0000-0000-000000000007', 'roux'),
	('40000000-0000-0000-0000-000000000008', 'emulsion'),
	('40000000-0000-0000-0000-000000000009', 'folding'),
	('40000000-0000-0000-0000-000000000010', 'resting-meat'),
	('40000000-0000-0000-0000-000000000011', 'caramelization'),
	('40000000-0000-0000-0000-000000000012', 'reduction'),
	('40000000-0000-0000-0000-000000000013', 'tempering'),
	('40000000-0000-0000-0000-000000000014', 'proofing'),
	('40000000-0000-0000-0000-000000000015', 'rendering-fat'),
	('40000000-0000-0000-0000-000000000016', 'braising'),
	('40000000-0000-0000-0000-000000000017', 'simmering'),
	('40000000-0000-0000-0000-000000000018', 'plating'),
	('40000000-0000-0000-0000-000000000019', 'seasoning'),
	('40000000-0000-0000-0000-000000000020', 'umami')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.glossary_term_translations (term_id, locale, term, definition, example_usage)
SELECT
	t.id,
	'cs'::public.app_language,
	v.term_cs,
	v.definition_cs,
	v.example_cs
FROM public.glossary_terms t
JOIN (
	VALUES
		('mise-en-place', 'Mise en place', 'Příprava surovin a nástrojů před začátkem vaření.', 'Než zapneš sporák, udělej si mise en place.'),
		('deglaze', 'Deglazovat', 'Uvolnění chutí ze dna pánve pomocí tekutiny.', 'Po opečení masa deglazuj pánev vývarem.'),
		('blanching', 'Blanšírování', 'Krátké spaření a rychlé zchlazení potraviny.', 'Fazole blanšíruj, aby zůstaly křupavé.'),
		('searing', 'Zatažení', 'Rychlé opečení povrchu na vysoké teplotě.', 'Steak nejdřív zatahni na rozpálené pánvi.'),
		('al-dente', 'Al dente', 'Uvaření těstovin tak, aby byly na skus.', 'Špagety vař al dente podle času na obalu.'),
		('julienne', 'Julienne', 'Krájení na tenké nudličky.', 'Mrkev nakrájej na julienne do salátu.'),
		('roux', 'Jíška', 'Směs tuku a mouky pro zahuštění omáček.', 'Omáčku zahusti světlou jíškou.'),
		('emulsion', 'Emulze', 'Spojení dvou neslučitelných tekutin do stabilní směsi.', 'Majonéza je emulze oleje a žloutku.'),
		('folding', 'Zlehka vmíchat', 'Opatrné spojení směsi bez ztráty objemu.', 'Sníh do těsta zlehka vmíchej stěrkou.'),
		('resting-meat', 'Odpočinek masa', 'Nechání masa po tepelné úpravě odležet.', 'Po pečení nech maso 10 minut odpočívat.'),
		('caramelization', 'Karamelizace', 'Zhnědnutí cukrů teplem a vznik komplexní chuti.', 'Cibuli nech karamelizovat pomalu.'),
		('reduction', 'Redukce', 'Zahuštění tekutiny odpařením.', 'Omáčku redukuj na polovinu objemu.'),
		('tempering', 'Temperování', 'Postupné vyrovnání teplot dvou směsí.', 'Vejce temperuj horkou tekutinou po částech.'),
		('proofing', 'Kynutí', 'Fáze, kdy těsto nabývá objemu díky droždí.', 'Těsto nech kynout v teple.'),
		('rendering-fat', 'Vypečení tuku', 'Pomalejší uvolnění tuku z masa.', 'Slaninu restuj pomalu, aby pustila tuk.'),
		('braising', 'Dušení', 'Kombinace opečení a pomalého vaření v tekutině.', 'Hovězí duš v troubě pod pokličkou.'),
		('simmering', 'Mírný var', 'Vaření těsně pod bodem varu.', 'Vývar táhni na mírném varu.'),
		('plating', 'Plating', 'Vizuální aranžování jídla na talíři.', 'Před podáváním věnuj pozornost platingu.'),
		('seasoning', 'Dochucení', 'Vyvážení soli, kyselosti, sladkosti a dalších chutí.', 'Na konci vždy uprav dochucení.'),
		('umami', 'Umami', 'Pátá základní chuť, vnímaná jako „masová“.', 'Parmazán a houby přidávají umami.')
) AS v(slug, term_cs, definition_cs, example_cs)
	ON v.slug = t.slug
ON CONFLICT (term_id, locale) DO UPDATE
SET
	term = EXCLUDED.term,
	definition = EXCLUDED.definition,
	example_usage = EXCLUDED.example_usage,
	updated_at = timezone('utc', now());

INSERT INTO public.glossary_term_translations (term_id, locale, term, definition, example_usage)
SELECT
	t.id,
	'en'::public.app_language,
	v.term_en,
	v.definition_en,
	v.example_en
FROM public.glossary_terms t
JOIN (
	VALUES
		('mise-en-place', 'Mise en place', 'Preparing ingredients and tools before cooking starts.', 'Do your mise en place before heating the pan.'),
		('deglaze', 'Deglaze', 'Lifting browned bits from a pan with liquid.', 'Deglaze the pan with stock after searing.'),
		('blanching', 'Blanching', 'Briefly boiling and shocking food in cold water.', 'Blanch green beans to keep them crisp.'),
		('searing', 'Searing', 'Quick high-heat browning of a food surface.', 'Sear the steak on a very hot pan first.'),
		('al-dente', 'Al dente', 'Cooked so pasta still has a firm bite.', 'Boil spaghetti until al dente.'),
		('julienne', 'Julienne', 'Cutting food into thin matchsticks.', 'Julienne carrots for the salad.'),
		('roux', 'Roux', 'Fat and flour mixture used for thickening.', 'Start the sauce with a light roux.'),
		('emulsion', 'Emulsion', 'Stable mixture of two liquids that usually do not combine.', 'Mayonnaise is an emulsion of oil and egg yolk.'),
		('folding', 'Folding', 'Gently combining mixtures without deflating them.', 'Fold whipped whites into the batter.'),
		('resting-meat', 'Resting meat', 'Letting cooked meat sit before slicing.', 'Rest the meat for 10 minutes after roasting.'),
		('caramelization', 'Caramelization', 'Browning of sugars that creates deeper flavor.', 'Caramelize onions slowly for better sweetness.'),
		('reduction', 'Reduction', 'Concentrating liquid by simmering off water.', 'Reduce the sauce by half.'),
		('tempering', 'Tempering', 'Gradually bringing two mixtures to a similar temperature.', 'Temper eggs with hot liquid step by step.'),
		('proofing', 'Proofing', 'Rising stage of dough caused by yeast.', 'Let the dough proof in a warm place.'),
		('rendering-fat', 'Rendering fat', 'Slowly melting fat out of meat.', 'Render bacon slowly to release fat.'),
		('braising', 'Braising', 'Sear first, then cook slowly in liquid.', 'Braise beef in the oven with lid on.'),
		('simmering', 'Simmering', 'Cooking liquid just below a full boil.', 'Keep the stock at a gentle simmer.'),
		('plating', 'Plating', 'Arranging food attractively on the plate.', 'Spend a moment on plating before serving.'),
		('seasoning', 'Seasoning', 'Balancing salt, acid, sweetness, and spice.', 'Adjust seasoning at the very end.'),
		('umami', 'Umami', 'The savory fifth basic taste.', 'Mushrooms and parmesan add umami.')
) AS v(slug, term_en, definition_en, example_en)
	ON v.slug = t.slug
ON CONFLICT (term_id, locale) DO UPDATE
SET
	term = EXCLUDED.term,
	definition = EXCLUDED.definition,
	example_usage = EXCLUDED.example_usage,
	updated_at = timezone('utc', now());

COMMIT;
