import type { Descendant } from 'slate';
import { v4 as uuid } from 'uuid';
import type { Box, PagePreset, SelectionState, StudyPage } from '../types';
import { initialTextValue } from '../utils/editor';

export type StudyState = {
  pages: StudyPage[];
  activePageId: string;
  selection: SelectionState | null;
};

type MoveDirection = 'up' | 'down';

type Action =
  | { type: 'ADD_PAGE' }
  | { type: 'DUPLICATE_PAGE'; pageId: string }
  | { type: 'DELETE_PAGE'; pageId: string }
  | { type: 'REORDER_PAGES'; from: number; to: number }
  | { type: 'SET_ACTIVE_PAGE'; pageId: string }
  | { type: 'SET_PAGE_SIZE'; pageId: string; preset: PagePreset; width: number; height: number }
  | { type: 'ADD_TEXT_BOX'; pageId: string }
  | { type: 'ADD_IMAGE_BOX'; pageId: string; src: string; alt: string }
  | { type: 'ADD_TABLE_BOX'; pageId: string; rows: number; columns: number }
  | { type: 'UPDATE_BOX'; pageId: string; boxId: string; patch: Partial<Box> }
  | { type: 'UPDATE_TEXT_BOX_CONTENT'; pageId: string; boxId: string; content: Descendant[] }
  | { type: 'SELECT_BOX'; pageId: string; boxId: string; mode: 'selected' | 'editing' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'MOVE_SELECTED_BOX'; pageId: string; boxId: string; direction: MoveDirection };

const createPage = (index: number): StudyPage => ({
  id: uuid(),
  title: `Folha ${index + 1}`,
  size: { width: 794, height: 1123, preset: 'A4_PORTRAIT' },
  boxes: []
});

const duplicateBox = (box: Box): Box => {
  if (box.type === 'text') {
    return { ...box, id: uuid(), x: box.x + 20, y: box.y + 20, content: structuredClone(box.content) };
  }
  if (box.type === 'image') {
    return { ...box, id: uuid(), x: box.x + 20, y: box.y + 20 };
  }
  return {
    ...box,
    id: uuid(),
    x: box.x + 20,
    y: box.y + 20,
    cells: structuredClone(box.cells)
  };
};

const duplicatePage = (page: StudyPage, index: number): StudyPage => ({
  ...page,
  id: uuid(),
  title: `${page.title} (cópia ${index + 1})`,
  boxes: page.boxes.map(duplicateBox)
});

export const initialState: StudyState = {
  pages: [createPage(0)],
  activePageId: '',
  selection: null
};

initialState.activePageId = initialState.pages[0].id;

export const studyReducer = (state: StudyState, action: Action): StudyState => {
  switch (action.type) {
    case 'ADD_PAGE': {
      const page = createPage(state.pages.length);
      return { ...state, pages: [...state.pages, page], activePageId: page.id, selection: null };
    }
    case 'DUPLICATE_PAGE': {
      const page = state.pages.find((item) => item.id === action.pageId);
      if (!page) return state;
      const copy = duplicatePage(page, state.pages.filter((p) => p.title.startsWith(page.title)).length);
      return { ...state, pages: [...state.pages, copy], activePageId: copy.id, selection: null };
    }
    case 'DELETE_PAGE': {
      if (state.pages.length === 1) return state;
      const pages = state.pages.filter((page) => page.id !== action.pageId);
      const activePageId = state.activePageId === action.pageId ? pages[0].id : state.activePageId;
      return { ...state, pages, activePageId, selection: null };
    }
    case 'REORDER_PAGES': {
      const pages = [...state.pages];
      const [moved] = pages.splice(action.from, 1);
      pages.splice(action.to, 0, moved);
      return { ...state, pages };
    }
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePageId: action.pageId, selection: null };
    case 'SET_PAGE_SIZE':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === action.pageId
            ? {
                ...page,
                size: { width: action.width, height: action.height, preset: action.preset }
              }
            : page
        )
      };
    case 'ADD_TEXT_BOX':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === action.pageId
            ? {
                ...page,
                boxes: [
                  ...page.boxes,
                  {
                    id: uuid(),
                    type: 'text',
                    x: 40,
                    y: 40,
                    width: 320,
                    height: 160,
                    content: structuredClone(initialTextValue)
                  }
                ]
              }
            : page
        )
      };
    case 'ADD_IMAGE_BOX':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === action.pageId
            ? {
                ...page,
                boxes: [
                  ...page.boxes,
                  {
                    id: uuid(),
                    type: 'image',
                    x: 60,
                    y: 60,
                    width: 280,
                    height: 180,
                    src: action.src,
                    alt: action.alt
                  }
                ]
              }
            : page
        )
      };
    case 'ADD_TABLE_BOX':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === action.pageId
            ? {
                ...page,
                boxes: [
                  ...page.boxes,
                  {
                    id: uuid(),
                    type: 'table',
                    x: 70,
                    y: 70,
                    width: 360,
                    height: 200,
                    rows: action.rows,
                    columns: action.columns,
                    cells: Array.from({ length: action.rows }).map(() =>
                      Array.from({ length: action.columns }).map(() => ({
                        content: structuredClone(initialTextValue)
                      }))
                    )
                  }
                ]
              }
            : page
        )
      };
    case 'UPDATE_BOX':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === action.pageId
            ? {
                ...page,
                boxes: page.boxes.map((box) => (box.id === action.boxId ? ({ ...box, ...action.patch } as Box) : box))
              }
            : page
        )
      };
    case 'UPDATE_TEXT_BOX_CONTENT':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === action.pageId
            ? {
                ...page,
                boxes: page.boxes.map((box) =>
                  box.id === action.boxId && box.type === 'text' ? { ...box, content: action.content } : box
                )
              }
            : page
        )
      };
    case 'SELECT_BOX':
      return { ...state, selection: { pageId: action.pageId, boxId: action.boxId, mode: action.mode } };
    case 'CLEAR_SELECTION':
      return { ...state, selection: null };
    case 'MOVE_SELECTED_BOX':
      return {
        ...state,
        pages: state.pages.map((page) => {
          if (page.id !== action.pageId) return page;
          const index = page.boxes.findIndex((box) => box.id === action.boxId);
          if (index < 0) return page;
          const targetIndex = action.direction === 'up' ? Math.min(page.boxes.length - 1, index + 1) : Math.max(0, index - 1);
          const boxes = [...page.boxes];
          const [target] = boxes.splice(index, 1);
          boxes.splice(targetIndex, 0, target);
          return { ...page, boxes };
        })
      };
    default:
      return state;
  }
};
