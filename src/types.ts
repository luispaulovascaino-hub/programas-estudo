import type { Descendant } from 'slate';

export type PagePreset = 'A4_PORTRAIT' | 'A4_LANDSCAPE' | 'SLIDE' | 'CUSTOM';

export type PageSize = {
  width: number;
  height: number;
  preset: PagePreset;
};

export type TextBox = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  content: Descendant[];
};

export type ImageBox = {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  alt: string;
};

export type TableCell = {
  content: Descendant[];
};

export type TableBox = {
  id: string;
  type: 'table';
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  columns: number;
  cells: TableCell[][];
};

export type Box = TextBox | ImageBox | TableBox;

export type StudyPage = {
  id: string;
  title: string;
  size: PageSize;
  boxes: Box[];
};

export type SelectionState = {
  pageId: string;
  boxId: string;
  mode: 'selected' | 'editing';
};
