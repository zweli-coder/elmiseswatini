import React, { useMemo } from 'react';
import './PivotTable.css'; // We'll create this for styling

const PivotTable = ({ data, rows, cols, valueField, title }) => {
  const pivotData = useMemo(() => {
    if (!data || data.length === 0 || !rows || !cols || !valueField) {
      return null;
    }

    const rowLabels = [...new Set(data.map(item => item[rows]))].sort();
    const colLabels = [...new Set(data.map(item => item[cols]))].sort();

    const tableData = rowLabels.map(rowLabel => {
      const row = { rowLabel };
      colLabels.forEach(colLabel => {
        const cellData = data.find(item => item[rows] === rowLabel && item[cols] === colLabel);
        // THE FIX: Check if cellData and the valueField exist and are numbers
        const value = cellData && typeof cellData[valueField] === 'number'
          ? cellData[valueField]
          : null; // Explicitly set to null if not found or not a number
        row[colLabel] = value;
      });
      return row;
    });

    return { rowLabels, colLabels, tableData };
  }, [data, rows, cols, valueField]);

  if (!pivotData) {
    return (
      <div className="pivot-container pivot-loading">
        <h3>{title}</h3>
        <p>Loading pivot data or configuration is incomplete...</p>
      </div>
    );
  }

  return (
    <div className="pivot-container">
      <h3>{title}</h3>
      <div className="pivot-table-wrapper">
        <table className="pivot-table">
          <thead>
            <tr>
              <th>{rows}</th>
              {pivotData.colLabels.map(label => <th key={label}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {pivotData.tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.rowLabel}</td>
                {pivotData.colLabels.map(colLabel => {
                  const cellValue = row[colLabel];
                  // THE FIX: Check the value before calling toFixed()
                  const displayValue = typeof cellValue === 'number' ? cellValue.toFixed(2) : 'N/A';
                  return (
                    <td key={colLabel} className={typeof cellValue !== 'number' ? 'na' : ''}>
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PivotTable;