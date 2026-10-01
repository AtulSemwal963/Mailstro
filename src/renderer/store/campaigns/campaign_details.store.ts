// src/renderer/store/campaigns/campaign_details.store.ts

import { create } from 'zustand';

import type {
  CampaignStatus,
} from '../../../services/campaigns/campaign.types';


// ============================================================================
// EDITOR STATE
// ============================================================================

export interface CampaignDetailEditorState {
  name: string;

  description: string;

  instructions: string;

  workflowId: string;

  status: CampaignStatus;
}


// ============================================================================
// STORE
// ============================================================================

export interface CampaignDetailsStore {
  // --------------------------------------------------------------------------
  // EDITOR MODAL
  // --------------------------------------------------------------------------

  isEditModalOpen: boolean;

  openEditModal: () => void;

  closeEditModal: () => void;


  // --------------------------------------------------------------------------
  // EDITOR
  // --------------------------------------------------------------------------

  editor: CampaignDetailEditorState;


  // --------------------------------------------------------------------------
  // EDITOR MUTATORS
  // --------------------------------------------------------------------------

  setEditorName: (
    value: string,
  ) => void;

  setEditorDescription: (
    value: string,
  ) => void;

  setEditorInstructions: (
    value: string,
  ) => void;

  setEditorWorkflowId: (
    value: string,
  ) => void;

  setEditorStatus: (
    value: CampaignStatus,
  ) => void;


  // --------------------------------------------------------------------------
  // HYDRATION
  // --------------------------------------------------------------------------

  hydrateEditor: (
    campaign: {
      name: string;
      description: string | null;
      instructions: string | null;
      workflow_id: string | null;
      status: CampaignStatus;
    },
  ) => void;


  // --------------------------------------------------------------------------
  // LEAD IMPORT MODAL
  // --------------------------------------------------------------------------

  isImportModalOpen: boolean;

  openImportModal: () => void;

  closeImportModal: () => void;


  // --------------------------------------------------------------------------
  // SELECTED IMPORT FILE
  // --------------------------------------------------------------------------

  selectedImportFile: File | null;

  selectedImportFileName: string;

  setSelectedImportFile: (
    file: File | null,
  ) => void;

  clearSelectedImportFile: () => void;


  // --------------------------------------------------------------------------
  // RESET
  // --------------------------------------------------------------------------

  resetEditor: () => void;

  resetImport: () => void;

  reset: () => void;
}


// ============================================================================
// INITIAL STATE
// ============================================================================

const initialEditorState:
  CampaignDetailEditorState = {
    name:
      '',

    description:
      '',

    instructions:
      '',

    workflowId:
      '',

    status:
      'draft',
  };


// ============================================================================
// STORE
// ============================================================================

export const useCampaignDetailsStore =
  create<CampaignDetailsStore>(
    (set) => ({

      // ======================================================================
      // EDITOR MODAL
      // ======================================================================

      isEditModalOpen:
        false,

      openEditModal:
        () =>
          set({
            isEditModalOpen:
              true,
          }),

      closeEditModal:
        () =>
          set({
            isEditModalOpen:
              false,
          }),


      // ======================================================================
      // EDITOR
      // ======================================================================

      editor: {
        ...initialEditorState,
      },


      // ======================================================================
      // EDITOR MUTATORS
      // ======================================================================

      setEditorName:
        (value) =>
          set(
            (state) => ({
              editor: {
                ...state.editor,

                name:
                  value,
              },
            }),
          ),


      setEditorDescription:
        (value) =>
          set(
            (state) => ({
              editor: {
                ...state.editor,

                description:
                  value,
              },
            }),
          ),


      setEditorInstructions:
        (value) =>
          set(
            (state) => ({
              editor: {
                ...state.editor,

                instructions:
                  value,
              },
            }),
          ),


      setEditorWorkflowId:
        (value) =>
          set(
            (state) => ({
              editor: {
                ...state.editor,

                workflowId:
                  value,
              },
            }),
          ),


      setEditorStatus:
        (value) =>
          set(
            (state) => ({
              editor: {
                ...state.editor,

                status:
                  value,
              },
            }),
          ),


      // ======================================================================
      // HYDRATE EDITOR
      // ======================================================================

      hydrateEditor:
        (campaign) =>
          set({
            editor: {
              name:
                campaign.name,

              description:
                campaign.description ??
                '',

              instructions:
                campaign.instructions ??
                '',

              workflowId:
                campaign.workflow_id ??
                '',

              status:
                campaign.status,
            },
          }),


      // ======================================================================
      // IMPORT MODAL
      // ======================================================================

      isImportModalOpen:
        false,

      openImportModal:
        () =>
          set({
            isImportModalOpen:
              true,
          }),

      closeImportModal:
        () =>
          set({
            isImportModalOpen:
              false,
          }),


      // ======================================================================
      // SELECTED IMPORT FILE
      // ======================================================================

      selectedImportFile:
        null,

      selectedImportFileName:
        '',

      setSelectedImportFile:
        (file) =>
          set({
            selectedImportFile:
              file,

            selectedImportFileName:
              file?.name ??
              '',
          }),

      clearSelectedImportFile:
        () =>
          set({
            selectedImportFile:
              null,

            selectedImportFileName:
              '',
          }),


      // ======================================================================
      // RESET EDITOR
      // ======================================================================

      resetEditor:
        () =>
          set({
            editor: {
              ...initialEditorState,
            },
          }),


      // ======================================================================
      // RESET IMPORT
      // ======================================================================

      resetImport:
        () =>
          set({
            isImportModalOpen:
              false,

            selectedImportFile:
              null,

            selectedImportFileName:
              '',
          }),


      // ======================================================================
      // RESET EVERYTHING
      // ======================================================================

      reset:
        () =>
          set({
            isEditModalOpen:
              false,

            isImportModalOpen:
              false,

            editor: {
              ...initialEditorState,
            },

            selectedImportFile:
              null,

            selectedImportFileName:
              '',
          }),
    }),
  );


export default useCampaignDetailsStore;