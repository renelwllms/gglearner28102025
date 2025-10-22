import { useState, forwardRef } from 'react';
import { Table } from '@arco-design/web-react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './index.less';

const CustomResizeHandle = forwardRef((props, ref) => {
  const { handleAxis, ...restProps } = props;
  return (
    <span
      ref={ref}
      className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
      {...restProps}
      onClick={(e) => e.stopPropagation()}
    />
  );
});

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={<CustomResizeHandle handleAxis="e" />}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const ResizableTable = ({ columns: originColumns, data, ...restProps }) => {
  const [columns, setColumns] = useState(
    originColumns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: handleResize(index),
      }),
    }))
  );

  function handleResize(index) {
    return (e, { size }) => {
      setColumns((prevColumns) => {
        const nextColumns = [...prevColumns];
        nextColumns[index] = { ...nextColumns[index], width: size.width };
        return nextColumns;
      });
    };
  }

  const components = {
    header: {
      th: ResizableTitle,
    },
  };

  return (
    <div className="table-demo-resizable-column">
      <Table
        components={components}
        columns={columns}
        data={data}
        {...restProps}
      />
    </div>
  );
};

export default ResizableTable;
