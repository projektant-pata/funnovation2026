type Nullable<T> = T | null

export type TimerStateContext = {
  total_seconds: Nullable<number>
  remaining_seconds: Nullable<number>
  is_running: boolean
  is_finished: boolean
}

export type RecipeContext = {
  id: Nullable<string>
  title: Nullable<string>
  ingredients: string[]
}

export type CurrentStepContext = {
  step_number: Nullable<number>
  title: Nullable<string>
  instruction: Nullable<string>
  suggested_seconds: Nullable<number>
}

export type CookingAssistantContext = {
  cooking_session_id: Nullable<string>
  source_context: Nullable<string>
  session_status: Nullable<string>
  recipe: Nullable<RecipeContext>
  current_step: Nullable<CurrentStepContext>
  timer_state: Nullable<TimerStateContext>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function sanitizeText(value: unknown, maxLength = 240): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

function sanitizePositiveInt(value: unknown, maxValue = 86400): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const rounded = Math.max(0, Math.min(maxValue, Math.round(value)))
  return rounded
}

function sanitizeIngredients(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => sanitizeText(item, 120))
    .filter((item): item is string => item !== null)
    .slice(0, 40)
}

function sanitizeRecipe(value: unknown): RecipeContext | null {
  const record = asRecord(value)
  if (!record) return null

  const recipe: RecipeContext = {
    id: sanitizeText(record.id, 80),
    title: sanitizeText(record.title, 180),
    ingredients: sanitizeIngredients(record.ingredients),
  }

  if (!recipe.id && !recipe.title && recipe.ingredients.length === 0) {
    return null
  }

  return recipe
}

function sanitizeCurrentStep(value: unknown): CurrentStepContext | null {
  const record = asRecord(value)
  if (!record) return null

  const currentStep: CurrentStepContext = {
    step_number: sanitizePositiveInt(record.step_number, 500),
    title: sanitizeText(record.title, 180),
    instruction: sanitizeText(record.instruction, 1200),
    suggested_seconds: sanitizePositiveInt(record.suggested_seconds, 86400),
  }

  if (
    currentStep.step_number === null &&
    !currentStep.title &&
    !currentStep.instruction &&
    currentStep.suggested_seconds === null
  ) {
    return null
  }

  return currentStep
}

function sanitizeTimerState(value: unknown): TimerStateContext | null {
  const record = asRecord(value)
  if (!record) return null

  const timerState: TimerStateContext = {
    total_seconds: sanitizePositiveInt(record.total_seconds, 86400),
    remaining_seconds: sanitizePositiveInt(record.remaining_seconds, 86400),
    is_running: record.is_running === true,
    is_finished: record.is_finished === true,
  }

  if (
    timerState.total_seconds === null &&
    timerState.remaining_seconds === null &&
    !timerState.is_running &&
    !timerState.is_finished
  ) {
    return null
  }

  return timerState
}

export function sanitizeCookingContext(value: unknown): CookingAssistantContext | null {
  const record = asRecord(value)
  if (!record) return null

  const context: CookingAssistantContext = {
    cooking_session_id: sanitizeText(record.cooking_session_id, 80),
    source_context: sanitizeText(record.source_context, 80),
    session_status: sanitizeText(record.session_status, 80),
    recipe: sanitizeRecipe(record.recipe),
    current_step: sanitizeCurrentStep(record.current_step),
    timer_state: sanitizeTimerState(record.timer_state),
  }

  if (
    !context.cooking_session_id &&
    !context.source_context &&
    !context.session_status &&
    !context.recipe &&
    !context.current_step &&
    !context.timer_state
  ) {
    return null
  }

  return context
}

export function mergeCookingContexts(
  base: CookingAssistantContext | null,
  override: CookingAssistantContext | null
): CookingAssistantContext | null {
  if (!base && !override) return null
  if (!base) return override
  if (!override) return base

  return {
    cooking_session_id: override.cooking_session_id ?? base.cooking_session_id,
    source_context: override.source_context ?? base.source_context,
    session_status: override.session_status ?? base.session_status,
    recipe: override.recipe ?? base.recipe,
    current_step: override.current_step ?? base.current_step,
    timer_state: override.timer_state ?? base.timer_state,
  }
}
