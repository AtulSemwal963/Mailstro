// src/services/llm/llm.types.ts

// ============================================================================
// LLM SETTINGS
// ============================================================================

export interface LLMSettings {
  id: string;

  model: string;

  base_url: string | null;

  has_api_key: boolean;

  created_at: string;

  updated_at: string;
}


// ============================================================================
// GET LLM SETTINGS
// ============================================================================

export interface LLMSettingsResponse {
  success: boolean;

  configured: boolean;

  settings: LLMSettings | null;
}


// ============================================================================
// CREATE LLM SETTINGS
// ============================================================================

export interface CreateLLMSettingsRequest {
  model: string;

  api_key: string;

  base_url?: string | null;
}


// ============================================================================
// UPDATE LLM SETTINGS
// ============================================================================

export interface UpdateLLMSettingsRequest {
  model?: string;

  api_key?: string;

  base_url?: string | null;
}


// ============================================================================
// LLM TEST CONNECTION
// ============================================================================

export interface LLMTestResult {
  connected: boolean;

  model: string;

  response: string;

  usage: unknown;
}


export interface LLMTestResponse {
  success: boolean;

  result?: LLMTestResult;
}