// src/renderer/store/workflows/workflows.store.ts

import { create } from 'zustand';

import type {
  WorkflowStatus,
} from '../../../services/workflows/workflow.types';


// ============================================================================
// EDITOR STATE
// ============================================================================
//
// This is UI/form state only.
//
// The actual persisted workflow remains server state managed by TanStack
// Query. The currently loaded workflow for browser replay is also server
// state and is intentionally NOT duplicated in this Zustand store.
// ============================================================================

interface WorkflowEditorState {
  title: string;

  description: string;

  status: WorkflowStatus;

  tags: string;
}


// ============================================================================
// STORE
// ============================================================================

export interface WorkflowsStore {

  // --------------------------------------------------------------------------
  // FILTER STATE
  // --------------------------------------------------------------------------

  searchQuery: string;

  tagFilter: string;


  setSearchQuery: (
    value: string,
  ) => void;


  setTagFilter: (
    value: string,
  ) => void;


  // --------------------------------------------------------------------------
  // UI SELECTION
  // --------------------------------------------------------------------------
  //
  // This is the workflow currently selected in the desktop UI.
  //
  // IMPORTANT:
  //
  // selectedWorkflowId
  //     = UI selection / editor target
  //
  // loadedWorkflow
  //     = backend runtime selection for browser replay
  //
  // They are intentionally different concepts.
  // --------------------------------------------------------------------------

  selectedWorkflowId: string | null;


  selectWorkflow: (
    workflowId: string | null,
  ) => void;


  // --------------------------------------------------------------------------
  // EDITOR
  // --------------------------------------------------------------------------

  isEditorOpen: boolean;

  editorMode: 'edit' | null;

  editor: WorkflowEditorState;


  openEditEditor: (
    workflow: {
      title: string;
      description: string | null;
      status: WorkflowStatus;
      tags: string[];
    },
  ) => void;


  closeEditor: () => void;


  // --------------------------------------------------------------------------
  // EDITOR FIELD MUTATORS
  // --------------------------------------------------------------------------

  setEditorTitle: (
    value: string,
  ) => void;


  setEditorDescription: (
    value: string,
  ) => void;


  setEditorStatus: (
    value: WorkflowStatus,
  ) => void;


  setEditorTags: (
    value: string,
  ) => void;


  // --------------------------------------------------------------------------
  // RESET
  // --------------------------------------------------------------------------

  reset: () => void;
}


// ============================================================================
// INITIAL EDITOR STATE
// ============================================================================

const initialEditorState: WorkflowEditorState = {
  title:
    '',

  description:
    '',

  status:
    'draft',

  tags:
    '',
};


// ============================================================================
// STORE
// ============================================================================

export const useWorkflowsStore =
  create<WorkflowsStore>(
    (set) => ({

      // ======================================================================
      // FILTERS
      // ======================================================================

      searchQuery:
        '',


      tagFilter:
        'All',


      setSearchQuery:
        (value) =>
          set({
            searchQuery:
              value,
          }),


      setTagFilter:
        (value) =>
          set({
            tagFilter:
              value,
          }),


      // ======================================================================
      // UI SELECTION
      // ======================================================================

      selectedWorkflowId:
        null,


      selectWorkflow:
        (workflowId) =>
          set({
            selectedWorkflowId:
              workflowId,
          }),


      // ======================================================================
      // EDITOR
      // ======================================================================

      isEditorOpen:
        false,


      editorMode:
        null,


      editor: {
        ...initialEditorState,
      },


      openEditEditor:
        (workflow) =>
          set({
            isEditorOpen:
              true,

            editorMode:
              'edit',

            editor: {
              title:
                workflow.title,

              description:
                workflow.description ||
                '',

              status:
                workflow.status,

              tags:
                workflow.tags.join(
                  ', ',
                ),
            },
          }),


      closeEditor:
        () =>
          set({
            isEditorOpen:
              false,

            editorMode:
              null,

            editor: {
              ...initialEditorState,
            },
          }),


      // ======================================================================
      // EDITOR FIELDS
      // ======================================================================

      setEditorTitle:
        (value) =>
          set(
            (state) => ({
              editor: {
                ...state.editor,

                title:
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


      setEditorTags:
        (value) =>
          set(
            (state) => ({
              editor: {
                ...state.editor,

                tags:
                  value,
              },
            }),
          ),


      // ======================================================================
      // RESET
      // ======================================================================

      reset:
        () =>
          set({
            searchQuery:
              '',

            tagFilter:
              'All',

            selectedWorkflowId:
              null,

            isEditorOpen:
              false,

            editorMode:
              null,

            editor: {
              ...initialEditorState,
            },
          }),
    }),
  );


export default useWorkflowsStore;