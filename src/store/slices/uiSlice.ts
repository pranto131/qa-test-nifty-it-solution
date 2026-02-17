import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Preview data type (matching KnowledgeBaseUpload component)
export interface PreviewData {
  preview: string;
  estimatedChunks: number;
  size: number;
}

export interface ClickUpDestination {
  workspace_id: string;
  space_id: string;
  folder_id?: string | null;
  list_id: string;
}

interface UIState {
  // File upload analysis
  uploadedFile: {
    name: string;
    size: number;
    type: string;
  } | null;
  analyzing: boolean;
  currentMeetingId: string | null;
  hasShownCompletionAlert: boolean;
  
  // Three-step workflow state
  selectedFile: {
    id: string;
    name: string;
    size: number;
    type: string;
  } | null;
  selectedProject: {
    name: string | null;
    mode: 'ai' | 'manual';
  } | null;
  selectedDestination: ClickUpDestination | null;

  // Knowledge base upload
  knowledgeBaseFile: {
    name: string;
    size: number;
    type: string;
  } | null;
  knowledgeBasePreview: PreviewData | null;
  knowledgeBaseProject: string;
  uploading: boolean;
}

const initialState: UIState = {
  // File upload analysis
  uploadedFile: null,
  analyzing: false,
  currentMeetingId: null,
  hasShownCompletionAlert: false,
  
  // Three-step workflow state
  selectedFile: null,
  selectedProject: null,
  selectedDestination: null,

  // Knowledge base upload
  knowledgeBaseFile: null,
  knowledgeBasePreview: null,
  knowledgeBaseProject: '',
  uploading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // File upload analysis actions
    setUploadedFile: (
      state,
      action: PayloadAction<{ name: string; size: number; type: string } | null>
    ) => {
      state.uploadedFile = action.payload;
    },
    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.analyzing = action.payload;
    },
    setCurrentMeetingId: (state, action: PayloadAction<string | null>) => {
      state.currentMeetingId = action.payload;
    },
    setHasShownCompletionAlert: (state, action: PayloadAction<boolean>) => {
      state.hasShownCompletionAlert = action.payload;
    },
    clearAnalysisState: (state) => {
      state.uploadedFile = null;
      state.analyzing = false;
      state.currentMeetingId = null;
      state.hasShownCompletionAlert = false;
    },
    
    // Three-step workflow actions
    setSelectedFile: (
      state,
      action: PayloadAction<{ id: string; name: string; size: number; type: string } | null>
    ) => {
      state.selectedFile = action.payload;
    },
    setSelectedProject: (
      state,
      action: PayloadAction<{ name: string | null; mode: 'ai' | 'manual' } | null>
    ) => {
      state.selectedProject = action.payload;
    },
    setSelectedDestination: (state, action: PayloadAction<ClickUpDestination | null>) => {
      state.selectedDestination = action.payload;
    },
    clearWorkflowState: (state) => {
      state.selectedFile = null;
      state.selectedProject = null;
      state.selectedDestination = null;
    },

    // Knowledge base upload actions
    setKnowledgeBaseFile: (
      state,
      action: PayloadAction<{ name: string; size: number; type: string } | null>
    ) => {
      state.knowledgeBaseFile = action.payload;
    },
    setKnowledgeBasePreview: (state, action: PayloadAction<PreviewData | null>) => {
      state.knowledgeBasePreview = action.payload;
    },
    setKnowledgeBaseProject: (state, action: PayloadAction<string>) => {
      state.knowledgeBaseProject = action.payload;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    clearKnowledgeBaseState: (state) => {
      state.knowledgeBaseFile = null;
      state.knowledgeBasePreview = null;
      state.knowledgeBaseProject = '';
      state.uploading = false;
    },
  },
});

export const {
  setUploadedFile,
  setAnalyzing,
  setCurrentMeetingId,
  setHasShownCompletionAlert,
  clearAnalysisState,
  setSelectedFile,
  setSelectedProject,
  setSelectedDestination,
  clearWorkflowState,
  setKnowledgeBaseFile,
  setKnowledgeBasePreview,
  setKnowledgeBaseProject,
  setUploading,
  clearKnowledgeBaseState,
} = uiSlice.actions;

export default uiSlice.reducer;
