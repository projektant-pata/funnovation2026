BEGIN;

-- ---------------------------------------------------------------------------
-- Seed users (password = heslo123 for pata/niki/stefy, demo1234 for demo)
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (id, email, password_hash)
VALUES
	('00000000-0000-0000-0001-000000000001', 'pata@zemloveka.cz',  '$2b$10$VFZPztpANeFAnVzDgg6DFOzcn1WOa37TTq4lctI9Pu8BUdZVm4MMa'),
	('00000000-0000-0000-0001-000000000002', 'niki@zemloveka.cz',  '$2b$10$JTdQhAZ/i1Fog872NoT5leOwzKlj32olTf/xeamibbNlcuHHEicti'),
	('00000000-0000-0000-0001-000000000003', 'stefy@zemloveka.cz', '$2b$10$t20NwNaUR5hkVvRWIycNw.E0fx0aqDw6bSNuJC/k7jChmz9ShuJES'),
	('00000000-0000-0000-0001-000000000004', 'demo@zemloveka.cz',  '$2b$10$sMfnGmTLnotN1u4ZGbE1tOdqGYMtygVEhKWMp3RegBHS3p1LxAYUG')
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash;

INSERT INTO public.profiles (user_id, username, display_name, bio, preferred_language, current_level, total_xp, streak_days)
VALUES
	('00000000-0000-0000-0001-000000000001', 'pata',  'Pata',        'Hlavní vývojář žemLOVEky 👨‍💻',         'cs', 5, 2400, 12),
	('00000000-0000-0000-0001-000000000002', 'niki',  'Niki',        'UX designérka a milovnice sushi 🍣',    'cs', 4, 1800,  7),
	('00000000-0000-0000-0001-000000000003', 'stefy', 'Stefy',       'Kuchařka srdcem, cukrářka duší 🍰',     'cs', 3,  900,  3),
	('00000000-0000-0000-0001-000000000004', 'demo',  'Demo účet',   'Testovací uživatel pro prezentace 🚀',  'cs', 1,    0,  0)
ON CONFLICT (user_id) DO UPDATE
SET
	username     = EXCLUDED.username,
	display_name = EXCLUDED.display_name,
	bio          = EXCLUDED.bio,
	total_xp     = EXCLUDED.total_xp,
	streak_days  = EXCLUDED.streak_days,
	updated_at   = timezone('utc', now());

INSERT INTO public.user_preferences (user_id, cooking_frequency, time_budget, onboarding_completed_at)
VALUES
	('00000000-0000-0000-0001-000000000001', 'few_per_week', 'between_30_60',  timezone('utc', now())),
	('00000000-0000-0000-0001-000000000002', 'few_per_week', 'under_30',       timezone('utc', now())),
	('00000000-0000-0000-0001-000000000003', 'daily',        'between_60_120', timezone('utc', now())),
	('00000000-0000-0000-0001-000000000004', 'never',        'under_30',       NULL)
ON CONFLICT (user_id) DO NOTHING;

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

INSERT INTO public.map_groups (id, code, name_cs, name_en, emoji, color, hover_color, sort_order)
VALUES
	('00000000-0000-0000-0000-000000000A01', 'srdce_evropy',         'Srdce Evropy',          'Heart of Europe',        '🏰', '#E57373', '#EF5350', 1),
	('00000000-0000-0000-0000-000000000A02', 'italska_vasen',        'Italská vášeň',         'Italian Passion',        '🍕', '#66BB6A', '#43A047', 2),
	('00000000-0000-0000-0000-000000000A03', 'francouzska_elegance', 'Francouzská elegance',  'French Elegance',        '🥐', '#5C6BC0', '#3949AB', 3),
	('00000000-0000-0000-0000-000000000A04', 'ibersky_temperament',  'Iberský temperament',   'Iberian Temperament',    '💃', '#FFA726', '#FB8C00', 4),
	('00000000-0000-0000-0000-000000000A05', 'exploze_chuti',        'Exploze chutí',         'Explosion of Flavors',   '🌶️', '#AB47BC', '#8E24AA', 5)
ON CONFLICT (code) DO UPDATE
SET
	name_cs      = EXCLUDED.name_cs,
	name_en      = EXCLUDED.name_en,
	emoji        = EXCLUDED.emoji,
	color        = EXCLUDED.color,
	hover_color  = EXCLUDED.hover_color,
	sort_order   = EXCLUDED.sort_order,
	updated_at   = timezone('utc', now());

INSERT INTO public.country_map_group (country_id, map_group_id)
SELECT c.id, mg.id
FROM (VALUES
	('CZ', 'srdce_evropy'),
	('SK', 'srdce_evropy'),
	('PL', 'srdce_evropy'),
	('DE', 'srdce_evropy'),
	('AT', 'srdce_evropy'),
	('HU', 'srdce_evropy'),
	('IT', 'italska_vasen'),
	('FR', 'francouzska_elegance'),
	('BE', 'francouzska_elegance'),
	('ES', 'ibersky_temperament'),
	('PT', 'ibersky_temperament'),
	('MX', 'ibersky_temperament'),
	('GR', 'ibersky_temperament'),
	('TH', 'exploze_chuti'),
	('VN', 'exploze_chuti'),
	('ID', 'exploze_chuti'),
	('MY', 'exploze_chuti'),
	('JP', 'exploze_chuti'),
	('IN', 'exploze_chuti'),
	('KR', 'exploze_chuti')
) AS assoc(iso2, group_code)
JOIN public.countries c ON c.iso2 = assoc.iso2
JOIN public.map_groups mg ON mg.code = assoc.group_code
ON CONFLICT DO NOTHING;

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

-- ---------------------------------------------------------------------------
-- Recipe steps (per-recipe, idempotent via fixed UUIDs)
-- ---------------------------------------------------------------------------
INSERT INTO public.recipe_steps (id, recipe_id, step_number, default_timer_seconds)
VALUES
	-- Pizza Margherita (001)
	('30000000-0001-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',1,NULL),
	('30000000-0001-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',2,1200),
	('30000000-0001-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',3,480),
	('30000000-0001-0000-0000-000000000004','10000000-0000-0000-0000-000000000001',4,NULL),
	-- Cacio e Pepe (002)
	('30000000-0002-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',1,NULL),
	('30000000-0002-0000-0000-000000000002','10000000-0000-0000-0000-000000000002',2,600),
	('30000000-0002-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',3,120),
	('30000000-0002-0000-0000-000000000004','10000000-0000-0000-0000-000000000002',4,NULL),
	-- Boeuf Bourguignon (003)
	('30000000-0003-0000-0000-000000000001','10000000-0000-0000-0000-000000000003',1,NULL),
	('30000000-0003-0000-0000-000000000002','10000000-0000-0000-0000-000000000003',2,600),
	('30000000-0003-0000-0000-000000000003','10000000-0000-0000-0000-000000000003',3,10800),
	('30000000-0003-0000-0000-000000000004','10000000-0000-0000-0000-000000000003',4,NULL),
	-- Tacos al Pastor (004)
	('30000000-0004-0000-0000-000000000001','10000000-0000-0000-0000-000000000004',1,NULL),
	('30000000-0004-0000-0000-000000000002','10000000-0000-0000-0000-000000000004',2,NULL),
	('30000000-0004-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',3,900),
	('30000000-0004-0000-0000-000000000004','10000000-0000-0000-0000-000000000004',4,NULL),
	-- Tonkotsu Ramen (005)
	('30000000-0005-0000-0000-000000000001','10000000-0000-0000-0000-000000000005',1,NULL),
	('30000000-0005-0000-0000-000000000002','10000000-0000-0000-0000-000000000005',2,36000),
	('30000000-0005-0000-0000-000000000003','10000000-0000-0000-0000-000000000005',3,600),
	('30000000-0005-0000-0000-000000000004','10000000-0000-0000-0000-000000000005',4,NULL),
	-- Pad Thai (006)
	('30000000-0006-0000-0000-000000000001','10000000-0000-0000-0000-000000000006',1,NULL),
	('30000000-0006-0000-0000-000000000002','10000000-0000-0000-0000-000000000006',2,300),
	('30000000-0006-0000-0000-000000000003','10000000-0000-0000-0000-000000000006',3,300),
	('30000000-0006-0000-0000-000000000004','10000000-0000-0000-0000-000000000006',4,NULL),
	-- Pho Bo (007)
	('30000000-0007-0000-0000-000000000001','10000000-0000-0000-0000-000000000007',1,NULL),
	('30000000-0007-0000-0000-000000000002','10000000-0000-0000-0000-000000000007',2,10800),
	('30000000-0007-0000-0000-000000000003','10000000-0000-0000-0000-000000000007',3,300),
	('30000000-0007-0000-0000-000000000004','10000000-0000-0000-0000-000000000007',4,NULL),
	-- Chicken Tikka Masala (008)
	('30000000-0008-0000-0000-000000000001','10000000-0000-0000-0000-000000000008',1,NULL),
	('30000000-0008-0000-0000-000000000002','10000000-0000-0000-0000-000000000008',2,1800),
	('30000000-0008-0000-0000-000000000003','10000000-0000-0000-0000-000000000008',3,1200),
	('30000000-0008-0000-0000-000000000004','10000000-0000-0000-0000-000000000008',4,NULL),
	-- Dal Makhani (009)
	('30000000-0009-0000-0000-000000000001','10000000-0000-0000-0000-000000000009',1,NULL),
	('30000000-0009-0000-0000-000000000002','10000000-0000-0000-0000-000000000009',2,3600),
	('30000000-0009-0000-0000-000000000003','10000000-0000-0000-0000-000000000009',3,NULL),
	-- Paella Valenciana (010)
	('30000000-0010-0000-0000-000000000001','10000000-0000-0000-0000-000000000010',1,NULL),
	('30000000-0010-0000-0000-000000000002','10000000-0000-0000-0000-000000000010',2,900),
	('30000000-0010-0000-0000-000000000003','10000000-0000-0000-0000-000000000010',3,1200),
	('30000000-0010-0000-0000-000000000004','10000000-0000-0000-0000-000000000010',4,NULL),
	-- Pasteis de Nata (011)
	('30000000-0011-0000-0000-000000000001','10000000-0000-0000-0000-000000000011',1,NULL),
	('30000000-0011-0000-0000-000000000002','10000000-0000-0000-0000-000000000011',2,NULL),
	('30000000-0011-0000-0000-000000000003','10000000-0000-0000-0000-000000000011',3,1200),
	('30000000-0011-0000-0000-000000000004','10000000-0000-0000-0000-000000000011',4,NULL),
	-- Spanakopita (012)
	('30000000-0012-0000-0000-000000000001','10000000-0000-0000-0000-000000000012',1,NULL),
	('30000000-0012-0000-0000-000000000002','10000000-0000-0000-0000-000000000012',2,NULL),
	('30000000-0012-0000-0000-000000000003','10000000-0000-0000-0000-000000000012',3,2700),
	('30000000-0012-0000-0000-000000000004','10000000-0000-0000-0000-000000000012',4,NULL),
	-- Svíčková (013)
	('30000000-0013-0000-0000-000000000001','10000000-0000-0000-0000-000000000013',1,NULL),
	('30000000-0013-0000-0000-000000000002','10000000-0000-0000-0000-000000000013',2,5400),
	('30000000-0013-0000-0000-000000000003','10000000-0000-0000-0000-000000000013',3,1200),
	('30000000-0013-0000-0000-000000000004','10000000-0000-0000-0000-000000000013',4,NULL),
	-- Pierogi Ruskie (014)
	('30000000-0014-0000-0000-000000000001','10000000-0000-0000-0000-000000000014',1,NULL),
	('30000000-0014-0000-0000-000000000002','10000000-0000-0000-0000-000000000014',2,NULL),
	('30000000-0014-0000-0000-000000000003','10000000-0000-0000-0000-000000000014',3,600),
	('30000000-0014-0000-0000-000000000004','10000000-0000-0000-0000-000000000014',4,NULL),
	-- Wiener Schnitzel (015)
	('30000000-0015-0000-0000-000000000001','10000000-0000-0000-0000-000000000015',1,NULL),
	('30000000-0015-0000-0000-000000000002','10000000-0000-0000-0000-000000000015',2,NULL),
	('30000000-0015-0000-0000-000000000003','10000000-0000-0000-0000-000000000015',3,480),
	('30000000-0015-0000-0000-000000000004','10000000-0000-0000-0000-000000000015',4,NULL),
	-- Bratwurst mit Sauerkraut (016)
	('30000000-0016-0000-0000-000000000001','10000000-0000-0000-0000-000000000016',1,NULL),
	('30000000-0016-0000-0000-000000000002','10000000-0000-0000-0000-000000000016',2,1200),
	('30000000-0016-0000-0000-000000000003','10000000-0000-0000-0000-000000000016',3,600),
	-- Guláš (017)
	('30000000-0017-0000-0000-000000000001','10000000-0000-0000-0000-000000000017',1,NULL),
	('30000000-0017-0000-0000-000000000002','10000000-0000-0000-0000-000000000017',2,3600),
	('30000000-0017-0000-0000-000000000003','10000000-0000-0000-0000-000000000017',3,NULL),
	-- Moules Frites (018)
	('30000000-0018-0000-0000-000000000001','10000000-0000-0000-0000-000000000018',1,NULL),
	('30000000-0018-0000-0000-000000000002','10000000-0000-0000-0000-000000000018',2,NULL),
	('30000000-0018-0000-0000-000000000003','10000000-0000-0000-0000-000000000018',3,600),
	('30000000-0018-0000-0000-000000000004','10000000-0000-0000-0000-000000000018',4,NULL),
	-- Nasi Goreng (019)
	('30000000-0019-0000-0000-000000000001','10000000-0000-0000-0000-000000000019',1,NULL),
	('30000000-0019-0000-0000-000000000002','10000000-0000-0000-0000-000000000019',2,300),
	('30000000-0019-0000-0000-000000000003','10000000-0000-0000-0000-000000000019',3,420),
	('30000000-0019-0000-0000-000000000004','10000000-0000-0000-0000-000000000019',4,NULL),
	-- Bibimbap (020)
	('30000000-0020-0000-0000-000000000001','10000000-0000-0000-0000-000000000020',1,NULL),
	('30000000-0020-0000-0000-000000000002','10000000-0000-0000-0000-000000000020',2,NULL),
	('30000000-0020-0000-0000-000000000003','10000000-0000-0000-0000-000000000020',3,NULL),
	('30000000-0020-0000-0000-000000000004','10000000-0000-0000-0000-000000000020',4,NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Recipe step translations (CS)
-- ---------------------------------------------------------------------------
INSERT INTO public.recipe_step_translations (step_id, locale, instruction, tip)
VALUES
	-- Pizza Margherita
	('30000000-0001-0000-0000-000000000001','cs','Smíchej mouku, vodu, droždí a sůl. Hnětej těsto 10 minut do hladka, pak ho nech 1 hodinu kynout.','Těsto je správně vykynuté, když zdvojnásobí objem.'),
	('30000000-0001-0000-0000-000000000002','cs','Rozehřej troubu na maximum (250–280 °C), ideálně s kamenem na pizzu. Rajčata rozmačkej vidličkou a dochuť solí.','Čím hotter trouba, tím křupavější okraj.'),
	('30000000-0001-0000-0000-000000000003','cs','Vyválejj těsto na tenký plát, potřej rajčatovou omáčkou, přidej mozzarellu a pečkou 8 minut.','Mozzarellu přidej až po prvních 3 minutách, aby se nepřipálila.'),
	('30000000-0001-0000-0000-000000000004','cs','Po upečení přidej čerstvou bazalku a přelij olivovým olejem. Ihned podávej.',NULL),
	-- Cacio e Pepe
	('30000000-0002-0000-0000-000000000001','cs','Nastrouhej Pecorino Romano a Parmigiano Reggiano. Pepř opraž nasucho na pánvi 1 minutu.','Čerstvě namletý pepř je klíčový – vynechej mletý z lahve.'),
	('30000000-0002-0000-0000-000000000002','cs','Vař těstoviny ve slané vodě al dente. Vodu z těstovin si odlij – budeš ji potřebovat.','Pasta voda je tajná omáčka – škrob v ní pojí sýr.'),
	('30000000-0002-0000-0000-000000000003','cs','Smíchej sýry s trochou pasta vody do krémové pasty. Těstoviny přidej k pepři na pánvi, zalij sýrovou směsí a míchej.','Nepoužívej přímý oheň při míchání sýra – srazí se.'),
	('30000000-0002-0000-0000-000000000004','cs','Podávej okamžitě s extra strouhaným sýrem a drceným pepřem.',NULL),
	-- Boeuf Bourguignon
	('30000000-0003-0000-0000-000000000001','cs','Hovězí nakrájej na velké kusy a osuš papírovým ubrouskem. Opečk v kastrolu z každé strany dozlatova.','Maso musí být suché, jinak se dusí místo pečení.'),
	('30000000-0003-0000-0000-000000000002','cs','Přidej cibuli, mrkev a česnek, krátce orestuj. Přilij víno a vývar, přidej tymián a bobkový list.','Použi burgundské červené víno nebo jiné suché červené.'),
	('30000000-0003-0000-0000-000000000003','cs','Zakryj poklicí a pečk v troubě na 160 °C celé 3 hodiny, dokud není maso úplně měkké.','Pokrm je ještě lepší druhý den – chuť se prohloubí.'),
	('30000000-0003-0000-0000-000000000004','cs','Podávej s bramborami nebo bagetou. Ozdobena petrželkou.',NULL),
	-- Tacos al Pastor
	('30000000-0004-0000-0000-000000000001','cs','Marinuj vepřové plátky v chipotle, ananasovém džusu, česneku a oreganu alespoň 2 hodiny.','Čím déle marinuje, tím lepší chuť – ideálně přes noc.'),
	('30000000-0004-0000-0000-000000000002','cs','Připrav tortilly a nakrájej ananas na malé kousky. Smaž cibuli a korian.','Koriander přidej až nakonec, je citlivý na teplo.'),
	('30000000-0004-0000-0000-000000000003','cs','Opékej marinované maso na litinové pánvi na silném ohni 15 minut, dokud není lehce opečené.','Maso podávej nakrájené na tenké plátky.'),
	('30000000-0004-0000-0000-000000000004','cs','Naplň tortilly masem, ananasem, cibulí, koriandrem a salsa verde.',NULL),
	-- Tonkotsu Ramen
	('30000000-0005-0000-0000-000000000001','cs','Vepřové kosti povaR 3 minuty v vroucí vodě, pak slijeme a kosti propláchni – zbavíme se nečistot.','Toto blanšírování je klíčem k čistému, světlému vývaru.'),
	('30000000-0005-0000-0000-000000000002','cs','Vař kosti s cibulí, zázvorem a česnekem 10 hodin na mírném ohni do mléčně bílého vývaru.','Silný var způsobuje bílou barvu vývaru – je to žádoucí.'),
	('30000000-0005-0000-0000-000000000003','cs','Uvař ramen nudle, připrav toppingy: vajíčko marinádi v sójovce, narezýš chashu vepřové maso a namelj bambusové výhonky.','Vajíčko marinádi v sóji a mirinu alespoň 4 hodiny.'),
	('30000000-0005-0000-0000-000000000004','cs','Naservíruj horký vývar do misky s nudlemi a přidej toppingy.',NULL),
	-- Pad Thai
	('30000000-0006-0000-0000-000000000001','cs','Rýžové nudle namočit do studené vody na 30 minut. Připrav omáčku: tamarind, fish sauce, cukr.','Nudle nesmí být úplně měkké – dodaří se na pánvi.'),
	('30000000-0006-0000-0000-000000000002','cs','Na rozpáleném woku opeč krevetty nebo tofu. Přidej mačkané vejce a mícháváme.','Wok musí být velmi horký – to je základ smažené rýže.'),
	('30000000-0006-0000-0000-000000000003','cs','Přidej odkapané nudle, zalij omáčkou a míchej 5 minut. Na konci přidej klíčky a pažitku.','Nezalévej vodou – nudle by se rozmočily.'),
	('30000000-0006-0000-0000-000000000004','cs','Podávej s limetkou, nakrájenými arašídy a sušenou chiili.',NULL),
	-- Pho Bo
	('30000000-0007-0000-0000-000000000001','cs','Opečk kosti a cibuli v troubě na 220 °C do zlatova. Hvězdicový anýz a skořici opraž nasucho.','Opékání dodá vývaru tmavší barvu a karamelové tóny.'),
	('30000000-0007-0000-0000-000000000002','cs','Vař kosti s kořením a zázvorem 3 hodiny na mírném ohni. Vývar precedit a dochutiit fish sauce a solí.','Vývar musí být průhledný – pravidelně sbíráme pěnu.'),
	('30000000-0007-0000-0000-000000000003','cs','Uvař pho nudle. Hovězí svíčkovou nakrájej na tenké plátky – horký vývar je doudělá.','Maso musí být nakrájeno přes vlákno velmi tenko.'),
	('30000000-0007-0000-0000-000000000004','cs','Nalej horký vývar na nudle s masem. Podávej s limetkou, fazolemi mungo, bazalkou a chiili.',NULL),
	-- Chicken Tikka Masala
	('30000000-0008-0000-0000-000000000001','cs','Marinuj kuřecí kousky v jogurtu, garam masala, kurkumě a česneku 30 minut.','Jogurt zjemňuje maso a pomáhá koření proniknout dovnitř.'),
	('30000000-0008-0000-0000-000000000002','cs','Opečk marinované kuřecí kousky na grilu nebo pod grilem do lehkého opálení.','Chceme pěkné spálenisky – to je typický tikka efekt.'),
	('30000000-0008-0000-0000-000000000003','cs','Připrav masala omáčku: orestuj cibuli s česnekm, přidej rajčata, kari koření a smetanu. Vař 20 minut.','Omáčka může být připravena den předem – chuť se prohloubí.'),
	('30000000-0008-0000-0000-000000000004','cs','Přidej opečené kuřecí kousky do omáčky a prohřej 5 minut. Podávej s naan chlebem.',NULL),
	-- Dal Makhani
	('30000000-0009-0000-0000-000000000001','cs','Černou čočku namočit přes noc. Uvař doměkka – asi 45 minut.','Namočená čočka se vaří podstatně rychleji.'),
	('30000000-0009-0000-0000-000000000002','cs','Orestuj cibuli, česnek a zázvor. Přidej rajčatové pyré a koření (kmin, koriandr, garam masala). Přidej uvařenou čočku a máslo. Vař 1 hodinu na mírném ohni.','Čím déle se vaří, tím krémovější výsledek.'),
	('30000000-0009-0000-0000-000000000003','cs','Na závěr přidej smetanu a kasoori methi (sušené listy pískavice). Podávej s roti nebo naan.',NULL),
	-- Paella Valenciana
	('30000000-0010-0000-0000-000000000001','cs','Připrav kuřecí vývar. Šafrán namočit ve teplé vodě 10 minut.','Čerstvý šafrán je nezaměnitelný – nevynechávej ho.'),
	('30000000-0010-0000-0000-000000000002','cs','Orestuj kuřecí a králičí kousky v olivovém oleji. Přidej paprikové lusky a rajčata.','Karamelizovaná rajčata dodají socarrat – připálenou vrstvu na dně.'),
	('30000000-0010-0000-0000-000000000003','cs','Přidej rýži, zalij vývarem a šafránovou vodou. Vař 20 minut bez míchání na středním ohni.','Paella se nemíchá – rýže musí absorbovat vývar rovnoměrně.'),
	('30000000-0010-0000-0000-000000000004','cs','Nech odpočinout 5 minut zakrytou fólií. Podávej přímo z pánve.',NULL),
	-- Pasteis de Nata
	('30000000-0011-0000-0000-000000000001','cs','Připrav listové těsto: mouku, máslo a sůl hnětej do hladka, pak skládej a vychlaď 30 minut.','Kupované listové těsto funguje výborně – ušetří hodně času.'),
	('30000000-0011-0000-0000-000000000002','cs','Uvař krém: mléko, cukr, žloutky, mouku a vanilku. Míchej na mírném ohni do zhoustnutí.','Nesmí vykypět – stále míchej a sleduj teplotu.'),
	('30000000-0011-0000-0000-000000000003','cs','Vystřihni kolečka těsta, vlož do formiček. Naplň vanilkovým krémem. Pečk 230 °C 12 minut.','Vrchol kostiček bude tmavý – to je správně, ne připaleni.'),
	('30000000-0011-0000-0000-000000000004','cs','Posyp skořicí a moučkovým cukrem. Podávej teplé.',NULL),
	-- Spanakopita
	('30000000-0012-0000-0000-000000000001','cs','Špenát osmahni a nech vychladnout. Vymacha přebytečnou vlhkost – klíčové!','Vlhký špenát zničí křupavost filo těsta.'),
	('30000000-0012-0000-0000-000000000002','cs','Smíchej špenát s fetou, vejci, cibulí a koprem. Dochuť solí a pepřem.','Feta je dost slaná – přisoluj opatrně.'),
	('30000000-0012-0000-0000-000000000003','cs','Vrstvui filo plátky do formy, každý potři máslem. Naplň nádivkou, přeložit a dopečk 45 minut na 180 °C.','Filo musí být úplně zakryté máslem, jinak vysychá.'),
	('30000000-0012-0000-0000-000000000004','cs','Nech trochu vychladnout před krájením – drží lépe tvar.',NULL),
	-- Svíčková
	('30000000-0013-0000-0000-000000000001','cs','Mrkev, petržel, celer a cibuli nakrájej a orestuj dozlatova. Přidej celé koření (pepř, nové koření, bobkový list).','Zelenina musí být dobře opečená – základ omáčky.'),
	('30000000-0013-0000-0000-000000000002','cs','Hovězí svíčkovou obal v zelenině, zalij vývarem a pečk v troubě na 160 °C 90 minut.','Podlévej průběžně, aby maso nevyschlo.'),
	('30000000-0013-0000-0000-000000000003','cs','Výpek prolisuj, přidej smetanu a citronovou šťávu. Vař 20 minut do krémové konzistence.','Omáčka by měla být jemně nakyslá – přidej víc citronu podle chutě.'),
	('30000000-0013-0000-0000-000000000004','cs','Podávej s houskovým knedlíkem, plátkem svíčkové, brusinkami a šlehačkou.',NULL),
	-- Pierogi Ruskie
	('30000000-0014-0000-0000-000000000001','cs','Uvař brambory, rozmačkej a smíchej s tvarohem a smaženou cibulí. Dochuť solí a pepřem.','Nádivka musí být vychladnutá před plněním.'),
	('30000000-0014-0000-0000-000000000002','cs','Z mouky, vejce a vody udělej pružné těsto. Nech odpočinout 20 minut.','Odpočaté těsto se lépe válí a netrhá.'),
	('30000000-0014-0000-0000-000000000003','cs','Vyválejj těsto, vykrájej kolečka, naplň a překládej. Vař v osolené vodě 5 minut po vynoření.','Pierog se uvaří, jakmile vyplave na povrch.'),
	('30000000-0014-0000-0000-000000000004','cs','Opečk na másle dozlatova. Podávej s opraženou cibulkou a zakysanou smetanou.',NULL),
	-- Wiener Schnitzel
	('30000000-0015-0000-0000-000000000001','cs','Telecí plátky naklepej na tenkou vrstvu (cca 4 mm). Osolte a opepřte.','Naklepání je klíčové pro charakteristickou tenkou vrstu.'),
	('30000000-0015-0000-0000-000000000002','cs','Obaluj plátky postupně: mouka, rozšlehaná vejce, strouhanka.','Každá vrsta musí být rovnoměrná.'),
	('30000000-0015-0000-0000-000000000003','cs','Smaž na hojném přepuštěném másle z obou stran do zlatova, cca 4 minuty.','Tuk musí být dost hluboký, aby se řízek "vlnil" a byl křupavý.'),
	('30000000-0015-0000-0000-000000000004','cs','Podávej okamžitě s plátkem citronu a bramborovým salátem.',NULL),
	-- Bratwurst mit Sauerkraut
	('30000000-0016-0000-0000-000000000001','cs','Kysané zelí pomalu podus s cibulí, bobkovým listem, novým kořením a troškou piva 20 minut.','Čím déle se dusí, tím je zelí jemnější.'),
	('30000000-0016-0000-0000-000000000002','cs','Bratwurst opéckej na grilu nebo pánvi ze všech stran do zlatohnědé barvy.','Propíchnuté klobásy ztrácí šťávu – nerychni.'),
	('30000000-0016-0000-0000-000000000003','cs','Podávej bratwurst na hromádce zelí s hořčicí a pečivem.',NULL),
	-- Guláš
	('30000000-0017-0000-0000-000000000001','cs','Cibuli nakrájej na proužky a opéckej dozlatova na sádle. Přidej mletou paprikám (sladkou i pálivou).','Paprika se přidává vždy mimo oheň – přímý žár ji zhořkne.'),
	('30000000-0017-0000-0000-000000000002','cs','Přidej nakrájené hovězí (kulatá nebo loupaná), kmín, majoránku, česnek a rajčatové pyré. Podlijbv vývarem a dus 60 minut.','Maso nesmí plavat ve vývaru – guláš se dusí, neva.'),
	('30000000-0017-0000-0000-000000000003','cs','Guláš zahustí sám – na konci by měl být hustá omáčka. Podávej s houskovými knedlíky.',NULL),
	-- Moules Frites
	('30000000-0018-0000-0000-000000000001','cs','Slávky důkladně vymydli, vyhoď otevřené. Nakrájej šalotku a česnek.','Slávky se nesmí otvírat před vařením – jsou špatné.'),
	('30000000-0018-0000-0000-000000000002','cs','Na másle orestuj šalotku a česnek. Přilij bílé víno a přidej slávky. Zakryj a var 5 minut.','Slávky jsou hotové, jakmile se otevřou.'),
	('30000000-0018-0000-0000-000000000003','cs','Zatímco se vaří slávky, usmažit hranolky na 180 °C dozlatova.','Dvojité smažení (blanšírování + smažení) dává nejlepší výsledek.'),
	('30000000-0018-0000-0000-000000000004','cs','Podávej slávky v hluboké misce s vývarrem, hranolky vedle. Přidej petrželku.',NULL),
	-- Nasi Goreng
	('30000000-0019-0000-0000-000000000001','cs','Rýži uvař den předem a nech vychladnout – studená rýže se lépe smaží.','Čerstvá rýže je mokrá a hrudkuje.'),
	('30000000-0019-0000-0000-000000000002','cs','Na horkém woku opeč krévety. Přidej kecap manis, sambal oelek a sójovou omáčku.','Kecap manis je sladká indonéská sójová omáčka – klíčová ingredience.'),
	('30000000-0019-0000-0000-000000000003','cs','Přidej rýži a míchej na vysokém plameni 7 minut. Na závěr vmíchej vejce.','Míchej stále – rýže se nesmí přilepit.'),
	('30000000-0019-0000-0000-000000000004','cs','Podávej s smaženým vejcem nahoře, okurkovými plátky a kerupukem.',NULL),
	-- Bibimbap
	('30000000-0020-0000-0000-000000000001','cs','Uvař korejskou rýži. Připrav omáčku gochujang: gochujang pasta, sezamový olej, cukr, česnek, ocet.','Gochujang je korejská červená chilli pasta – základ bibimbap.'),
	('30000000-0020-0000-0000-000000000002','cs','Blanšíruj špenát, mrkev a klíčky fazolu mungo zvlášť. Ochutit sezamovym olejem a solí.','Každá zelenina se připravuje zvlášť – zachová vlastní chuť.'),
	('30000000-0020-0000-0000-000000000003','cs','Na sezamovem oleji opeč hovězí s sójovou omáčkou a česnekem. Smažte vajíčko vejce naměkko.','Vejce by mělo mít tekutý žloutek – probodne se při míchání.'),
	('30000000-0020-0000-0000-000000000004','cs','Do horké kamenné misky (dolsot) naskládaj rýži, zeleninu, maso a vejce. Přidej gochujang omáčku a mícháje.',NULL)
ON CONFLICT (step_id, locale) DO UPDATE
SET
	instruction = EXCLUDED.instruction,
	tip         = EXCLUDED.tip,
	updated_at  = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Recipe step translations (EN)
-- ---------------------------------------------------------------------------
INSERT INTO public.recipe_step_translations (step_id, locale, instruction, tip)
VALUES
	-- Pizza Margherita
	('30000000-0001-0000-0000-000000000001','en','Mix flour, water, yeast and salt. Knead 10 minutes until smooth, then let rise 1 hour.','Dough is ready when it doubles in size.'),
	('30000000-0001-0000-0000-000000000002','en','Heat oven to max (250–280 °C), ideally with a pizza stone. Crush tomatoes with a fork and season with salt.','A hotter oven means a crispier crust.'),
	('30000000-0001-0000-0000-000000000003','en','Roll dough thin, spread tomato sauce, add mozzarella and bake 8 minutes.','Add mozzarella only after the first 3 minutes to prevent burning.'),
	('30000000-0001-0000-0000-000000000004','en','After baking add fresh basil and drizzle with olive oil. Serve immediately.',NULL),
	-- Cacio e Pepe
	('30000000-0002-0000-0000-000000000001','en','Finely grate Pecorino Romano and Parmigiano Reggiano. Toast peppercorns dry in the pan for 1 minute.','Freshly cracked pepper is essential – skip the pre-ground.'),
	('30000000-0002-0000-0000-000000000002','en','Cook pasta in salted water to al dente. Reserve pasta water – you will need it.','Pasta water is the secret sauce – its starch binds the cheese.'),
	('30000000-0002-0000-0000-000000000003','en','Mix cheeses with a little pasta water into a creamy paste. Add pasta to the peppered pan and fold in the cheese cream.','Keep off direct heat when adding cheese – it will clump.'),
	('30000000-0002-0000-0000-000000000004','en','Serve immediately with extra grated cheese and cracked pepper.',NULL),
	-- Boeuf Bourguignon
	('30000000-0003-0000-0000-000000000001','en','Cut beef into large chunks and pat completely dry. Sear in a casserole on all sides until golden brown.','Meat must be dry or it steams instead of browning.'),
	('30000000-0003-0000-0000-000000000002','en','Add onion, carrot and garlic, briefly sauté. Pour in wine and stock, add thyme and bay leaf.','Use Burgundy or another dry red wine.'),
	('30000000-0003-0000-0000-000000000003','en','Cover and braise in the oven at 160 °C for 3 hours until completely tender.','It is even better the next day as flavours deepen.'),
	('30000000-0003-0000-0000-000000000004','en','Serve with potatoes or baguette, garnished with parsley.',NULL),
	-- Tacos al Pastor
	('30000000-0004-0000-0000-000000000001','en','Marinate pork slices in chipotle, pineapple juice, garlic and oregano for at least 2 hours.','Overnight marinating gives the best flavour.'),
	('30000000-0004-0000-0000-000000000002','en','Warm tortillas and dice pineapple. Fry onion and prep cilantro.','Add cilantro at the end – heat kills its flavour.'),
	('30000000-0004-0000-0000-000000000003','en','Sear marinated pork in a cast-iron pan over high heat for 15 minutes until lightly charred.','Slice meat thin when serving.'),
	('30000000-0004-0000-0000-000000000004','en','Fill tortillas with pork, pineapple, onion, cilantro and salsa verde.',NULL),
	-- Tonkotsu Ramen
	('30000000-0005-0000-0000-000000000001','en','Blanch pork bones 3 minutes, drain and rinse well to remove impurities.','Blanching is the key to a clean, milky broth.'),
	('30000000-0005-0000-0000-000000000002','en','Simmer bones with onion, ginger and garlic for 10 hours until the broth is creamy white.','A vigorous boil creates the white colour – it is desirable.'),
	('30000000-0005-0000-0000-000000000003','en','Cook ramen noodles. Prepare toppings: marinate eggs in soy sauce, slice chashu pork, prep bamboo shoots.','Marinate eggs in soy and mirin for at least 4 hours.'),
	('30000000-0005-0000-0000-000000000004','en','Ladle hot broth into bowls over noodles and add toppings.',NULL),
	-- Pad Thai
	('30000000-0006-0000-0000-000000000001','en','Soak rice noodles in cold water for 30 minutes. Mix the sauce: tamarind, fish sauce, sugar.','Noodles should not be fully soft – they finish in the wok.'),
	('30000000-0006-0000-0000-000000000002','en','Stir-fry shrimp or tofu in a very hot wok. Push to the side and scramble eggs.','The wok must be extremely hot – that is the foundation.'),
	('30000000-0006-0000-0000-000000000003','en','Add drained noodles and sauce, toss for 5 minutes. Fold in bean sprouts and green onion.','Do not add water – noodles will become mushy.'),
	('30000000-0006-0000-0000-000000000004','en','Serve with lime, crushed peanuts and dried chilli.',NULL),
	-- Pho Bo
	('30000000-0007-0000-0000-000000000001','en','Char bones and onion in the oven at 220 °C until golden. Toast star anise and cinnamon dry.','Charring gives the broth depth and caramel notes.'),
	('30000000-0007-0000-0000-000000000002','en','Simmer bones with spices and ginger for 3 hours. Strain and season with fish sauce and salt.','Keep skim foam for a clear broth.'),
	('30000000-0007-0000-0000-000000000003','en','Cook pho noodles. Slice beef sirloin paper-thin – the hot broth will finish cooking it.','Slice against the grain, very thin.'),
	('30000000-0007-0000-0000-000000000004','en','Pour hot broth over noodles and beef. Serve with lime, mung bean sprouts, basil and chilli.',NULL),
	-- Chicken Tikka Masala
	('30000000-0008-0000-0000-000000000001','en','Marinate chicken pieces in yoghurt, garam masala, turmeric and garlic for 30 minutes.','Yoghurt tenderises the meat and carries the spices inside.'),
	('30000000-0008-0000-0000-000000000002','en','Grill or broil marinated chicken until lightly charred on the outside.','We want char marks – that is the tikka effect.'),
	('30000000-0008-0000-0000-000000000003','en','Make the masala sauce: sauté onion and garlic, add tomatoes, curry spices and cream. Simmer 20 minutes.','The sauce can be made a day ahead – flavour deepens.'),
	('30000000-0008-0000-0000-000000000004','en','Add grilled chicken to the sauce and heat through for 5 minutes. Serve with naan.',NULL),
	-- Dal Makhani
	('30000000-0009-0000-0000-000000000001','en','Soak black lentils overnight. Cook until completely tender – about 45 minutes.','Soaked lentils cook significantly faster.'),
	('30000000-0009-0000-0000-000000000002','en','Sauté onion, garlic and ginger. Add tomato purée, cumin, coriander and garam masala. Add cooked lentils and butter. Simmer 1 hour.','The longer it simmers, the creamier the result.'),
	('30000000-0009-0000-0000-000000000003','en','Finish with cream and kasoori methi (dried fenugreek leaves). Serve with roti or naan.',NULL),
	-- Paella Valenciana
	('30000000-0010-0000-0000-000000000001','en','Prepare chicken stock. Steep saffron in warm water for 10 minutes.','Fresh saffron is irreplaceable – do not skip it.'),
	('30000000-0010-0000-0000-000000000002','en','Brown chicken and rabbit pieces in olive oil. Add pepper strips and tomatoes.','Caramelised tomatoes create the socarrat – the coveted crust.'),
	('30000000-0010-0000-0000-000000000003','en','Add rice, pour in stock and saffron water. Cook 20 minutes without stirring over medium heat.','Paella is never stirred – rice must absorb stock evenly.'),
	('30000000-0010-0000-0000-000000000004','en','Rest 5 minutes covered with foil. Serve straight from the pan.',NULL),
	-- Pasteis de Nata
	('30000000-0011-0000-0000-000000000001','en','Make rough puff pastry: flour, butter and salt kneaded then folded and chilled 30 minutes.','Store-bought puff pastry works great and saves a lot of time.'),
	('30000000-0011-0000-0000-000000000002','en','Cook the custard: milk, sugar, egg yolks, flour and vanilla. Stir over low heat until thick.','Do not let it boil – keep stirring and watch the heat.'),
	('30000000-0011-0000-0000-000000000003','en','Cut dough circles, press into tart tins. Fill with custard. Bake at 230 °C for 12 minutes.','The tops will be quite dark – that is correct, not burnt.'),
	('30000000-0011-0000-0000-000000000004','en','Dust with cinnamon and icing sugar. Serve warm.',NULL),
	-- Spanakopita
	('30000000-0012-0000-0000-000000000001','en','Sauté spinach and let cool. Squeeze out all moisture – this is critical.','Wet spinach destroys the crispness of filo pastry.'),
	('30000000-0012-0000-0000-000000000002','en','Mix spinach with feta, eggs, onion and dill. Season with salt and pepper.','Feta is very salty – season cautiously.'),
	('30000000-0012-0000-0000-000000000003','en','Layer filo sheets in the tin, brushing each with butter. Add filling, fold over and bake 45 minutes at 180 °C.','Filo must be fully covered in butter or it dries out.'),
	('30000000-0012-0000-0000-000000000004','en','Cool slightly before slicing – holds its shape better.',NULL),
	-- Svíčková
	('30000000-0013-0000-0000-000000000001','en','Dice carrot, parsley root, celeriac and onion, sauté until golden. Add whole spices (pepper, allspice, bay leaf).','Well-browned vegetables are the base of the sauce.'),
	('30000000-0013-0000-0000-000000000002','en','Wrap sirloin in the vegetable mix, pour over stock and roast at 160 °C for 90 minutes.','Baste regularly to prevent the meat from drying out.'),
	('30000000-0013-0000-0000-000000000003','en','Blend the roasting juices, add cream and lemon juice. Simmer 20 minutes to a smooth creamy consistency.','The sauce should be subtly tangy – add more lemon to taste.'),
	('30000000-0013-0000-0000-000000000004','en','Serve with bread dumplings, sliced sirloin, cranberry sauce and whipped cream.',NULL),
	-- Pierogi Ruskie
	('30000000-0014-0000-0000-000000000001','en','Cook potatoes, mash and mix with curd cheese and fried onion. Season with salt and pepper.','The filling must be cold before stuffing.'),
	('30000000-0014-0000-0000-000000000002','en','Make a dough from flour, egg and water. Rest 20 minutes.','Rested dough rolls easier and does not tear.'),
	('30000000-0014-0000-0000-000000000003','en','Roll out dough, cut circles, fill and fold. Cook in salted water for 5 minutes after they float.','Pierog is done when it floats to the surface.'),
	('30000000-0014-0000-0000-000000000004','en','Pan-fry in butter until golden. Serve with crispy onion and sour cream.',NULL),
	-- Wiener Schnitzel
	('30000000-0015-0000-0000-000000000001','en','Pound veal escalopes to about 4 mm thickness. Season with salt and pepper.','Pounding is key to the characteristic thin cutlet.'),
	('30000000-0015-0000-0000-000000000002','en','Bread the escalopes: flour, beaten egg, breadcrumbs.','Each coating must be even.'),
	('30000000-0015-0000-0000-000000000003','en','Fry in generous clarified butter on both sides until golden, about 4 minutes.','Fat must be deep enough so the schnitzel "waves" and stays crispy.'),
	('30000000-0015-0000-0000-000000000004','en','Serve immediately with a lemon wedge and potato salad.',NULL),
	-- Bratwurst mit Sauerkraut
	('30000000-0016-0000-0000-000000000001','en','Slowly braise sauerkraut with onion, bay leaf, allspice and a splash of beer for 20 minutes.','Longer braising makes the sauerkraut more tender.'),
	('30000000-0016-0000-0000-000000000002','en','Grill or pan-fry bratwurst on all sides until golden brown.','Do not pierce the sausages – you will lose the juices.'),
	('30000000-0016-0000-0000-000000000003','en','Serve bratwurst on a bed of sauerkraut with mustard and a bread roll.',NULL),
	-- Guláš
	('30000000-0017-0000-0000-000000000001','en','Slice onion into strips and fry in lard until golden. Add sweet and hot paprika off the heat.','Paprika is always added off direct heat – direct heat makes it bitter.'),
	('30000000-0017-0000-0000-000000000002','en','Add diced beef, caraway, marjoram, garlic and tomato purée. Cover with stock and braise 60 minutes.','Meat should not float in liquid – goulash braises, not boils.'),
	('30000000-0017-0000-0000-000000000003','en','Goulash thickens on its own – finish should be a rich thick sauce. Serve with bread dumplings.',NULL),
	-- Moules Frites
	('30000000-0018-0000-0000-000000000001','en','Scrub mussels, discard any open ones. Finely chop shallot and garlic.','Open mussels before cooking are spoiled.'),
	('30000000-0018-0000-0000-000000000002','en','Sauté shallot and garlic in butter. Pour in white wine and add mussels. Cover and steam 5 minutes.','Mussels are done the moment they open.'),
	('30000000-0018-0000-0000-000000000003','en','While mussels cook, fry chips at 180 °C until golden.','Double frying (blanch then fry) gives the best result.'),
	('30000000-0018-0000-0000-000000000004','en','Serve mussels in a deep bowl with the broth, chips alongside. Garnish with parsley.',NULL),
	-- Nasi Goreng
	('30000000-0019-0000-0000-000000000001','en','Cook rice the day before and refrigerate – cold rice fries better.','Fresh rice is too moist and clumps together.'),
	('30000000-0019-0000-0000-000000000002','en','Stir-fry shrimp in a hot wok. Add kecap manis, sambal oelek and soy sauce.','Kecap manis is sweet Indonesian soy sauce – the key ingredient.'),
	('30000000-0019-0000-0000-000000000003','en','Add rice and toss over high heat for 7 minutes. Fold in egg at the end.','Keep tossing – rice must not stick.'),
	('30000000-0019-0000-0000-000000000004','en','Serve topped with a fried egg, cucumber slices and prawn crackers.',NULL),
	-- Bibimbap
	('30000000-0020-0000-0000-000000000001','en','Cook Korean short-grain rice. Make gochujang sauce: gochujang paste, sesame oil, sugar, garlic, vinegar.','Gochujang is Korean red chilli paste – the cornerstone of bibimbap.'),
	('30000000-0020-0000-0000-000000000002','en','Blanch spinach, carrot and mung bean sprouts separately. Season each with sesame oil and salt.','Preparing each vegetable separately preserves individual flavours.'),
	('30000000-0020-0000-0000-000000000003','en','Sauté beef with soy sauce and garlic in sesame oil. Fry an egg sunny-side up.','Egg yolk should be runny – it breaks when mixed in.'),
	('30000000-0020-0000-0000-000000000004','en','Arrange rice, vegetables, beef and egg in a hot stone bowl (dolsot). Add gochujang sauce and mix at the table.',NULL)
ON CONFLICT (step_id, locale) DO UPDATE
SET
	instruction = EXCLUDED.instruction,
	tip         = EXCLUDED.tip,
	updated_at  = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Recipe ingredients (per-recipe)
-- ---------------------------------------------------------------------------
INSERT INTO public.recipe_ingredients (id, recipe_id, custom_name, amount, unit, prep_note, is_optional, sort_order)
VALUES
	-- Pizza Margherita (001)
	('40000000-0001-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00 mouka',500,'g','prosátá',false,1),
	('40000000-0001-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','voda',325,'ml','vlažná',false,2),
	('40000000-0001-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','čerstvé droždí',7,'g',NULL,false,3),
	('40000000-0001-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','sůl',10,'g',NULL,false,4),
	('40000000-0001-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','passata (mletá rajčata)',200,'ml',NULL,false,5),
	('40000000-0001-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','mozzarella fior di latte',200,'g','natrhnutá',false,6),
	('40000000-0001-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','čerstvá bazalka',5,'g',NULL,true,7),
	('40000000-0001-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','extra panenský olivový olej',20,'ml',NULL,true,8),
	-- Cacio e Pepe (002)
	('40000000-0002-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','spaghetti',200,'g',NULL,false,1),
	('40000000-0002-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Pecorino Romano',80,'g','jemně nastrouhaný',false,2),
	('40000000-0002-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Parmigiano Reggiano',30,'g','jemně nastrouhaný',false,3),
	('40000000-0002-0000-0000-000000000004','10000000-0000-0000-0000-000000000002','čerstvě mletý černý pepř',5,'g',NULL,false,4),
	('40000000-0002-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','sůl',10,'g','na vaření těstovin',false,5),
	-- Boeuf Bourguignon (003)
	('40000000-0003-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','hovězí krk nebo kližka',800,'g','nakrájené na kousky 4 cm',false,1),
	('40000000-0003-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','červené burgundské víno',500,'ml',NULL,false,2),
	('40000000-0003-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','hovězí vývar',300,'ml',NULL,false,3),
	('40000000-0003-0000-0000-000000000004','10000000-0000-0000-0000-000000000003','mrkev',2,'ks','nakrájená',false,4),
	('40000000-0003-0000-0000-000000000005','10000000-0000-0000-0000-000000000003','cibule',2,'ks','nakrájená',false,5),
	('40000000-0003-0000-0000-000000000006','10000000-0000-0000-0000-000000000003','česnek',3,'stroužky',NULL,false,6),
	('40000000-0003-0000-0000-000000000007','10000000-0000-0000-0000-000000000003','tymián',3,'větvičky',NULL,false,7),
	('40000000-0003-0000-0000-000000000008','10000000-0000-0000-0000-000000000003','bobkový list',2,'ks',NULL,false,8),
	-- Tacos al Pastor (004)
	('40000000-0004-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','vepřová krkovice',600,'g','nakrájená na plátky',false,1),
	('40000000-0004-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','chipotle chilli',2,'ks','z konzervy',false,2),
	('40000000-0004-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','ananas',200,'g','rozdělěný – džus + kousky',false,3),
	('40000000-0004-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','česnek',4,'stroužky',NULL,false,4),
	('40000000-0004-0000-0000-000000000005','10000000-0000-0000-0000-000000000004','oregano',5,'g',NULL,false,5),
	('40000000-0004-0000-0000-000000000006','10000000-0000-0000-0000-000000000004','kukuřičné tortilly',8,'ks',NULL,false,6),
	('40000000-0004-0000-0000-000000000007','10000000-0000-0000-0000-000000000004','čerstvý koriandr',10,'g',NULL,true,7),
	('40000000-0004-0000-0000-000000000008','10000000-0000-0000-0000-000000000004','salsa verde',100,'ml',NULL,true,8),
	-- Tonkotsu Ramen (005)
	('40000000-0005-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','vepřové kosti',1000,'g','blanšírované',false,1),
	('40000000-0005-0000-0000-000000000002','10000000-0000-0000-0000-000000000005','čerstvé ramen nudle',300,'g',NULL,false,2),
	('40000000-0005-0000-0000-000000000003','10000000-0000-0000-0000-000000000005','vepřový bůček (chashu)',300,'g','vařený a nakrájený',false,3),
	('40000000-0005-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','vejce',2,'ks','marinovaná v sóji',false,4),
	('40000000-0005-0000-0000-000000000005','10000000-0000-0000-0000-000000000005','zázvor',20,'g','plátky',false,5),
	('40000000-0005-0000-0000-000000000006','10000000-0000-0000-0000-000000000005','česnek',4,'stroužky',NULL,false,6),
	('40000000-0005-0000-0000-000000000007','10000000-0000-0000-0000-000000000005','sójová omáčka',30,'ml',NULL,false,7),
	-- Pad Thai (006)
	('40000000-0006-0000-0000-000000000001','10000000-0000-0000-0000-000000000006','ploché rýžové nudle',200,'g',NULL,false,1),
	('40000000-0006-0000-0000-000000000002','10000000-0000-0000-0000-000000000006','krevety',200,'g','oloupaný',false,2),
	('40000000-0006-0000-0000-000000000003','10000000-0000-0000-0000-000000000006','tamarindová pasta',30,'ml',NULL,false,3),
	('40000000-0006-0000-0000-000000000004','10000000-0000-0000-0000-000000000006','fish sauce',20,'ml',NULL,false,4),
	('40000000-0006-0000-0000-000000000005','10000000-0000-0000-0000-000000000006','cukr',15,'g',NULL,false,5),
	('40000000-0006-0000-0000-000000000006','10000000-0000-0000-0000-000000000006','vejce',2,'ks',NULL,false,6),
	('40000000-0006-0000-0000-000000000007','10000000-0000-0000-0000-000000000006','klíčky fazolu mungo',80,'g',NULL,false,7),
	('40000000-0006-0000-0000-000000000008','10000000-0000-0000-0000-000000000006','arašídy',40,'g','drcené',true,8),
	-- Pho Bo (007)
	('40000000-0007-0000-0000-000000000001','10000000-0000-0000-0000-000000000007','hovězí kosti',800,'g',NULL,false,1),
	('40000000-0007-0000-0000-000000000002','10000000-0000-0000-0000-000000000007','hovězí svíčková',300,'g','zmražená pro tenké krájení',false,2),
	('40000000-0007-0000-0000-000000000003','10000000-0000-0000-0000-000000000007','pho nudle',200,'g',NULL,false,3),
	('40000000-0007-0000-0000-000000000004','10000000-0000-0000-0000-000000000007','hvězdicový anýz',3,'ks',NULL,false,4),
	('40000000-0007-0000-0000-000000000005','10000000-0000-0000-0000-000000000007','skořice',1,'tyčinka',NULL,false,5),
	('40000000-0007-0000-0000-000000000006','10000000-0000-0000-0000-000000000007','zázvor',30,'g','opečený',false,6),
	('40000000-0007-0000-0000-000000000007','10000000-0000-0000-0000-000000000007','fish sauce',30,'ml',NULL,false,7),
	('40000000-0007-0000-0000-000000000008','10000000-0000-0000-0000-000000000007','čerstvá bazalka, limeta, chilli',1,'sada','k servírování',true,8),
	-- Chicken Tikka Masala (008)
	('40000000-0008-0000-0000-000000000001','10000000-0000-0000-0000-000000000008','kuřecí prsa',600,'g','nakrájená na kousky',false,1),
	('40000000-0008-0000-0000-000000000002','10000000-0000-0000-0000-000000000008','plnotučný jogurt',150,'ml',NULL,false,2),
	('40000000-0008-0000-0000-000000000003','10000000-0000-0000-0000-000000000008','garam masala',10,'g',NULL,false,3),
	('40000000-0008-0000-0000-000000000004','10000000-0000-0000-0000-000000000008','kurkuma',5,'g',NULL,false,4),
	('40000000-0008-0000-0000-000000000005','10000000-0000-0000-0000-000000000008','rajčatové pyré',300,'ml',NULL,false,5),
	('40000000-0008-0000-0000-000000000006','10000000-0000-0000-0000-000000000008','smetana ke šlehání',100,'ml',NULL,false,6),
	('40000000-0008-0000-0000-000000000007','10000000-0000-0000-0000-000000000008','česnek',4,'stroužky',NULL,false,7),
	('40000000-0008-0000-0000-000000000008','10000000-0000-0000-0000-000000000008','zázvor',15,'g','strouhaný',false,8),
	-- Dal Makhani (009)
	('40000000-0009-0000-0000-000000000001','10000000-0000-0000-0000-000000000009','černá čočka (urad dal)',250,'g','namočená přes noc',false,1),
	('40000000-0009-0000-0000-000000000002','10000000-0000-0000-0000-000000000009','máslo',60,'g',NULL,false,2),
	('40000000-0009-0000-0000-000000000003','10000000-0000-0000-0000-000000000009','cibule',1,'ks','jemně nakrájená',false,3),
	('40000000-0009-0000-0000-000000000004','10000000-0000-0000-0000-000000000009','rajčatové pyré',200,'ml',NULL,false,4),
	('40000000-0009-0000-0000-000000000005','10000000-0000-0000-0000-000000000009','garam masala',8,'g',NULL,false,5),
	('40000000-0009-0000-0000-000000000006','10000000-0000-0000-0000-000000000009','smetana',80,'ml',NULL,false,6),
	('40000000-0009-0000-0000-000000000007','10000000-0000-0000-0000-000000000009','kasoori methi',5,'g',NULL,true,7),
	-- Paella Valenciana (010)
	('40000000-0010-0000-0000-000000000001','10000000-0000-0000-0000-000000000010','kulatá paella rýže',350,'g',NULL,false,1),
	('40000000-0010-0000-0000-000000000002','10000000-0000-0000-0000-000000000010','kuřecí stehna',400,'g','nakrájená',false,2),
	('40000000-0010-0000-0000-000000000003','10000000-0000-0000-0000-000000000010','králík',300,'g','nakrájený',false,3),
	('40000000-0010-0000-0000-000000000004','10000000-0000-0000-0000-000000000010','šafrán',0.5,'g',NULL,false,4),
	('40000000-0010-0000-0000-000000000005','10000000-0000-0000-0000-000000000010','kuřecí vývar',900,'ml',NULL,false,5),
	('40000000-0010-0000-0000-000000000006','10000000-0000-0000-0000-000000000010','paprikové lusky',2,'ks','červené a zelené',false,6),
	('40000000-0010-0000-0000-000000000007','10000000-0000-0000-0000-000000000010','olivový olej',40,'ml',NULL,false,7),
	-- Pasteis de Nata (011)
	('40000000-0011-0000-0000-000000000001','10000000-0000-0000-0000-000000000011','listové těsto',250,'g',NULL,false,1),
	('40000000-0011-0000-0000-000000000002','10000000-0000-0000-0000-000000000011','plnotučné mléko',300,'ml',NULL,false,2),
	('40000000-0011-0000-0000-000000000003','10000000-0000-0000-0000-000000000011','cukr',150,'g',NULL,false,3),
	('40000000-0011-0000-0000-000000000004','10000000-0000-0000-0000-000000000011','žloutky',4,'ks',NULL,false,4),
	('40000000-0011-0000-0000-000000000005','10000000-0000-0000-0000-000000000011','mouka',20,'g',NULL,false,5),
	('40000000-0011-0000-0000-000000000006','10000000-0000-0000-0000-000000000011','vanilkový extrakt',5,'ml',NULL,false,6),
	('40000000-0011-0000-0000-000000000007','10000000-0000-0000-0000-000000000011','skořice',3,'g','k posypání',true,7),
	-- Spanakopita (012)
	('40000000-0012-0000-0000-000000000001','10000000-0000-0000-0000-000000000012','čerstvý špenát',500,'g',NULL,false,1),
	('40000000-0012-0000-0000-000000000002','10000000-0000-0000-0000-000000000012','feta sýr',250,'g','rozdrobený',false,2),
	('40000000-0012-0000-0000-000000000003','10000000-0000-0000-0000-000000000012','vejce',3,'ks',NULL,false,3),
	('40000000-0012-0000-0000-000000000004','10000000-0000-0000-0000-000000000012','filo těsto',10,'plátek',NULL,false,4),
	('40000000-0012-0000-0000-000000000005','10000000-0000-0000-0000-000000000012','máslo',80,'g','rozpuštěné',false,5),
	('40000000-0012-0000-0000-000000000006','10000000-0000-0000-0000-000000000012','jarní cibulka',3,'stonky','nakrájená',false,6),
	('40000000-0012-0000-0000-000000000007','10000000-0000-0000-0000-000000000012','čerstvý kopr',15,'g',NULL,true,7),
	-- Svíčková (013)
	('40000000-0013-0000-0000-000000000001','10000000-0000-0000-0000-000000000013','hovězí svíčková',800,'g',NULL,false,1),
	('40000000-0013-0000-0000-000000000002','10000000-0000-0000-0000-000000000013','mrkev',2,'ks','nakrájená',false,2),
	('40000000-0013-0000-0000-000000000003','10000000-0000-0000-0000-000000000013','petržel kořenová',1,'ks','nakrájená',false,3),
	('40000000-0013-0000-0000-000000000004','10000000-0000-0000-0000-000000000013','celer bulvový',0.25,'ks','nakrájený',false,4),
	('40000000-0013-0000-0000-000000000005','10000000-0000-0000-0000-000000000013','cibule',2,'ks',NULL,false,5),
	('40000000-0013-0000-0000-000000000006','10000000-0000-0000-0000-000000000013','smetana ke šlehání',200,'ml',NULL,false,6),
	('40000000-0013-0000-0000-000000000007','10000000-0000-0000-0000-000000000013','citron',0.5,'ks','šťáva',false,7),
	('40000000-0013-0000-0000-000000000008','10000000-0000-0000-0000-000000000013','houskové knedlíky',8,'ks','k podávání',false,8),
	-- Pierogi Ruskie (014)
	('40000000-0014-0000-0000-000000000001','10000000-0000-0000-0000-000000000014','brambory',400,'g','uvařené',false,1),
	('40000000-0014-0000-0000-000000000002','10000000-0000-0000-0000-000000000014','tvaroh',200,'g',NULL,false,2),
	('40000000-0014-0000-0000-000000000003','10000000-0000-0000-0000-000000000014','cibule',1,'ks','smažená dozlatova',false,3),
	('40000000-0014-0000-0000-000000000004','10000000-0000-0000-0000-000000000014','pšeničná mouka',300,'g',NULL,false,4),
	('40000000-0014-0000-0000-000000000005','10000000-0000-0000-0000-000000000014','vejce',1,'ks',NULL,false,5),
	('40000000-0014-0000-0000-000000000006','10000000-0000-0000-0000-000000000014','máslo',40,'g',NULL,false,6),
	('40000000-0014-0000-0000-000000000007','10000000-0000-0000-0000-000000000014','zakysaná smetana',100,'ml','k podávání',true,7),
	-- Wiener Schnitzel (015)
	('40000000-0015-0000-0000-000000000001','10000000-0000-0000-0000-000000000015','telecí plátky',400,'g','naklepané na 4 mm',false,1),
	('40000000-0015-0000-0000-000000000002','10000000-0000-0000-0000-000000000015','pšeničná mouka',50,'g',NULL,false,2),
	('40000000-0015-0000-0000-000000000003','10000000-0000-0000-0000-000000000015','vejce',2,'ks','rozšlehaná',false,3),
	('40000000-0015-0000-0000-000000000004','10000000-0000-0000-0000-000000000015','strouhanka',80,'g',NULL,false,4),
	('40000000-0015-0000-0000-000000000005','10000000-0000-0000-0000-000000000015','přepuštěné máslo',120,'ml',NULL,false,5),
	('40000000-0015-0000-0000-000000000006','10000000-0000-0000-0000-000000000015','citron',1,'ks','na podávání',true,6),
	-- Bratwurst mit Sauerkraut (016)
	('40000000-0016-0000-0000-000000000001','10000000-0000-0000-0000-000000000016','bratwurst klobása',4,'ks',NULL,false,1),
	('40000000-0016-0000-0000-000000000002','10000000-0000-0000-0000-000000000016','kysané zelí',400,'g',NULL,false,2),
	('40000000-0016-0000-0000-000000000003','10000000-0000-0000-0000-000000000016','cibule',1,'ks',NULL,false,3),
	('40000000-0016-0000-0000-000000000004','10000000-0000-0000-0000-000000000016','pivo světlý ležák',100,'ml',NULL,false,4),
	('40000000-0016-0000-0000-000000000005','10000000-0000-0000-0000-000000000016','nové koření',4,'ks',NULL,false,5),
	('40000000-0016-0000-0000-000000000006','10000000-0000-0000-0000-000000000016','hořčice',30,'g','k podávání',true,6),
	-- Guláš (017)
	('40000000-0017-0000-0000-000000000001','10000000-0000-0000-0000-000000000017','hovězí kližka',600,'g','nakrájená',false,1),
	('40000000-0017-0000-0000-000000000002','10000000-0000-0000-0000-000000000017','cibule',3,'ks',NULL,false,2),
	('40000000-0017-0000-0000-000000000003','10000000-0000-0000-0000-000000000017','sladká paprika mletá',20,'g',NULL,false,3),
	('40000000-0017-0000-0000-000000000004','10000000-0000-0000-0000-000000000017','pálivá paprika mletá',5,'g',NULL,false,4),
	('40000000-0017-0000-0000-000000000005','10000000-0000-0000-0000-000000000017','kmín',5,'g',NULL,false,5),
	('40000000-0017-0000-0000-000000000006','10000000-0000-0000-0000-000000000017','rajčatové pyré',100,'ml',NULL,false,6),
	('40000000-0017-0000-0000-000000000007','10000000-0000-0000-0000-000000000017','hovězí vývar',400,'ml',NULL,false,7),
	('40000000-0017-0000-0000-000000000008','10000000-0000-0000-0000-000000000017','sádlo',30,'g',NULL,false,8),
	-- Moules Frites (018)
	('40000000-0018-0000-0000-000000000001','10000000-0000-0000-0000-000000000018','slávky mušle',1000,'g','vyčistěné',false,1),
	('40000000-0018-0000-0000-000000000002','10000000-0000-0000-0000-000000000018','bílé víno suché',200,'ml',NULL,false,2),
	('40000000-0018-0000-0000-000000000003','10000000-0000-0000-0000-000000000018','šalotka',2,'ks','jemně nakrájená',false,3),
	('40000000-0018-0000-0000-000000000004','10000000-0000-0000-0000-000000000018','česnek',2,'stroužky',NULL,false,4),
	('40000000-0018-0000-0000-000000000005','10000000-0000-0000-0000-000000000018','máslo',40,'g',NULL,false,5),
	('40000000-0018-0000-0000-000000000006','10000000-0000-0000-0000-000000000018','brambory na hranolky',400,'g',NULL,false,6),
	('40000000-0018-0000-0000-000000000007','10000000-0000-0000-0000-000000000018','petrželka',10,'g',NULL,true,7),
	-- Nasi Goreng (019)
	('40000000-0019-0000-0000-000000000001','10000000-0000-0000-0000-000000000019','vařená studená rýže',400,'g','den starý',false,1),
	('40000000-0019-0000-0000-000000000002','10000000-0000-0000-0000-000000000019','krevety',150,'g','oloupaný',false,2),
	('40000000-0019-0000-0000-000000000003','10000000-0000-0000-0000-000000000019','kecap manis',30,'ml',NULL,false,3),
	('40000000-0019-0000-0000-000000000004','10000000-0000-0000-0000-000000000019','sambal oelek',15,'ml',NULL,false,4),
	('40000000-0019-0000-0000-000000000005','10000000-0000-0000-0000-000000000019','sójová omáčka',15,'ml',NULL,false,5),
	('40000000-0019-0000-0000-000000000006','10000000-0000-0000-0000-000000000019','vejce',2,'ks',NULL,false,6),
	('40000000-0019-0000-0000-000000000007','10000000-0000-0000-0000-000000000019','kerupuk (kroupy)',4,'ks','k podávání',true,7),
	-- Bibimbap (020)
	('40000000-0020-0000-0000-000000000001','10000000-0000-0000-0000-000000000020','krátká korejská rýže',300,'g',NULL,false,1),
	('40000000-0020-0000-0000-000000000002','10000000-0000-0000-0000-000000000020','hovězí svíčková',150,'g','nakrájená na nudličky',false,2),
	('40000000-0020-0000-0000-000000000003','10000000-0000-0000-0000-000000000020','špenát',100,'g',NULL,false,3),
	('40000000-0020-0000-0000-000000000004','10000000-0000-0000-0000-000000000020','mrkev',1,'ks','julienne',false,4),
	('40000000-0020-0000-0000-000000000005','10000000-0000-0000-0000-000000000020','klíčky fazolu mungo',80,'g',NULL,false,5),
	('40000000-0020-0000-0000-000000000006','10000000-0000-0000-0000-000000000020','vejce',2,'ks',NULL,false,6),
	('40000000-0020-0000-0000-000000000007','10000000-0000-0000-0000-000000000020','gochujang pasta',40,'g',NULL,false,7),
	('40000000-0020-0000-0000-000000000008','10000000-0000-0000-0000-000000000020','sezamový olej',15,'ml',NULL,false,8)
ON CONFLICT (id) DO UPDATE
SET
	custom_name  = EXCLUDED.custom_name,
	amount       = EXCLUDED.amount,
	unit         = EXCLUDED.unit,
	prep_note    = EXCLUDED.prep_note,
	is_optional  = EXCLUDED.is_optional,
	sort_order   = EXCLUDED.sort_order,
	updated_at   = timezone('utc', now());

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
