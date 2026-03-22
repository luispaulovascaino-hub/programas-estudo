import type { PagePreset } from '../types';
import { PAGE_PRESETS } from '../hooks/useStudyBuilder';

type Props = {
  selectedMode: 'selected' | 'editing' | null;
  selectedType: 'text' | 'image' | 'table' | null;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onAddTable: () => void;
  onFontSize: (size: number) => void;
  onBold: () => void;
  onItalic: () => void;
  onAlign: (align: 'left' | 'center' | 'right') => void;
  onBullets: () => void;
  onColor: (color: string) => void;
  onPresetChange: (preset: PagePreset, width: number, height: number) => void;
  currentPreset: PagePreset;
  customWidth: number;
  customHeight: number;
  onCustomSizeChange: (width: number, height: number) => void;
  onExportPdf: () => void;
};

export const Toolbar = ({
  selectedMode,
  selectedType,
  onAddText,
  onAddImage,
  onAddTable,
  onFontSize,
  onBold,
  onItalic,
  onAlign,
  onBullets,
  onColor,
  onPresetChange,
  currentPreset,
  customWidth,
  customHeight,
  onCustomSizeChange,
  onExportPdf
}: Props) => {
  const editingText = selectedMode === 'editing' && selectedType === 'text';

  return (
    <header className="toolbar">
      <div className="toolbar-group">
        <button type="button" onClick={onAddText}>
          + Texto
        </button>
        <label className="file-button">
          + Imagem
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAddImage(file);
              event.target.value = '';
            }}
          />
        </label>
        <button type="button" onClick={onAddTable}>
          + Tabela
        </button>
      </div>

      <div className="toolbar-group">
        <select
          value={currentPreset}
          onChange={(event) => {
            const preset = event.target.value as PagePreset;
            if (preset === 'CUSTOM') {
              onPresetChange('CUSTOM', customWidth, customHeight);
            } else {
              const item = PAGE_PRESETS[preset as keyof typeof PAGE_PRESETS];
              onPresetChange(preset, item.width, item.height);
            }
          }}
        >
          <option value="A4_PORTRAIT">A4 Retrato</option>
          <option value="A4_LANDSCAPE">A4 Paisagem</option>
          <option value="SLIDE">Slide 16:9</option>
          <option value="CUSTOM">Customizado</option>
        </select>

        <input
          type="number"
          min={300}
          max={2000}
          value={customWidth}
          onChange={(event) => onCustomSizeChange(Number(event.target.value), customHeight)}
          disabled={currentPreset !== 'CUSTOM'}
          aria-label="Largura"
        />
        <input
          type="number"
          min={300}
          max={2000}
          value={customHeight}
          onChange={(event) => onCustomSizeChange(customWidth, Number(event.target.value))}
          disabled={currentPreset !== 'CUSTOM'}
          aria-label="Altura"
        />
      </div>

      <div className="toolbar-group">
        <select disabled={!editingText} onChange={(event) => onFontSize(Number(event.target.value))} defaultValue={16}>
          <option value={12}>12</option>
          <option value={14}>14</option>
          <option value={16}>16</option>
          <option value={20}>20</option>
          <option value={24}>24</option>
          <option value={32}>32</option>
        </select>
        <button type="button" disabled={!editingText} onClick={onBold}>
          B
        </button>
        <button type="button" disabled={!editingText} onClick={onItalic}>
          I
        </button>
        <button type="button" disabled={!editingText} onClick={() => onAlign('left')}>
          ⬅
        </button>
        <button type="button" disabled={!editingText} onClick={() => onAlign('center')}>
          ⬌
        </button>
        <button type="button" disabled={!editingText} onClick={() => onAlign('right')}>
          ➡
        </button>
        <button type="button" disabled={!editingText} onClick={onBullets}>
          • Lista
        </button>
        <input type="color" disabled={!editingText} onChange={(event) => onColor(event.target.value)} />
      </div>

      <div className="toolbar-group">
        <button type="button" onClick={onExportPdf}>
          Exportar PDF
        </button>
      </div>
    </header>
  );
};
