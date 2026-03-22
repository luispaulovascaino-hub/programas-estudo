import { useEffect, useMemo } from 'react';
import { createEditor, Editor, Element as SlateElement, Transforms } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { Rnd } from 'react-rnd';
import type { Descendant } from 'slate';
import type { TextBox as TTextBox } from '../types';
import { isBlockActive } from '../utils/editor';

type Props = {
  box: TTextBox;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onChangeContent: (content: Descendant[]) => void;
  onResizeMove: (x: number, y: number, width: number, height: number) => void;
  onEditorReady: (id: string, editor: Editor | null) => void;
};

const Leaf = ({ attributes, children, leaf }: any) => {
  let rendered = children;
  if (leaf.bold) rendered = <strong>{rendered}</strong>;
  if (leaf.italic) rendered = <em>{rendered}</em>;
  if (leaf.color) rendered = <span style={{ color: leaf.color }}>{rendered}</span>;
  if (leaf.fontSize) rendered = <span style={{ fontSize: `${leaf.fontSize}px` }}>{rendered}</span>;
  return <span {...attributes}>{rendered}</span>;
};

const Element = ({ attributes, children, element }: any) => {
  if (element.type === 'bulleted-list') {
    return (
      <ul {...attributes} style={{ textAlign: element.align ?? 'left', margin: 0, paddingLeft: 18 }}>
        {children}
      </ul>
    );
  }
  if (element.type === 'list-item') {
    return <li {...attributes}>{children}</li>;
  }
  return (
    <p {...attributes} style={{ textAlign: element.align ?? 'left', margin: 0, whiteSpace: 'pre-wrap' }}>
      {children}
    </p>
  );
};

export const toggleMark = (editor: Editor, format: 'bold' | 'italic') => {
  const isActive = Editor.marks(editor)?.[format] === true;
  if (isActive) Editor.removeMark(editor, format);
  else Editor.addMark(editor, format, true);
};

export const setColor = (editor: Editor, color: string) => Editor.addMark(editor, 'color', color);
export const setFontSize = (editor: Editor, size: number) => Editor.addMark(editor, 'fontSize', size);

export const setAlign = (editor: Editor, align: 'left' | 'center' | 'right') => {
  Transforms.setNodes(
    editor,
    { align },
    { match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node) }
  );
};

export const toggleBulletedList = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (node) => SlateElement.isElement(node) && isBlockActive(node, 'bulleted-list')
  });

  if (match) {
    Transforms.unwrapNodes(editor, {
      match: (node) => SlateElement.isElement(node) && node.type === 'bulleted-list',
      split: true
    });
    Transforms.setNodes(editor, { type: 'paragraph' });
    return;
  }

  Transforms.setNodes(editor, { type: 'list-item' });
  Transforms.wrapNodes(editor, { type: 'bulleted-list', children: [] });
};

export const TextBox = ({ box, selected, editing, onSelect, onEdit, onChangeContent, onResizeMove, onEditorReady }: Props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    onEditorReady(box.id, editor);
    return () => onEditorReady(box.id, null);
  }, [box.id, editor, onEditorReady]);

  return (
    <Rnd
      className={`box text-box ${selected ? 'selected' : ''}`}
      size={{ width: box.width, height: box.height }}
      position={{ x: box.x, y: box.y }}
      onDragStop={(_, data) => onResizeMove(data.x, data.y, box.width, box.height)}
      onResizeStop={(_, __, ref, ___, position) =>
        onResizeMove(position.x, position.y, Number(ref.style.width.replace('px', '')), Number(ref.style.height.replace('px', '')))
      }
      disableDragging={editing}
      bounds="parent"
      enableResizing={selected}
      onMouseDown={onSelect}
      onDoubleClick={onEdit}
    >
      <Slate editor={editor} initialValue={box.content} onChange={onChangeContent}>
        <Editable
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
          readOnly={!editing}
          className="editor"
          style={{ cursor: editing ? 'text' : 'move', overflowY: 'auto', minHeight: '100%', padding: 8 }}
        />
      </Slate>
    </Rnd>
  );
};
