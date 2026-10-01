// src/renderer/store/llm/llm.store.ts

import { create } from 'zustand';

// ============================================================================
// SERVER -> FORM INITIALIZATION DATA
// ============================================================================

export interface InitializeLLMFormData {
  model: string;
  apiKeyMasked: string;
  baseUrl: string;
}

// ============================================================================
// LLM FORM STATE
// ============================================================================

export interface LLMFormState {
  // --------------------------------------------------------------------------
  // FORM VALUES
  // --------------------------------------------------------------------------

  modelName: string;

  /*
   * Plaintext API key entered by the user as a replacement.
   *
   * This is NEVER populated from the backend.
   *
   * Empty string means:
   *   - user has not entered a replacement key, OR
   *   - there is no configured key.
   */
  apiKey: string;

  /*
   * Display-only representation of an already configured API key.
   *
   * Example:
   *
   *   ••••••••••••••••
   *
   * The real secret is never stored here.
   */
  apiKeyMasked: string;

  baseUrl: string;


  // --------------------------------------------------------------------------
  // FORM SETTERS
  // --------------------------------------------------------------------------

  setModelName: (
    value: string,
  ) => void;

  setApiKey: (
    value: string,
  ) => void;

  setBaseUrl: (
    value: string,
  ) => void;


  // --------------------------------------------------------------------------
  // SERVER INITIALIZATION
  // --------------------------------------------------------------------------

  initializeFromServer: (
    data: InitializeLLMFormData,
  ) => void;


  // --------------------------------------------------------------------------
  // CLEAR
  // --------------------------------------------------------------------------

  clear: () => void;
}


// ============================================================================
// STORE
// ============================================================================

export const useLLMSettingsStore =
  create<LLMFormState>(
    (set) => ({
      // ======================================================================
      // INITIAL STATE
      // ======================================================================

      modelName:
        '',

      apiKey:
        '',

      apiKeyMasked:
        '',

      baseUrl:
        '',


      // ======================================================================
      // SETTERS
      // ======================================================================

      setModelName:
        (value) =>
          set({
            modelName:
              value,
          }),

      setApiKey:
        (value) =>
          set({
            apiKey:
              value,
          }),

      setBaseUrl:
        (value) =>
          set({
            baseUrl:
              value,
          }),


      // ======================================================================
      // INITIALIZE FROM SERVER
      // ======================================================================

      initializeFromServer:
        ({
          model,
          apiKeyMasked,
          baseUrl,
        }) =>
          set({
            /*
             * Server-owned values.
             */
            modelName:
              model,

            apiKeyMasked:
              apiKeyMasked,

            baseUrl:
              baseUrl,

            /*
             * CRITICAL:
             *
             * Do NOT reset apiKey here.
             *
             * apiKey is user-entered transient state. Keeping it intact
             * prevents a server/query refresh from destroying a key the
             * user is currently typing.
             */
          }),


      // ======================================================================
      // CLEAR
      // ======================================================================

      clear:
        () =>
          set({
            modelName:
              '',

            apiKey:
              '',

            apiKeyMasked:
              '',

            baseUrl:
              '',
          }),
    }),
  );

export default useLLMSettingsStore;