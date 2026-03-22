import { useMemo, useReducer } from 'react';
import { studyReducer, initialState } from '../state/studyReducer';

export const PAGE_PRESETS = {
  A4_PORTRAIT: { label: 'A4 Retrato', width: 794, height: 1123 },
  A4_LANDSCAPE: { label: 'A4 Paisagem', width: 1123, height: 794 },
  SLIDE: { label: 'Slide 16:9', width: 1280, height: 720 }
} as const;

export const useStudyBuilder = () => {
  const [state, dispatch] = useReducer(studyReducer, initialState);

  const activePage = useMemo(
    () => state.pages.find((page) => page.id === state.activePageId) ?? state.pages[0],
    [state.activePageId, state.pages]
  );

  return {
    state,
    dispatch,
    activePage
  };
};
