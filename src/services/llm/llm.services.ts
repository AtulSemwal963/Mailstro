// src/services/llm/llm.services.ts

import { apiClient } from '../api/client';

import type {
  CreateLLMSettingsRequest,
  LLMSettingsResponse,
  LLMTestResponse,
  UpdateLLMSettingsRequest,
} from './llm.types';


// ============================================================================
// DELETE RESPONSE
// ============================================================================

export interface DeleteLLMSettingsResponse {
  success: boolean;

  configured: boolean;

  settings: null;

  message?: string;
}


// ============================================================================
// LLM SERVICE
// ============================================================================

export const llmService = {
  // ========================================================================
  // GET SETTINGS
  // ========================================================================

  async getSettings(): Promise<LLMSettingsResponse> {
    return apiClient.get<LLMSettingsResponse>(
      '/llm',
    );
  },


  // ========================================================================
  // CREATE SETTINGS
  // ========================================================================

  async createSettings(
    data: CreateLLMSettingsRequest,
  ): Promise<LLMSettingsResponse> {
    return apiClient.post<LLMSettingsResponse>(
      '/llm',
      data,
    );
  },


  // ========================================================================
  // UPDATE SETTINGS
  // ========================================================================

  async updateSettings(
    data: UpdateLLMSettingsRequest,
  ): Promise<LLMSettingsResponse> {
    return apiClient.patch<LLMSettingsResponse>(
      '/llm',
      data,
    );
  },


  // ========================================================================
  // DELETE SETTINGS
  // ========================================================================

  async deleteSettings(): Promise<DeleteLLMSettingsResponse> {
    return apiClient.delete<DeleteLLMSettingsResponse>(
      '/llm',
    );
  },


  // ========================================================================
  // TEST CONNECTION
  // ========================================================================

  async testConnection(): Promise<LLMTestResponse> {
    return apiClient.post<LLMTestResponse>(
      '/llm/test',
    );
  },
};