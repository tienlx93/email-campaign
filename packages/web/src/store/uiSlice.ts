import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from './index';

const UI_KEY = 'ui_state';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

function loadUi(): UiState {
  try {
    const raw = localStorage.getItem(UI_KEY);
    return raw ? (JSON.parse(raw) as UiState) : { sidebarOpen: true, theme: 'light' };
  } catch {
    return { sidebarOpen: true, theme: 'light' };
  }
}

function saveUi(state: UiState) {
  localStorage.setItem(UI_KEY, JSON.stringify(state));
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: loadUi(),
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
      saveUi({ sidebarOpen: state.sidebarOpen, theme: state.theme });
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      saveUi({ sidebarOpen: state.sidebarOpen, theme: state.theme });
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
  },
});

export const { toggleSidebar, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
