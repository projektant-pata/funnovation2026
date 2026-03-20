BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Compatibility helpers for local PostgreSQL validation.
-- In Supabase these objects already exist, so these blocks are no-ops.
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS auth;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.tables
		WHERE table_schema = 'auth' AND table_name = 'users'
	) THEN
		CREATE TABLE auth.users (
			id uuid PRIMARY KEY,
			email text
		);
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_proc p
		JOIN pg_namespace n ON n.oid = p.pronamespace
		WHERE n.nspname = 'auth'
			AND p.proname = 'uid'
			AND pg_get_function_identity_arguments(p.oid) = ''
	) THEN
		EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS ''SELECT NULL::uuid''';
	END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------
CREATE TYPE public.app_language AS ENUM ('cs', 'en');
CREATE TYPE public.cooking_frequency AS ENUM ('never', 'few_per_month', 'few_per_week', 'daily');
CREATE TYPE public.time_budget_bucket AS ENUM ('under_30', 'between_30_60', 'between_60_120', 'no_limit');
CREATE TYPE public.consent_type AS ENUM ('terms', 'privacy', 'health_data', 'ai_personalization', 'marketing');
CREATE TYPE public.export_job_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TYPE public.deletion_request_status AS ENUM ('requested', 'processing', 'completed', 'rejected');
CREATE TYPE public.allergy_severity AS ENUM ('unknown', 'mild', 'moderate', 'severe');

CREATE TYPE public.recipe_type AS ENUM ('curated', 'verified', 'community');
CREATE TYPE public.recipe_visibility AS ENUM ('public', 'group', 'private');
CREATE TYPE public.media_kind AS ENUM ('image', 'video');

CREATE TYPE public.group_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'cancelled');

CREATE TYPE public.campaign_task_kind AS ENUM ('main', 'subtask');
CREATE TYPE public.cutscene_phase AS ENUM ('pre_level', 'post_level', 'branch_decision');

CREATE TYPE public.challenge_type AS ENUM ('personal', 'community');
CREATE TYPE public.challenge_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.challenge_status AS ENUM ('draft', 'active', 'voting', 'completed', 'cancelled');

CREATE TYPE public.cooking_source_context AS ENUM ('campaign', 'sandbox', 'map', 'challenge', 'meal_plan', 'social');
CREATE TYPE public.cooking_session_status AS ENUM ('in_progress', 'completed', 'abandoned');

CREATE TYPE public.shopping_item_status AS ENUM ('pending', 'purchased', 'moved_to_pantry');
CREATE TYPE public.pantry_item_source AS ENUM ('manual', 'receipt_ocr', 'shopping_list');
CREATE TYPE public.meal_slot AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

CREATE TYPE public.ai_job_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected', 'needs_review');

CREATE TYPE public.xp_source_type AS ENUM (
	'campaign_main_task',
	'campaign_subtask',
	'sandbox_recipe',
	'personal_challenge_easy',
	'personal_challenge_medium',
	'personal_challenge_hard',
	'community_challenge_win',
	'recipe_create',
	'challenge_vote',
	'admin_adjustment'
);

CREATE TYPE public.ai_interaction_kind AS ENUM (
	'chat',
	'voice',
	'onboarding_eval',
	'recipe_adaptation',
	'meal_plan_generation',
	'fridge_recipe',
	'challenge_generation',
	'image_moderation',
	'ocr',
	'translation'
);

CREATE TYPE public.ai_asset_type AS ENUM ('recipe', 'meal_plan', 'challenge', 'translation', 'moderation_result', 'ocr_result');
CREATE TYPE public.image_source_type AS ENUM ('profile_avatar', 'cooking_session', 'challenge_submission', 'reel', 'recipe_media');

-- ---------------------------------------------------------------------------
-- Utility functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	NEW.updated_at = timezone('utc', now());
	RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.attach_updated_at_trigger(target_table regclass)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
	EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %s', target_table);
	EXECUTE format(
		'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
		target_table
	);
END;
$$;

-- ---------------------------------------------------------------------------
-- Identity, profile, onboarding, GDPR
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
	user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	username text UNIQUE,
	display_name text,
	bio text,
	avatar_url text,
	preferred_language public.app_language NOT NULL DEFAULT 'cs',
	timezone_name text NOT NULL DEFAULT 'Europe/Prague',
	is_ai_personalization_enabled boolean NOT NULL DEFAULT true,
	current_level integer NOT NULL DEFAULT 1 CHECK (current_level >= 1),
	total_xp bigint NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
	streak_days integer NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
	last_cooked_at date,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_\.]{3,30}$')
);

CREATE TABLE public.user_preferences (
	user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	cooking_frequency public.cooking_frequency,
	time_budget public.time_budget_bucket,
	motivations text[] NOT NULL DEFAULT '{}',
	onboarding_completed_at timestamptz,
	skip_personalization boolean NOT NULL DEFAULT false,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.user_skill_assessments (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	source text NOT NULL DEFAULT 'onboarding',
	skill_level smallint NOT NULL CHECK (skill_level BETWEEN 1 AND 7),
	model_name text,
	rationale text,
	raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.consents (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	consent_type public.consent_type NOT NULL,
	granted boolean NOT NULL,
	granted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	withdrawn_at timestamptz,
	policy_version text NOT NULL,
	source text NOT NULL DEFAULT 'onboarding',
	metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (withdrawn_at IS NULL OR withdrawn_at >= granted_at)
);

CREATE TABLE public.data_export_jobs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	status public.export_job_status NOT NULL DEFAULT 'queued',
	requested_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	processed_at timestamptz,
	file_url text,
	expires_at timestamptz,
	error_message text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.deletion_requests (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	status public.deletion_request_status NOT NULL DEFAULT 'requested',
	reason text,
	requested_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	processed_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Taxonomy and localization dictionaries
-- ---------------------------------------------------------------------------
CREATE TABLE public.continents (
	code text PRIMARY KEY,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.countries (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	iso2 char(2) NOT NULL UNIQUE,
	continent_code text REFERENCES public.continents(code) ON DELETE SET NULL,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.map_groups (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	emoji text,
	color text NOT NULL,
	hover_color text NOT NULL,
	sort_order integer NOT NULL DEFAULT 0,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.country_map_group (
	country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
	map_group_id uuid NOT NULL REFERENCES public.map_groups(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (country_id, map_group_id)
);

CREATE TABLE public.allergens (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	is_health_data boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.diet_types (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.recipe_categories (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.recipe_tags (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.ingredients (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	canonical_name text NOT NULL UNIQUE,
	default_unit text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.user_diets (
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	diet_type_id uuid NOT NULL REFERENCES public.diet_types(id) ON DELETE CASCADE,
	is_primary boolean NOT NULL DEFAULT false,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (user_id, diet_type_id)
);

CREATE TABLE public.user_allergies (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	allergen_id uuid REFERENCES public.allergens(id) ON DELETE SET NULL,
	custom_label text,
	is_intolerance boolean NOT NULL DEFAULT false,
	severity public.allergy_severity NOT NULL DEFAULT 'unknown',
	consent_id uuid NOT NULL REFERENCES public.consents(id) ON DELETE RESTRICT,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK ((allergen_id IS NOT NULL) <> (custom_label IS NOT NULL))
);

-- ---------------------------------------------------------------------------
-- Groups and social graph
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_groups (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name text NOT NULL,
	description text,
	owner_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	invite_code text NOT NULL UNIQUE,
	is_private boolean NOT NULL DEFAULT false,
	max_members integer NOT NULL DEFAULT 100 CHECK (max_members > 0),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.group_memberships (
	group_id uuid NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	member_role public.group_member_role NOT NULL DEFAULT 'member',
	is_active boolean NOT NULL DEFAULT true,
	joined_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (group_id, user_id)
);

CREATE TABLE public.group_invitations (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	group_id uuid NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
	inviter_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	invitee_user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	email text,
	invite_code text NOT NULL,
	status public.invite_status NOT NULL DEFAULT 'pending',
	expires_at timestamptz NOT NULL,
	responded_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.follows (
	follower_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	followed_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (follower_user_id, followed_user_id),
	CHECK (follower_user_id <> followed_user_id)
);

-- ---------------------------------------------------------------------------
-- Recipes and localization
-- ---------------------------------------------------------------------------
CREATE TABLE public.recipes (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	owner_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	type public.recipe_type NOT NULL,
	visibility public.recipe_visibility NOT NULL DEFAULT 'public',
	difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
	prep_time_minutes integer NOT NULL CHECK (prep_time_minutes >= 0),
	cook_time_minutes integer NOT NULL CHECK (cook_time_minutes >= 0),
	servings integer NOT NULL CHECK (servings > 0),
	country_id uuid REFERENCES public.countries(id) ON DELETE SET NULL,
	continent_code text REFERENCES public.continents(code) ON DELETE SET NULL,
	category_id uuid REFERENCES public.recipe_categories(id) ON DELETE SET NULL,
	image_url text,
	is_published boolean NOT NULL DEFAULT true,
	ai_generated boolean NOT NULL DEFAULT false,
	source_recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
	deleted_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.recipe_translations (
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	locale public.app_language NOT NULL,
	title text NOT NULL,
	description text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (recipe_id, locale)
);

CREATE TABLE public.recipe_ingredients (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE SET NULL,
	custom_name text,
	amount numeric(12,3),
	unit text,
	prep_note text,
	is_optional boolean NOT NULL DEFAULT false,
	sort_order integer NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK ((ingredient_id IS NOT NULL) <> (custom_name IS NOT NULL)),
	UNIQUE (recipe_id, sort_order)
);

CREATE TABLE public.recipe_steps (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	step_number integer NOT NULL CHECK (step_number > 0),
	default_timer_seconds integer CHECK (default_timer_seconds IS NULL OR default_timer_seconds > 0),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (recipe_id, step_number)
);

CREATE TABLE public.recipe_step_translations (
	step_id uuid NOT NULL REFERENCES public.recipe_steps(id) ON DELETE CASCADE,
	locale public.app_language NOT NULL,
	instruction text NOT NULL,
	tip text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (step_id, locale)
);

CREATE TABLE public.recipe_allergens (
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	allergen_id uuid NOT NULL REFERENCES public.allergens(id) ON DELETE CASCADE,
	PRIMARY KEY (recipe_id, allergen_id)
);

CREATE TABLE public.recipe_diet_compatibility (
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	diet_type_id uuid NOT NULL REFERENCES public.diet_types(id) ON DELETE CASCADE,
	compatibility text NOT NULL CHECK (compatibility IN ('compatible', 'not_compatible', 'requires_substitution')),
	PRIMARY KEY (recipe_id, diet_type_id)
);

CREATE TABLE public.recipe_tag_links (
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	tag_id uuid NOT NULL REFERENCES public.recipe_tags(id) ON DELETE CASCADE,
	PRIMARY KEY (recipe_id, tag_id)
);

CREATE TABLE public.recipe_media (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	media_kind public.media_kind NOT NULL,
	url text NOT NULL,
	is_primary boolean NOT NULL DEFAULT false,
	uploaded_by_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.recipe_group_shares (
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	group_id uuid NOT NULL REFERENCES public.user_groups(id) ON DELETE CASCADE,
	shared_by_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (recipe_id, group_id)
);

CREATE TABLE public.reels (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	caption text,
	video_url text NOT NULL,
	thumbnail_url text,
	duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds > 0),
	visibility public.recipe_visibility NOT NULL DEFAULT 'public',
	moderation_status public.moderation_status NOT NULL DEFAULT 'pending',
	deleted_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.reel_likes (
	reel_id uuid NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (reel_id, user_id)
);

CREATE TABLE public.reel_comments (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	reel_id uuid NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	parent_comment_id uuid REFERENCES public.reel_comments(id) ON DELETE CASCADE,
	body text NOT NULL,
	deleted_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.social_feed_impressions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	viewer_user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	reel_id uuid NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
	watch_seconds numeric(10,2),
	is_completed boolean NOT NULL DEFAULT false,
	shown_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Campaign, storyline tree, tasks
-- ---------------------------------------------------------------------------
CREATE TABLE public.campaigns (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	slug text NOT NULL UNIQUE,
	is_active boolean NOT NULL DEFAULT true,
	title_cs text NOT NULL,
	title_en text NOT NULL,
	description_cs text,
	description_en text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.campaign_nodes (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
	node_key text NOT NULL,
	chapter_order integer NOT NULL DEFAULT 0,
	map_x numeric(8,3),
	map_y numeric(8,3),
	suggested_skill_level smallint CHECK (suggested_skill_level BETWEEN 1 AND 7),
	is_start_node boolean NOT NULL DEFAULT false,
	is_branching_node boolean NOT NULL DEFAULT false,
	is_demo_playable boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (campaign_id, node_key)
);

CREATE TABLE public.campaign_node_translations (
	node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	locale public.app_language NOT NULL,
	title text NOT NULL,
	summary text,
	narrative_intro text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (node_id, locale)
);

CREATE TABLE public.campaign_edges (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
	from_node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	to_node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	decision_key text,
	decision_label_cs text,
	decision_label_en text,
	sort_order integer NOT NULL DEFAULT 0,
	is_default_path boolean NOT NULL DEFAULT false,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (from_node_id <> to_node_id)
);

CREATE TABLE public.cutscenes (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	phase public.cutscene_phase NOT NULL,
	script_json jsonb NOT NULL,
	ai_generated boolean NOT NULL DEFAULT false,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (node_id, phase)
);

CREATE TABLE public.campaign_tasks (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	task_kind public.campaign_task_kind NOT NULL,
	task_order integer NOT NULL,
	xp_reward integer NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (node_id, task_order)
);

CREATE TABLE public.campaign_task_translations (
	task_id uuid NOT NULL REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
	locale public.app_language NOT NULL,
	title text NOT NULL,
	description text,
	objective text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (task_id, locale)
);

CREATE TABLE public.campaign_task_recipes (
	campaign_task_id uuid NOT NULL REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
	is_primary boolean NOT NULL DEFAULT false,
	PRIMARY KEY (campaign_task_id, recipe_id)
);

CREATE TABLE public.user_campaign_progress (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
	node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	completion_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
	main_task_completed boolean NOT NULL DEFAULT false,
	all_subtasks_completed boolean NOT NULL DEFAULT false,
	started_at timestamptz,
	completed_at timestamptz,
	last_played_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (user_id, node_id)
);

CREATE TABLE public.user_node_decisions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
	from_node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	selected_edge_id uuid NOT NULL REFERENCES public.campaign_edges(id) ON DELETE CASCADE,
	selected_to_node_id uuid NOT NULL REFERENCES public.campaign_nodes(id) ON DELETE CASCADE,
	decided_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (user_id, from_node_id)
);

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------
CREATE TABLE public.challenges (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	challenge_type public.challenge_type NOT NULL,
	difficulty public.challenge_difficulty,
	status public.challenge_status NOT NULL DEFAULT 'draft',
	title_cs text NOT NULL,
	title_en text NOT NULL,
	description_cs text,
	description_en text,
	generated_by_ai boolean NOT NULL DEFAULT false,
	ai_model text,
	starts_at timestamptz,
	ends_at timestamptz,
	voting_ends_at timestamptz,
	created_by_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (difficulty IS NOT NULL OR challenge_type = 'community')
);

CREATE TABLE public.personal_challenges (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	challenge_id uuid NOT NULL UNIQUE REFERENCES public.challenges(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	xp_reward integer NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
	crown_reward integer NOT NULL DEFAULT 1 CHECK (crown_reward >= 0),
	completion_proof_session_id uuid,
	completed_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (user_id, challenge_id)
);

CREATE TABLE public.community_challenge_submissions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
	title text,
	description text,
	media_url text NOT NULL,
	moderation_status public.moderation_status NOT NULL DEFAULT 'pending',
	submitted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (challenge_id, user_id)
);

CREATE TABLE public.challenge_pair_votes (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
	voter_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	submission_a_id uuid NOT NULL REFERENCES public.community_challenge_submissions(id) ON DELETE CASCADE,
	submission_b_id uuid NOT NULL REFERENCES public.community_challenge_submissions(id) ON DELETE CASCADE,
	selected_submission_id uuid NOT NULL REFERENCES public.community_challenge_submissions(id) ON DELETE CASCADE,
	voted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (submission_a_id <> submission_b_id),
	CHECK (selected_submission_id = submission_a_id OR selected_submission_id = submission_b_id)
);

CREATE TABLE public.challenge_results (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
	submission_id uuid NOT NULL REFERENCES public.community_challenge_submissions(id) ON DELETE CASCADE,
	rank_position integer NOT NULL CHECK (rank_position > 0),
	score numeric(12,4) NOT NULL DEFAULT 0,
	is_winner boolean NOT NULL DEFAULT false,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (challenge_id, rank_position),
	UNIQUE (challenge_id, submission_id)
);

-- ---------------------------------------------------------------------------
-- Cooking runtime, progress, and media diary
-- ---------------------------------------------------------------------------
CREATE TABLE public.cooking_sessions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE RESTRICT,
	source_context public.cooking_source_context NOT NULL,
	campaign_task_id uuid REFERENCES public.campaign_tasks(id) ON DELETE SET NULL,
	challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
	status public.cooking_session_status NOT NULL DEFAULT 'in_progress',
	servings_override integer CHECK (servings_override IS NULL OR servings_override > 0),
	started_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	finished_at timestamptz,
	notes text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (finished_at IS NULL OR finished_at >= started_at)
);

ALTER TABLE public.personal_challenges
	ADD CONSTRAINT personal_challenges_completion_session_fk
	FOREIGN KEY (completion_proof_session_id)
	REFERENCES public.cooking_sessions(id)
	ON DELETE SET NULL;

CREATE TABLE public.cooking_session_step_progress (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	session_id uuid NOT NULL REFERENCES public.cooking_sessions(id) ON DELETE CASCADE,
	step_id uuid NOT NULL REFERENCES public.recipe_steps(id) ON DELETE RESTRICT,
	is_completed boolean NOT NULL DEFAULT false,
	completed_at timestamptz,
	timer_seconds_used integer,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (session_id, step_id)
);

CREATE TABLE public.cooking_session_notes (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	session_id uuid NOT NULL REFERENCES public.cooking_sessions(id) ON DELETE CASCADE,
	user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	note_text text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.cooking_session_media (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	session_id uuid NOT NULL REFERENCES public.cooking_sessions(id) ON DELETE CASCADE,
	user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	media_url text NOT NULL,
	media_kind public.media_kind NOT NULL,
	caption text,
	moderation_status public.moderation_status NOT NULL DEFAULT 'pending',
	moderation_score numeric(5,4),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.user_region_progress (
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	continent_code text NOT NULL REFERENCES public.continents(code) ON DELETE CASCADE,
	cooked_recipe_count integer NOT NULL DEFAULT 0 CHECK (cooked_recipe_count >= 0),
	unlocked_at timestamptz,
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (user_id, continent_code)
);

-- ---------------------------------------------------------------------------
-- Gamification
-- ---------------------------------------------------------------------------
CREATE TABLE public.level_config (
	level integer PRIMARY KEY CHECK (level >= 1),
	xp_required_total bigint NOT NULL CHECK (xp_required_total >= 0),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.xp_events (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	source_type public.xp_source_type NOT NULL,
	source_id uuid,
	xp_delta integer NOT NULL,
	metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
	occurred_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.badges (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	code text NOT NULL UNIQUE,
	name_cs text NOT NULL,
	name_en text NOT NULL,
	description_cs text,
	description_en text,
	icon_url text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.user_badges (
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
	earned_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	source_id uuid,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE public.streaks (
	user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	current_streak_days integer NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
	longest_streak_days integer NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
	last_cook_date date,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.crowns (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	source_challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
	difficulty public.challenge_difficulty NOT NULL,
	earned_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Meal plans, pantry, shopping list, OCR
-- ---------------------------------------------------------------------------
CREATE TABLE public.meal_plans (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	title text NOT NULL DEFAULT 'Meal plan',
	days_count integer NOT NULL CHECK (days_count BETWEEN 1 AND 14),
	starts_on date,
	preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
	generated_by_ai boolean NOT NULL DEFAULT false,
	ai_model text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.meal_plan_items (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	meal_plan_id uuid NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
	day_offset integer NOT NULL CHECK (day_offset >= 0),
	meal_slot public.meal_slot NOT NULL,
	recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
	generated_recipe_payload jsonb,
	note text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	UNIQUE (meal_plan_id, day_offset, meal_slot)
);

CREATE TABLE public.pantry_items (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE SET NULL,
	custom_name text,
	quantity numeric(12,3),
	unit text,
	expires_on date,
	source public.pantry_item_source NOT NULL DEFAULT 'manual',
	source_reference_id uuid,
	is_consumed boolean NOT NULL DEFAULT false,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (ingredient_id IS NOT NULL OR custom_name IS NOT NULL)
);

CREATE TABLE public.shopping_lists (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	title text NOT NULL DEFAULT 'Shopping list',
	is_default boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.shopping_list_items (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	shopping_list_id uuid NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
	ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE SET NULL,
	custom_name text,
	quantity numeric(12,3),
	unit text,
	status public.shopping_item_status NOT NULL DEFAULT 'pending',
	linked_recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
	linked_meal_plan_id uuid REFERENCES public.meal_plans(id) ON DELETE SET NULL,
	moved_to_pantry_item_id uuid REFERENCES public.pantry_items(id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	CHECK (ingredient_id IS NOT NULL OR custom_name IS NOT NULL)
);

CREATE TABLE public.receipt_ocr_jobs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
	source_image_url text NOT NULL,
	status public.ai_job_status NOT NULL DEFAULT 'queued',
	raw_response jsonb NOT NULL DEFAULT '{}'::jsonb,
	processed_at timestamptz,
	error_message text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.receipt_ocr_items (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	ocr_job_id uuid NOT NULL REFERENCES public.receipt_ocr_jobs(id) ON DELETE CASCADE,
	detected_name text NOT NULL,
	ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE SET NULL,
	quantity numeric(12,3),
	unit text,
	confidence numeric(5,4),
	accepted boolean NOT NULL DEFAULT true,
	pantry_item_id uuid REFERENCES public.pantry_items(id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- AI logs, moderation, audits
-- ---------------------------------------------------------------------------
CREATE TABLE public.ai_interactions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	cooking_session_id uuid REFERENCES public.cooking_sessions(id) ON DELETE SET NULL,
	context_screen text,
	interaction_kind public.ai_interaction_kind NOT NULL,
	model_name text NOT NULL,
	system_prompt text,
	user_message text,
	response_text text,
	request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
	response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
	prompt_tokens integer,
	completion_tokens integer,
	total_tokens integer,
	latency_ms integer,
	success boolean NOT NULL DEFAULT true,
	error_message text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.ai_generated_assets (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	ai_interaction_id uuid NOT NULL REFERENCES public.ai_interactions(id) ON DELETE CASCADE,
	asset_type public.ai_asset_type NOT NULL,
	target_table text,
	target_id uuid,
	content jsonb NOT NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.image_moderation_logs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	source_type public.image_source_type NOT NULL,
	source_id uuid,
	image_url text NOT NULL,
	model_name text,
	nsfw_score numeric(5,4),
	relevance_score numeric(5,4),
	action_taken text NOT NULL CHECK (action_taken IN ('allow', 'block', 'review')),
	raw_response jsonb NOT NULL DEFAULT '{}'::jsonb,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.audit_events (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	actor_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	event_type text NOT NULL,
	entity_type text NOT NULL,
	entity_id uuid,
	old_data jsonb,
	new_data jsonb,
	metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
	ip_address inet,
	user_agent text,
	occurred_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Glossary
-- ---------------------------------------------------------------------------
CREATE TABLE public.glossary_terms (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	slug text NOT NULL UNIQUE,
	created_by_user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.glossary_term_translations (
	term_id uuid NOT NULL REFERENCES public.glossary_terms(id) ON DELETE CASCADE,
	locale public.app_language NOT NULL,
	term text NOT NULL,
	definition text NOT NULL,
	example_usage text,
	created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
	PRIMARY KEY (term_id, locale)
);

-- ---------------------------------------------------------------------------
-- Consent integrity helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_health_data_consent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	consent_ok boolean;
BEGIN
	SELECT (
		c.user_id = NEW.user_id
		AND c.consent_type = 'health_data'
		AND c.granted = true
		AND c.withdrawn_at IS NULL
	)
	INTO consent_ok
	FROM public.consents c
	WHERE c.id = NEW.consent_id;

	IF consent_ok IS DISTINCT FROM true THEN
		RAISE EXCEPTION 'Health data consent is required for user_allergies';
	END IF;

	RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_allergies_health_consent ON public.user_allergies;
CREATE TRIGGER trg_user_allergies_health_consent
BEFORE INSERT OR UPDATE ON public.user_allergies
FOR EACH ROW
EXECUTE FUNCTION public.ensure_health_data_consent();

-- ---------------------------------------------------------------------------
-- Authorization helper functions for RLS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id uuid, requesting_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM public.group_memberships gm
		WHERE gm.group_id = target_group_id
			AND gm.user_id = requesting_user
			AND gm.is_active = true
	);
$$;

CREATE OR REPLACE FUNCTION public.can_write_recipe(target_recipe_id uuid, requesting_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM public.recipes r
		WHERE r.id = target_recipe_id
			AND r.owner_user_id = requesting_user
	);
$$;

CREATE OR REPLACE FUNCTION public.can_read_recipe(target_recipe_id uuid, requesting_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM public.recipes r
		WHERE r.id = target_recipe_id
			AND (
				r.visibility = 'public'
				OR (requesting_user IS NOT NULL AND r.owner_user_id = requesting_user)
				OR (
					r.visibility = 'group'
					AND requesting_user IS NOT NULL
					AND EXISTS (
						SELECT 1
						FROM public.recipe_group_shares rgs
						JOIN public.group_memberships gm ON gm.group_id = rgs.group_id
						WHERE rgs.recipe_id = r.id
							AND gm.user_id = requesting_user
							AND gm.is_active = true
					)
				)
			)
	);
$$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_user_skill_assessments_user ON public.user_skill_assessments(user_id, created_at DESC);
CREATE INDEX idx_consents_user_type ON public.consents(user_id, consent_type, granted_at DESC);
CREATE INDEX idx_data_export_jobs_user ON public.data_export_jobs(user_id, requested_at DESC);
CREATE INDEX idx_deletion_requests_user ON public.deletion_requests(user_id, requested_at DESC);

CREATE INDEX idx_countries_continent ON public.countries(continent_code);
CREATE INDEX idx_user_diets_user ON public.user_diets(user_id);
CREATE INDEX idx_user_allergies_user ON public.user_allergies(user_id);
CREATE INDEX idx_user_allergies_consent ON public.user_allergies(consent_id);

CREATE INDEX idx_group_memberships_user ON public.group_memberships(user_id);
CREATE INDEX idx_group_memberships_group_active ON public.group_memberships(group_id, is_active);
CREATE INDEX idx_group_invitations_group ON public.group_invitations(group_id, status);
CREATE INDEX idx_follows_followed ON public.follows(followed_user_id);

CREATE INDEX idx_recipes_owner ON public.recipes(owner_user_id);
CREATE INDEX idx_recipes_visibility_type ON public.recipes(visibility, type);
CREATE INDEX idx_recipes_country_diff ON public.recipes(country_id, difficulty);
CREATE INDEX idx_recipes_category ON public.recipes(category_id);
CREATE INDEX idx_recipes_created ON public.recipes(created_at DESC);

CREATE INDEX idx_recipe_translations_title_search
	ON public.recipe_translations
	USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id, sort_order);
CREATE INDEX idx_recipe_ingredients_ingredient ON public.recipe_ingredients(ingredient_id);
CREATE INDEX idx_recipe_steps_recipe ON public.recipe_steps(recipe_id, step_number);
CREATE INDEX idx_recipe_group_shares_group ON public.recipe_group_shares(group_id);
CREATE INDEX idx_reels_user_created ON public.reels(user_id, created_at DESC);
CREATE INDEX idx_reels_visibility ON public.reels(visibility, moderation_status);
CREATE INDEX idx_reel_comments_reel ON public.reel_comments(reel_id, created_at DESC);

CREATE INDEX idx_campaign_nodes_campaign ON public.campaign_nodes(campaign_id, chapter_order);
CREATE INDEX idx_campaign_edges_from ON public.campaign_edges(from_node_id, sort_order);
CREATE INDEX idx_campaign_edges_to ON public.campaign_edges(to_node_id);
CREATE INDEX idx_campaign_tasks_node ON public.campaign_tasks(node_id, task_order);
CREATE INDEX idx_user_campaign_progress_user ON public.user_campaign_progress(user_id, campaign_id);

CREATE INDEX idx_challenges_type_status ON public.challenges(challenge_type, status, starts_at);
CREATE INDEX idx_personal_challenges_user ON public.personal_challenges(user_id, completed_at);
CREATE INDEX idx_community_submissions_challenge ON public.community_challenge_submissions(challenge_id, submitted_at DESC);
CREATE INDEX idx_pair_votes_challenge_voter ON public.challenge_pair_votes(challenge_id, voter_user_id);

CREATE INDEX idx_cooking_sessions_user ON public.cooking_sessions(user_id, started_at DESC);
CREATE INDEX idx_cooking_sessions_recipe ON public.cooking_sessions(recipe_id);
CREATE INDEX idx_cooking_sessions_status ON public.cooking_sessions(status);
CREATE INDEX idx_cooking_step_progress_session ON public.cooking_session_step_progress(session_id);

CREATE INDEX idx_xp_events_user_time ON public.xp_events(user_id, occurred_at DESC);
CREATE INDEX idx_crowns_user_time ON public.crowns(user_id, earned_at DESC);

CREATE INDEX idx_meal_plans_user ON public.meal_plans(user_id, created_at DESC);
CREATE INDEX idx_meal_plan_items_plan ON public.meal_plan_items(meal_plan_id, day_offset, meal_slot);
CREATE INDEX idx_pantry_items_user_active ON public.pantry_items(user_id, is_consumed, expires_on);
CREATE INDEX idx_shopping_lists_user ON public.shopping_lists(user_id);
CREATE INDEX idx_shopping_list_items_status ON public.shopping_list_items(shopping_list_id, status);
CREATE UNIQUE INDEX idx_shopping_lists_default_per_user
	ON public.shopping_lists(user_id)
	WHERE is_default = true;

CREATE INDEX idx_receipt_ocr_jobs_user ON public.receipt_ocr_jobs(user_id, created_at DESC);
CREATE INDEX idx_receipt_ocr_items_job ON public.receipt_ocr_items(ocr_job_id);

CREATE INDEX idx_ai_interactions_user ON public.ai_interactions(user_id, created_at DESC);
CREATE INDEX idx_ai_interactions_kind ON public.ai_interactions(interaction_kind, created_at DESC);
CREATE INDEX idx_image_moderation_source ON public.image_moderation_logs(source_type, source_id, created_at DESC);
CREATE INDEX idx_audit_events_entity ON public.audit_events(entity_type, entity_id, occurred_at DESC);

CREATE UNIQUE INDEX idx_user_allergies_known_unique
	ON public.user_allergies(user_id, allergen_id)
	WHERE allergen_id IS NOT NULL;

CREATE UNIQUE INDEX idx_user_allergies_custom_unique
	ON public.user_allergies(user_id, custom_label)
	WHERE custom_label IS NOT NULL;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
SELECT public.attach_updated_at_trigger('public.profiles');
SELECT public.attach_updated_at_trigger('public.user_preferences');
SELECT public.attach_updated_at_trigger('public.consents');
SELECT public.attach_updated_at_trigger('public.data_export_jobs');
SELECT public.attach_updated_at_trigger('public.deletion_requests');
SELECT public.attach_updated_at_trigger('public.continents');
SELECT public.attach_updated_at_trigger('public.countries');
SELECT public.attach_updated_at_trigger('public.allergens');
SELECT public.attach_updated_at_trigger('public.diet_types');
SELECT public.attach_updated_at_trigger('public.recipe_categories');
SELECT public.attach_updated_at_trigger('public.recipe_tags');
SELECT public.attach_updated_at_trigger('public.ingredients');
SELECT public.attach_updated_at_trigger('public.user_diets');
SELECT public.attach_updated_at_trigger('public.user_allergies');
SELECT public.attach_updated_at_trigger('public.user_groups');
SELECT public.attach_updated_at_trigger('public.group_memberships');
SELECT public.attach_updated_at_trigger('public.group_invitations');
SELECT public.attach_updated_at_trigger('public.recipes');
SELECT public.attach_updated_at_trigger('public.recipe_translations');
SELECT public.attach_updated_at_trigger('public.recipe_ingredients');
SELECT public.attach_updated_at_trigger('public.recipe_steps');
SELECT public.attach_updated_at_trigger('public.recipe_step_translations');
SELECT public.attach_updated_at_trigger('public.recipe_media');
SELECT public.attach_updated_at_trigger('public.reels');
SELECT public.attach_updated_at_trigger('public.reel_comments');
SELECT public.attach_updated_at_trigger('public.campaigns');
SELECT public.attach_updated_at_trigger('public.campaign_nodes');
SELECT public.attach_updated_at_trigger('public.campaign_node_translations');
SELECT public.attach_updated_at_trigger('public.cutscenes');
SELECT public.attach_updated_at_trigger('public.campaign_tasks');
SELECT public.attach_updated_at_trigger('public.campaign_task_translations');
SELECT public.attach_updated_at_trigger('public.user_campaign_progress');
SELECT public.attach_updated_at_trigger('public.challenges');
SELECT public.attach_updated_at_trigger('public.personal_challenges');
SELECT public.attach_updated_at_trigger('public.community_challenge_submissions');
SELECT public.attach_updated_at_trigger('public.cooking_sessions');
SELECT public.attach_updated_at_trigger('public.cooking_session_step_progress');
SELECT public.attach_updated_at_trigger('public.cooking_session_notes');
SELECT public.attach_updated_at_trigger('public.cooking_session_media');
SELECT public.attach_updated_at_trigger('public.user_region_progress');
SELECT public.attach_updated_at_trigger('public.badges');
SELECT public.attach_updated_at_trigger('public.streaks');
SELECT public.attach_updated_at_trigger('public.meal_plans');
SELECT public.attach_updated_at_trigger('public.meal_plan_items');
SELECT public.attach_updated_at_trigger('public.pantry_items');
SELECT public.attach_updated_at_trigger('public.shopping_lists');
SELECT public.attach_updated_at_trigger('public.shopping_list_items');
SELECT public.attach_updated_at_trigger('public.receipt_ocr_jobs');
SELECT public.attach_updated_at_trigger('public.receipt_ocr_items');
SELECT public.attach_updated_at_trigger('public.glossary_terms');
SELECT public.attach_updated_at_trigger('public.glossary_term_translations');

-- ---------------------------------------------------------------------------
-- Row-level security setup
-- ---------------------------------------------------------------------------
DO $$
DECLARE
	table_name text;
BEGIN
	FOREACH table_name IN ARRAY ARRAY[
		'profiles', 'user_preferences', 'user_skill_assessments', 'consents', 'data_export_jobs', 'deletion_requests',
		'user_diets', 'user_allergies',
		'user_groups', 'group_memberships', 'group_invitations', 'follows',
		'recipes', 'recipe_translations', 'recipe_ingredients', 'recipe_steps', 'recipe_step_translations',
		'recipe_allergens', 'recipe_diet_compatibility', 'recipe_tag_links', 'recipe_media', 'recipe_group_shares',
		'reels', 'reel_likes', 'reel_comments', 'social_feed_impressions',
		'campaigns', 'campaign_nodes', 'campaign_node_translations', 'campaign_edges', 'cutscenes',
		'campaign_tasks', 'campaign_task_translations', 'campaign_task_recipes', 'user_campaign_progress', 'user_node_decisions',
		'challenges', 'personal_challenges', 'community_challenge_submissions', 'challenge_pair_votes', 'challenge_results',
		'cooking_sessions', 'cooking_session_step_progress', 'cooking_session_notes', 'cooking_session_media', 'user_region_progress',
		'level_config', 'xp_events', 'badges', 'user_badges', 'streaks', 'crowns',
		'meal_plans', 'meal_plan_items', 'pantry_items', 'shopping_lists', 'shopping_list_items', 'receipt_ocr_jobs', 'receipt_ocr_items',
		'ai_interactions', 'ai_generated_assets', 'image_moderation_logs', 'audit_events',
		'glossary_terms', 'glossary_term_translations',
		'continents', 'countries', 'allergens', 'diet_types', 'recipe_categories', 'recipe_tags', 'ingredients'
	] LOOP
		EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
	END LOOP;
END
$$;

-- Public read dictionary tables.
DROP POLICY IF EXISTS continents_read_all ON public.continents;
CREATE POLICY continents_read_all ON public.continents
	FOR SELECT USING (true);

DROP POLICY IF EXISTS countries_read_all ON public.countries;
CREATE POLICY countries_read_all ON public.countries
	FOR SELECT USING (true);

DROP POLICY IF EXISTS allergens_read_all ON public.allergens;
CREATE POLICY allergens_read_all ON public.allergens
	FOR SELECT USING (true);

DROP POLICY IF EXISTS diet_types_read_all ON public.diet_types;
CREATE POLICY diet_types_read_all ON public.diet_types
	FOR SELECT USING (true);

DROP POLICY IF EXISTS recipe_categories_read_all ON public.recipe_categories;
CREATE POLICY recipe_categories_read_all ON public.recipe_categories
	FOR SELECT USING (true);

DROP POLICY IF EXISTS recipe_tags_read_all ON public.recipe_tags;
CREATE POLICY recipe_tags_read_all ON public.recipe_tags
	FOR SELECT USING (true);

DROP POLICY IF EXISTS ingredients_read_all ON public.ingredients;
CREATE POLICY ingredients_read_all ON public.ingredients
	FOR SELECT USING (true);

-- Profile and user-owned resources.
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_all ON public.profiles
	FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self ON public.profiles
	FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles
	FOR UPDATE USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_delete_self ON public.profiles;
CREATE POLICY profiles_delete_self ON public.profiles
	FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_preferences_owner_all ON public.user_preferences;
CREATE POLICY user_preferences_owner_all ON public.user_preferences
	FOR ALL USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_skill_assessments_owner_select ON public.user_skill_assessments;
CREATE POLICY user_skill_assessments_owner_select ON public.user_skill_assessments
	FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS consents_owner_all ON public.consents;
CREATE POLICY consents_owner_all ON public.consents
	FOR ALL USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS data_export_jobs_owner_all ON public.data_export_jobs;
CREATE POLICY data_export_jobs_owner_all ON public.data_export_jobs
	FOR ALL USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS deletion_requests_owner_all ON public.deletion_requests;
CREATE POLICY deletion_requests_owner_all ON public.deletion_requests
	FOR ALL USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_diets_owner_all ON public.user_diets;
CREATE POLICY user_diets_owner_all ON public.user_diets
	FOR ALL USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_allergies_owner_all ON public.user_allergies;
CREATE POLICY user_allergies_owner_all ON public.user_allergies
	FOR ALL USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

-- Groups.
DROP POLICY IF EXISTS user_groups_select_member ON public.user_groups;
CREATE POLICY user_groups_select_member ON public.user_groups
	FOR SELECT
	USING (
		auth.uid() = owner_user_id
		OR public.is_group_member(id, auth.uid())
	);

DROP POLICY IF EXISTS user_groups_insert_owner ON public.user_groups;
CREATE POLICY user_groups_insert_owner ON public.user_groups
	FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS user_groups_update_owner ON public.user_groups;
CREATE POLICY user_groups_update_owner ON public.user_groups
	FOR UPDATE USING (auth.uid() = owner_user_id)
	WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS group_memberships_member_read ON public.group_memberships;
CREATE POLICY group_memberships_member_read ON public.group_memberships
	FOR SELECT
	USING (
		auth.uid() = user_id
		OR public.is_group_member(group_id, auth.uid())
	);

DROP POLICY IF EXISTS group_memberships_member_manage ON public.group_memberships;
CREATE POLICY group_memberships_member_manage ON public.group_memberships
	FOR ALL
	USING (auth.uid() = user_id OR EXISTS (
		SELECT 1 FROM public.user_groups ug WHERE ug.id = group_id AND ug.owner_user_id = auth.uid()
	))
	WITH CHECK (auth.uid() = user_id OR EXISTS (
		SELECT 1 FROM public.user_groups ug WHERE ug.id = group_id AND ug.owner_user_id = auth.uid()
	));

DROP POLICY IF EXISTS group_invitations_member_read ON public.group_invitations;
CREATE POLICY group_invitations_member_read ON public.group_invitations
	FOR SELECT
	USING (
		auth.uid() = inviter_user_id
		OR auth.uid() = invitee_user_id
		OR public.is_group_member(group_id, auth.uid())
	);

DROP POLICY IF EXISTS follows_owner_all ON public.follows;
CREATE POLICY follows_owner_all ON public.follows
	FOR ALL USING (auth.uid() = follower_user_id)
	WITH CHECK (auth.uid() = follower_user_id);

-- Recipes and related entities.
DROP POLICY IF EXISTS recipes_select_policy ON public.recipes;
CREATE POLICY recipes_select_policy ON public.recipes
	FOR SELECT
	USING (public.can_read_recipe(id, auth.uid()));

DROP POLICY IF EXISTS recipes_insert_policy ON public.recipes;
CREATE POLICY recipes_insert_policy ON public.recipes
	FOR INSERT
	WITH CHECK (owner_user_id = auth.uid() OR owner_user_id IS NULL);

DROP POLICY IF EXISTS recipes_update_policy ON public.recipes;
CREATE POLICY recipes_update_policy ON public.recipes
	FOR UPDATE
	USING (owner_user_id = auth.uid())
	WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS recipes_delete_policy ON public.recipes;
CREATE POLICY recipes_delete_policy ON public.recipes
	FOR DELETE
	USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS recipe_translations_select_policy ON public.recipe_translations;
CREATE POLICY recipe_translations_select_policy ON public.recipe_translations
	FOR SELECT
	USING (public.can_read_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_translations_write_policy ON public.recipe_translations;
CREATE POLICY recipe_translations_write_policy ON public.recipe_translations
	FOR ALL
	USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_ingredients_select_policy ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_select_policy ON public.recipe_ingredients
	FOR SELECT
	USING (public.can_read_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_ingredients_write_policy ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_write_policy ON public.recipe_ingredients
	FOR ALL
	USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_steps_select_policy ON public.recipe_steps;
CREATE POLICY recipe_steps_select_policy ON public.recipe_steps
	FOR SELECT
	USING (public.can_read_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_steps_write_policy ON public.recipe_steps;
CREATE POLICY recipe_steps_write_policy ON public.recipe_steps
	FOR ALL
	USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_step_translations_select_policy ON public.recipe_step_translations;
CREATE POLICY recipe_step_translations_select_policy ON public.recipe_step_translations
	FOR SELECT
	USING (
		EXISTS (
			SELECT 1 FROM public.recipe_steps rs
			WHERE rs.id = step_id
				AND public.can_read_recipe(rs.recipe_id, auth.uid())
		)
	);

DROP POLICY IF EXISTS recipe_step_translations_write_policy ON public.recipe_step_translations;
CREATE POLICY recipe_step_translations_write_policy ON public.recipe_step_translations
	FOR ALL
	USING (
		EXISTS (
			SELECT 1 FROM public.recipe_steps rs
			WHERE rs.id = step_id
				AND public.can_write_recipe(rs.recipe_id, auth.uid())
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.recipe_steps rs
			WHERE rs.id = step_id
				AND public.can_write_recipe(rs.recipe_id, auth.uid())
		)
	);

DROP POLICY IF EXISTS recipe_media_select_policy ON public.recipe_media;
CREATE POLICY recipe_media_select_policy ON public.recipe_media
	FOR SELECT USING (public.can_read_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_media_write_policy ON public.recipe_media;
CREATE POLICY recipe_media_write_policy ON public.recipe_media
	FOR ALL USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_group_shares_owner_policy ON public.recipe_group_shares;
CREATE POLICY recipe_group_shares_owner_policy ON public.recipe_group_shares
	FOR ALL USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_link_tables_select_allergens ON public.recipe_allergens;
CREATE POLICY recipe_link_tables_select_allergens ON public.recipe_allergens
	FOR SELECT USING (public.can_read_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_link_tables_write_allergens ON public.recipe_allergens;
CREATE POLICY recipe_link_tables_write_allergens ON public.recipe_allergens
	FOR ALL USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_link_tables_select_diets ON public.recipe_diet_compatibility;
CREATE POLICY recipe_link_tables_select_diets ON public.recipe_diet_compatibility
	FOR SELECT USING (public.can_read_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_link_tables_write_diets ON public.recipe_diet_compatibility;
CREATE POLICY recipe_link_tables_write_diets ON public.recipe_diet_compatibility
	FOR ALL USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_link_tables_select_tags ON public.recipe_tag_links;
CREATE POLICY recipe_link_tables_select_tags ON public.recipe_tag_links
	FOR SELECT USING (public.can_read_recipe(recipe_id, auth.uid()));

DROP POLICY IF EXISTS recipe_link_tables_write_tags ON public.recipe_tag_links;
CREATE POLICY recipe_link_tables_write_tags ON public.recipe_tag_links
	FOR ALL USING (public.can_write_recipe(recipe_id, auth.uid()))
	WITH CHECK (public.can_write_recipe(recipe_id, auth.uid()));

-- Reels/social resources.
DROP POLICY IF EXISTS reels_select_policy ON public.reels;
CREATE POLICY reels_select_policy ON public.reels
	FOR SELECT
	USING (
		visibility = 'public'
		OR user_id = auth.uid()
		OR (visibility = 'group' AND EXISTS (
			SELECT 1
			FROM public.group_memberships gm
			JOIN public.recipe_group_shares rgs ON rgs.group_id = gm.group_id
			WHERE gm.user_id = auth.uid()
				AND gm.is_active = true
		))
	);

DROP POLICY IF EXISTS reels_owner_write ON public.reels;
CREATE POLICY reels_owner_write ON public.reels
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS reel_likes_owner_all ON public.reel_likes;
CREATE POLICY reel_likes_owner_all ON public.reel_likes
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS reel_comments_select_policy ON public.reel_comments;
CREATE POLICY reel_comments_select_policy ON public.reel_comments
	FOR SELECT USING (true);

DROP POLICY IF EXISTS reel_comments_owner_write ON public.reel_comments;
CREATE POLICY reel_comments_owner_write ON public.reel_comments
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS social_feed_impressions_owner ON public.social_feed_impressions;
CREATE POLICY social_feed_impressions_owner ON public.social_feed_impressions
	FOR ALL USING (viewer_user_id = auth.uid())
	WITH CHECK (viewer_user_id = auth.uid());

-- Campaign is public read, user progress is private.
DROP POLICY IF EXISTS campaigns_read_all ON public.campaigns;
CREATE POLICY campaigns_read_all ON public.campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS campaign_nodes_read_all ON public.campaign_nodes;
CREATE POLICY campaign_nodes_read_all ON public.campaign_nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS campaign_node_translations_read_all ON public.campaign_node_translations;
CREATE POLICY campaign_node_translations_read_all ON public.campaign_node_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS campaign_edges_read_all ON public.campaign_edges;
CREATE POLICY campaign_edges_read_all ON public.campaign_edges FOR SELECT USING (true);

DROP POLICY IF EXISTS cutscenes_read_all ON public.cutscenes;
CREATE POLICY cutscenes_read_all ON public.cutscenes FOR SELECT USING (true);

DROP POLICY IF EXISTS campaign_tasks_read_all ON public.campaign_tasks;
CREATE POLICY campaign_tasks_read_all ON public.campaign_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS campaign_task_translations_read_all ON public.campaign_task_translations;
CREATE POLICY campaign_task_translations_read_all ON public.campaign_task_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS campaign_task_recipes_read_all ON public.campaign_task_recipes;
CREATE POLICY campaign_task_recipes_read_all ON public.campaign_task_recipes FOR SELECT USING (true);

DROP POLICY IF EXISTS user_campaign_progress_owner ON public.user_campaign_progress;
CREATE POLICY user_campaign_progress_owner ON public.user_campaign_progress
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_node_decisions_owner ON public.user_node_decisions;
CREATE POLICY user_node_decisions_owner ON public.user_node_decisions
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

-- Challenges.
DROP POLICY IF EXISTS challenges_read_active ON public.challenges;
CREATE POLICY challenges_read_active ON public.challenges
	FOR SELECT USING (status IN ('active', 'voting', 'completed') OR created_by_user_id = auth.uid());

DROP POLICY IF EXISTS challenges_create_owner ON public.challenges;
CREATE POLICY challenges_create_owner ON public.challenges
	FOR INSERT WITH CHECK (created_by_user_id = auth.uid() OR created_by_user_id IS NULL);

DROP POLICY IF EXISTS personal_challenges_owner ON public.personal_challenges;
CREATE POLICY personal_challenges_owner ON public.personal_challenges
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS community_submissions_select_policy ON public.community_challenge_submissions;
CREATE POLICY community_submissions_select_policy ON public.community_challenge_submissions
	FOR SELECT USING (true);

DROP POLICY IF EXISTS community_submissions_owner_write ON public.community_challenge_submissions;
CREATE POLICY community_submissions_owner_write ON public.community_challenge_submissions
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS challenge_pair_votes_owner ON public.challenge_pair_votes;
CREATE POLICY challenge_pair_votes_owner ON public.challenge_pair_votes
	FOR ALL USING (voter_user_id = auth.uid())
	WITH CHECK (voter_user_id = auth.uid());

DROP POLICY IF EXISTS challenge_results_read_all ON public.challenge_results;
CREATE POLICY challenge_results_read_all ON public.challenge_results FOR SELECT USING (true);

-- Cooking and gamification.
DROP POLICY IF EXISTS cooking_sessions_owner ON public.cooking_sessions;
CREATE POLICY cooking_sessions_owner ON public.cooking_sessions
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cooking_step_progress_owner ON public.cooking_session_step_progress;
CREATE POLICY cooking_step_progress_owner ON public.cooking_session_step_progress
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM public.cooking_sessions s
			WHERE s.id = session_id AND s.user_id = auth.uid()
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.cooking_sessions s
			WHERE s.id = session_id AND s.user_id = auth.uid()
		)
	);

DROP POLICY IF EXISTS cooking_notes_owner ON public.cooking_session_notes;
CREATE POLICY cooking_notes_owner ON public.cooking_session_notes
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM public.cooking_sessions s
			WHERE s.id = session_id AND s.user_id = auth.uid()
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.cooking_sessions s
			WHERE s.id = session_id AND s.user_id = auth.uid()
		)
	);

DROP POLICY IF EXISTS cooking_media_owner ON public.cooking_session_media;
CREATE POLICY cooking_media_owner ON public.cooking_session_media
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM public.cooking_sessions s
			WHERE s.id = session_id AND s.user_id = auth.uid()
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.cooking_sessions s
			WHERE s.id = session_id AND s.user_id = auth.uid()
		)
	);

DROP POLICY IF EXISTS user_region_progress_owner ON public.user_region_progress;
CREATE POLICY user_region_progress_owner ON public.user_region_progress
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS level_config_read_all ON public.level_config;
CREATE POLICY level_config_read_all ON public.level_config FOR SELECT USING (true);

DROP POLICY IF EXISTS xp_events_owner ON public.xp_events;
CREATE POLICY xp_events_owner ON public.xp_events
	FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS badges_read_all ON public.badges;
CREATE POLICY badges_read_all ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS user_badges_owner ON public.user_badges;
CREATE POLICY user_badges_owner ON public.user_badges
	FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS streaks_owner ON public.streaks;
CREATE POLICY streaks_owner ON public.streaks
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS crowns_owner ON public.crowns;
CREATE POLICY crowns_owner ON public.crowns
	FOR SELECT USING (user_id = auth.uid());

-- Planner / pantry / shopping / OCR.
DROP POLICY IF EXISTS meal_plans_owner ON public.meal_plans;
CREATE POLICY meal_plans_owner ON public.meal_plans
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS meal_plan_items_owner ON public.meal_plan_items;
CREATE POLICY meal_plan_items_owner ON public.meal_plan_items
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM public.meal_plans mp
			WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.meal_plans mp
			WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
		)
	);

DROP POLICY IF EXISTS pantry_items_owner ON public.pantry_items;
CREATE POLICY pantry_items_owner ON public.pantry_items
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS shopping_lists_owner ON public.shopping_lists;
CREATE POLICY shopping_lists_owner ON public.shopping_lists
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS shopping_list_items_owner ON public.shopping_list_items;
CREATE POLICY shopping_list_items_owner ON public.shopping_list_items
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM public.shopping_lists sl
			WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.shopping_lists sl
			WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()
		)
	);

DROP POLICY IF EXISTS receipt_ocr_jobs_owner ON public.receipt_ocr_jobs;
CREATE POLICY receipt_ocr_jobs_owner ON public.receipt_ocr_jobs
	FOR ALL USING (user_id = auth.uid())
	WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS receipt_ocr_items_owner ON public.receipt_ocr_items;
CREATE POLICY receipt_ocr_items_owner ON public.receipt_ocr_items
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM public.receipt_ocr_jobs j
			WHERE j.id = ocr_job_id AND j.user_id = auth.uid()
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.receipt_ocr_jobs j
			WHERE j.id = ocr_job_id AND j.user_id = auth.uid()
		)
	);

-- AI and audit.
DROP POLICY IF EXISTS ai_interactions_owner ON public.ai_interactions;
CREATE POLICY ai_interactions_owner ON public.ai_interactions
	FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS ai_generated_assets_owner ON public.ai_generated_assets;
CREATE POLICY ai_generated_assets_owner ON public.ai_generated_assets
	FOR SELECT USING (
		EXISTS (
			SELECT 1 FROM public.ai_interactions i
			WHERE i.id = ai_interaction_id AND i.user_id = auth.uid()
		)
	);

DROP POLICY IF EXISTS image_moderation_logs_owner ON public.image_moderation_logs;
CREATE POLICY image_moderation_logs_owner ON public.image_moderation_logs
	FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS audit_events_owner ON public.audit_events;
CREATE POLICY audit_events_owner ON public.audit_events
	FOR SELECT USING (actor_user_id = auth.uid());

-- Glossary is public read.
DROP POLICY IF EXISTS glossary_terms_read_all ON public.glossary_terms;
CREATE POLICY glossary_terms_read_all ON public.glossary_terms
	FOR SELECT USING (true);

DROP POLICY IF EXISTS glossary_term_translations_read_all ON public.glossary_term_translations;
CREATE POLICY glossary_term_translations_read_all ON public.glossary_term_translations
	FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- Supabase role grants and stricter RLS defaults
-- ---------------------------------------------------------------------------
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
		GRANT USAGE ON SCHEMA public TO anon;
	END IF;

	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
		GRANT USAGE ON SCHEMA public TO authenticated;
	END IF;
END
$$;

DO $$
DECLARE
	table_name text;
BEGIN
	FOREACH table_name IN ARRAY ARRAY[
		'profiles', 'continents', 'countries', 'allergens', 'diet_types', 'recipe_categories', 'recipe_tags',
		'ingredients', 'recipes', 'recipe_translations', 'recipe_ingredients', 'recipe_steps', 'recipe_step_translations',
		'recipe_allergens', 'recipe_diet_compatibility', 'recipe_tag_links', 'recipe_media',
		'campaigns', 'campaign_nodes', 'campaign_node_translations', 'campaign_edges', 'cutscenes',
		'campaign_tasks', 'campaign_task_translations', 'campaign_task_recipes',
		'challenges', 'community_challenge_submissions', 'challenge_results',
		'badges', 'level_config', 'glossary_terms', 'glossary_term_translations',
		'reels', 'reel_comments'
	] LOOP
		IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
			EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon', table_name);
		END IF;

		IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
			EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated', table_name);
		END IF;
	END LOOP;
END
$$;

DO $$
DECLARE
	table_name text;
BEGIN
	FOREACH table_name IN ARRAY ARRAY[
		'profiles', 'user_preferences', 'user_skill_assessments', 'consents', 'data_export_jobs', 'deletion_requests',
		'user_diets', 'user_allergies',
		'user_groups', 'group_memberships', 'group_invitations', 'follows',
		'recipes', 'recipe_translations', 'recipe_ingredients', 'recipe_steps', 'recipe_step_translations',
		'recipe_allergens', 'recipe_diet_compatibility', 'recipe_tag_links', 'recipe_media', 'recipe_group_shares',
		'reels', 'reel_likes', 'reel_comments', 'social_feed_impressions',
		'campaigns', 'campaign_nodes', 'campaign_node_translations', 'campaign_edges', 'cutscenes',
		'campaign_tasks', 'campaign_task_translations', 'campaign_task_recipes', 'user_campaign_progress', 'user_node_decisions',
		'challenges', 'personal_challenges', 'community_challenge_submissions', 'challenge_pair_votes', 'challenge_results',
		'cooking_sessions', 'cooking_session_step_progress', 'cooking_session_notes', 'cooking_session_media', 'user_region_progress',
		'level_config', 'xp_events', 'badges', 'user_badges', 'streaks', 'crowns',
		'meal_plans', 'meal_plan_items', 'pantry_items', 'shopping_lists', 'shopping_list_items', 'receipt_ocr_jobs', 'receipt_ocr_items',
		'ai_interactions', 'ai_generated_assets', 'image_moderation_logs', 'audit_events',
		'glossary_terms', 'glossary_term_translations',
		'continents', 'countries', 'allergens', 'diet_types', 'recipe_categories', 'recipe_tags', 'ingredients'
	] LOOP
		EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
	END LOOP;
END
$$;

COMMIT;
