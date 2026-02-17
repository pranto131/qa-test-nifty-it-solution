import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { baseApi } from './api/baseApi';

// Persist configuration for UI state
const uiPersistConfig = {
  key: 'ui',
  storage,
  // Only persist specific parts of UI state that should survive refresh
  whitelist: [
    'knowledgeBaseFile', 
    'knowledgeBasePreview', 
    'knowledgeBaseProject', 
    'currentMeetingId',
    'analyzing',
    'hasShownCompletionAlert',
  ],
};

// Persist configuration for auth state
const authPersistConfig = {
  key: 'auth',
  storage,
};

// Create persisted reducers
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    ui: persistedUiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

// Create persistor
export const persistor = persistStore(store);

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
