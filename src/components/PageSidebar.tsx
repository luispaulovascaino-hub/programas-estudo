import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StudyPage } from '../types';

type Props = {
  pages: StudyPage[];
  activePageId: string;
  onSelect: (pageId: string) => void;
  onAdd: () => void;
  onDuplicate: (pageId: string) => void;
  onDelete: (pageId: string) => void;
  onReorder: (from: number, to: number) => void;
};

const SortableThumb = ({
  page,
  active,
  onSelect,
  onDuplicate,
  onDelete
}: {
  page: StudyPage;
  active: boolean;
  onSelect: (pageId: string) => void;
  onDuplicate: (pageId: string) => void;
  onDelete: (pageId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`thumb ${active ? 'active' : ''}`}>
      <button type="button" className="thumb-select" onClick={() => onSelect(page.id)}>
        <div className="thumb-preview" style={{ aspectRatio: `${page.size.width} / ${page.size.height}` }} />
        <div className="thumb-title">{page.title}</div>
      </button>
      <div className="thumb-actions">
        <button type="button" onClick={() => onDuplicate(page.id)}>
          Duplicar
        </button>
        <button type="button" onClick={() => onDelete(page.id)}>
          Excluir
        </button>
      </div>
      <button type="button" className="drag-handle" {...attributes} {...listeners}>
        ↕
      </button>
    </div>
  );
};

export const PageSidebar = ({ pages, activePageId, onSelect, onAdd, onDuplicate, onDelete, onReorder }: Props) => {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Folhas</h2>
        <button type="button" onClick={onAdd}>
          + Nova
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const from = pages.findIndex((page) => page.id === active.id);
          const to = pages.findIndex((page) => page.id === over.id);
          if (from >= 0 && to >= 0) onReorder(from, to);
        }}
      >
        <SortableContext items={pages.map((page) => page.id)} strategy={verticalListSortingStrategy}>
          <div className="thumb-list">
            {pages.map((page) => (
              <SortableThumb
                key={page.id}
                page={page}
                active={page.id === activePageId}
                onSelect={onSelect}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </aside>
  );
};
