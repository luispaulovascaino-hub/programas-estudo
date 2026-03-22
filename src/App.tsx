import { useMemo, useRef, useState } from 'react';
import type { Editor } from 'slate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useStudyBuilder } from './hooks/useStudyBuilder';
import { PageSidebar } from './components/PageSidebar';
import { Toolbar } from './components/Toolbar';
import { ImageBox } from './components/ImageBox';
import { TableBox } from './components/TableBox';
import { TextBox, setAlign, setColor, setFontSize, toggleBulletedList, toggleMark } from './components/TextBox';
import type { Box, PagePreset } from './types';

const App = () => {
  const { state, dispatch, activePage } = useStudyBuilder();
  const editorsRef = useRef<Record<string, Editor>>({});
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [customSize, setCustomSize] = useState({ width: activePage.size.width, height: activePage.size.height });

  const selected = state.selection;
  const selectedBox = useMemo(() => {
    if (!selected || selected.pageId !== activePage.id) return null;
    return activePage.boxes.find((box) => box.id === selected.boxId) ?? null;
  }, [activePage.boxes, activePage.id, selected]);

  const activeEditor = selected && selected.mode === 'editing' ? editorsRef.current[selected.boxId] : null;

  const applyToEditor = (fn: (editor: Editor) => void) => {
    if (!activeEditor) return;
    fn(activeEditor);
  };

  const handleImageUpload = async (file: File) => {
    const src = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
    dispatch({ type: 'ADD_IMAGE_BOX', pageId: activePage.id, src, alt: file.name });
  };

  const handleExportPdf = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: activePage.size.width > activePage.size.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [activePage.size.width, activePage.size.height]
    });
    pdf.addImage(imageData, 'PNG', 0, 0, activePage.size.width, activePage.size.height);
    pdf.save(`${activePage.title}.pdf`);
  };

  const setPagePreset = (preset: PagePreset, width: number, height: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', pageId: activePage.id, preset, width, height });
  };

  return (
    <div className="layout">
      <PageSidebar
        pages={state.pages}
        activePageId={state.activePageId}
        onSelect={(pageId) => dispatch({ type: 'SET_ACTIVE_PAGE', pageId })}
        onAdd={() => dispatch({ type: 'ADD_PAGE' })}
        onDuplicate={(pageId) => dispatch({ type: 'DUPLICATE_PAGE', pageId })}
        onDelete={(pageId) => dispatch({ type: 'DELETE_PAGE', pageId })}
        onReorder={(from, to) => dispatch({ type: 'REORDER_PAGES', from, to })}
      />

      <main className="workspace">
        <Toolbar
          selectedMode={selected?.mode ?? null}
          selectedType={selectedBox?.type ?? null}
          onAddText={() => dispatch({ type: 'ADD_TEXT_BOX', pageId: activePage.id })}
          onAddImage={handleImageUpload}
          onAddTable={() => dispatch({ type: 'ADD_TABLE_BOX', pageId: activePage.id, rows: 4, columns: 3 })}
          onFontSize={(size) => applyToEditor((editor) => setFontSize(editor, size))}
          onBold={() => applyToEditor((editor) => toggleMark(editor, 'bold'))}
          onItalic={() => applyToEditor((editor) => toggleMark(editor, 'italic'))}
          onAlign={(align) => applyToEditor((editor) => setAlign(editor, align))}
          onBullets={() => applyToEditor((editor) => toggleBulletedList(editor))}
          onColor={(color) => applyToEditor((editor) => setColor(editor, color))}
          onPresetChange={setPagePreset}
          currentPreset={activePage.size.preset}
          customWidth={customSize.width}
          customHeight={customSize.height}
          onCustomSizeChange={(width, height) => {
            setCustomSize({ width, height });
            setPagePreset('CUSTOM', width, height);
          }}
          onExportPdf={handleExportPdf}
        />

        <section className="canvas-shell" onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}>
          <div
            className="page-canvas"
            ref={exportRef}
            style={{ width: activePage.size.width, height: activePage.size.height }}
            onClick={(event) => event.stopPropagation()}
          >
            {activePage.boxes.map((box) => {
              const isSelected = selected?.boxId === box.id && selected.pageId === activePage.id;
              const isEditing = isSelected && selected?.mode === 'editing';

              const updateBox = (patch: Partial<Box>) =>
                dispatch({
                  type: 'UPDATE_BOX',
                  pageId: activePage.id,
                  boxId: box.id,
                  patch
                });

              if (box.type === 'text') {
                return (
                  <TextBox
                    key={box.id}
                    box={box}
                    selected={Boolean(isSelected)}
                    editing={Boolean(isEditing)}
                    onSelect={() => dispatch({ type: 'SELECT_BOX', pageId: activePage.id, boxId: box.id, mode: 'selected' })}
                    onEdit={() => dispatch({ type: 'SELECT_BOX', pageId: activePage.id, boxId: box.id, mode: 'editing' })}
                    onChangeContent={(content) =>
                      dispatch({ type: 'UPDATE_TEXT_BOX_CONTENT', pageId: activePage.id, boxId: box.id, content })
                    }
                    onResizeMove={(x, y, width, height) => updateBox({ x, y, width, height })}
                    onEditorReady={(id, editor) => {
                      if (editor) editorsRef.current[id] = editor;
                      else delete editorsRef.current[id];
                    }}
                  />
                );
              }

              if (box.type === 'image') {
                return (
                  <ImageBox
                    key={box.id}
                    box={box}
                    selected={Boolean(isSelected)}
                    onSelect={() => dispatch({ type: 'SELECT_BOX', pageId: activePage.id, boxId: box.id, mode: 'selected' })}
                    onResizeMove={(x, y, width, height) => updateBox({ x, y, width, height })}
                  />
                );
              }

              return (
                <TableBox
                  key={box.id}
                  box={box}
                  selected={Boolean(isSelected)}
                  onSelect={() => dispatch({ type: 'SELECT_BOX', pageId: activePage.id, boxId: box.id, mode: 'selected' })}
                  onResizeMove={(x, y, width, height) => updateBox({ x, y, width, height })}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
