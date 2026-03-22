import type { BaseEditor, Descendant, Element, Text } from 'slate';
import type { HistoryEditor } from 'slate-history';
import type { ReactEditor } from 'slate-react';

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
};

export type ParagraphElement = {
  type: 'paragraph';
  align?: 'left' | 'center' | 'right';
  children: CustomText[];
};

export type BulletedListElement = {
  type: 'bulleted-list';
  align?: 'left' | 'center' | 'right';
  children: ListItemElement[];
};

export type ListItemElement = {
  type: 'list-item';
  children: CustomText[];
};

export type CustomElement = ParagraphElement | BulletedListElement | ListItemElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export const initialTextValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Digite aqui seu resumo...' }]
  }
];

export const isBlockActive = (element: Element, blockType: CustomElement['type']) =>
  element.type === blockType;

export const isMarkActive = (leaf: Text, mark: 'bold' | 'italic') =>
  Boolean(leaf[mark]);
