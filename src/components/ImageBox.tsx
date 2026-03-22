import { Rnd } from 'react-rnd';
import type { ImageBox as TImageBox } from '../types';

type Props = {
  box: TImageBox;
  selected: boolean;
  onSelect: () => void;
  onResizeMove: (x: number, y: number, width: number, height: number) => void;
};

export const ImageBox = ({ box, selected, onSelect, onResizeMove }: Props) => (
  <Rnd
    className={`box image-box ${selected ? 'selected' : ''}`}
    size={{ width: box.width, height: box.height }}
    position={{ x: box.x, y: box.y }}
    bounds="parent"
    enableResizing={selected}
    onDragStop={(_, data) => onResizeMove(data.x, data.y, box.width, box.height)}
    onResizeStop={(_, __, ref, ___, position) =>
      onResizeMove(position.x, position.y, Number(ref.style.width.replace('px', '')), Number(ref.style.height.replace('px', '')))
    }
    onMouseDown={onSelect}
  >
    <img src={box.src} alt={box.alt} className="image-content" draggable={false} />
  </Rnd>
);
