import { Rnd } from 'react-rnd';
import type { TableBox as TTableBox } from '../types';

type Props = {
  box: TTableBox;
  selected: boolean;
  onSelect: () => void;
  onResizeMove: (x: number, y: number, width: number, height: number) => void;
};

export const TableBox = ({ box, selected, onSelect, onResizeMove }: Props) => (
  <Rnd
    className={`box table-box ${selected ? 'selected' : ''}`}
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
    <table className="simple-table">
      <tbody>
        {box.cells.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => (
              <td key={`cell-${rowIndex}-${colIndex}`}>{cell.content[0] && 'Célula'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </Rnd>
);
