// src/renderer/store/campaigns/campaigns.store.ts

import { create } from 'zustand';

import type {
  CampaignStatus,
} from '../../../services/campaigns/campaign.types';


// ============================================================================
// TYPES
// ============================================================================

export type CampaignStatusFilter =
  | 'All'
  | CampaignStatus;


export interface CampaignEditorState {
  name: string;

  description: string;

  instructions: string;

  workflowId: string;

  status: CampaignStatus;
}


export interface CampaignsStore {
  // --------------------------------------------------------------------------
  // FILTER STATE
  // --------------------------------------------------------------------------

  searchQuery: string;

  statusFilter: CampaignStatusFilter;

  setSearchQuery: (
    value: string,
  ) => void;

  setStatusFilter: (
    value: CampaignStatusFilter,
  ) => void;


  // --------------------------------------------------------------------------
  // CREATE MODAL
  // --------------------------------------------------------------------------

  isCreateModalOpen: boolean;

  openCreateModal: () => void;

  closeCreateModal: () => void;


  // --------------------------------------------------------------------------
  // CREATE FORM
  // --------------------------------------------------------------------------

  editor: CampaignEditorState;

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
  // RESET
  // --------------------------------------------------------------------------

  resetEditor: () => void;

  reset: () => void;
}


// ============================================================================
// INITIAL EDITOR STATE
// ============================================================================

const initialEditorState: CampaignEditorState = {
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

export const useCampaignsStore =
  create<CampaignsStore>(
    (set) => ({

      // ======================================================================
      // FILTERS
      // ======================================================================

      searchQuery:
        '',

      statusFilter:
        'All',

      setSearchQuery:
        (value) =>
          set({
            searchQuery:
              value,
          }),

      setStatusFilter:
        (value) =>
          set({
            statusFilter:
              value,
          }),


      // ======================================================================
      // CREATE MODAL
      // ======================================================================

      isCreateModalOpen:
        false,

      openCreateModal:
        () =>
          set({
            isCreateModalOpen:
              true,
          }),

      closeCreateModal:
        () =>
          set({
            isCreateModalOpen:
              false,
          }),


      // ======================================================================
      // EDITOR
      // ======================================================================

      editor: {
        ...initialEditorState,
      },


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
      // RESET
      // ======================================================================

      resetEditor:
        () =>
          set({
            editor: {
              ...initialEditorState,
            },
          }),


      reset:
        () =>
          set({
            searchQuery:
              '',

            statusFilter:
              'All',

            isCreateModalOpen:
              false,

            editor: {
              ...initialEditorState,
            },
          }),
    }),
  );

export default useCampaignsStore;