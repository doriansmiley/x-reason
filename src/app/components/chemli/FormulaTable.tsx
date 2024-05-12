"use client";

import { useEffect, useState, useRef } from "react";

import { Column, ColumnHeaderCell, EditableCell2, EditableName, Region, Table2, TableLoadingOption } from "@blueprintjs/table";
import { Button, ButtonGroup, Tooltip } from "@blueprintjs/core";

import "@blueprintjs/table/lib/css/table.css";
import "./FormulaManipulator.css";

export interface IFormula {
  title?: string;
  industry?: string;
  phases?: IPhase;
  table?: string[][];
  metadata: IFormulaMetadata;
  "Manufacturing Procedure"?: string;
  "Marketing Claims"?: string;
}

export interface IFormulaMetadata {
  title?: string;
  description?: string;
  productImage?: string;
  permalink?: string;
}

export interface IRenderFormulaProps {
  className: string;
  table: IFormula;
}

export interface IPhaseStep {
  [key: string]: string;
}

export interface IPhase {
  [key: string]: IPhaseStep[];
}

function deepEquals(table1: string[][], table2: string[][]) {
  if (table1.length != table2.length) {
    return false;
  }

  for (let i = 0; i < table1.length; i++) {
    if (table1[i].length !== table2[i].length) {
      return false;
    }
    for (let j = 0; j < table1[i].length; j++) {
      if (table1[i][j] !== table2[i][j]) {
        return false;
      }
    }
  }
  return true;
}

function deepCopy(table: string[][]) {
  const newTable = [];
  newTable.push(...table.map((row: string[]) => row.map((v) => v)));
  return newTable;
}

export default function FormulaTable(props: IRenderFormulaProps) {
  // local states, if these needs to propage outside of these components please move them to the formula store
  const [selectedRegions, setSelectedRegion] = useState([{ cols: [0, 0], rows: [0, 0] }] as Region[]);
  const [undoStack, setUndoStack] = useState([] as any);
  const [redoStack, setRedoStack] = useState([] as any);
  const [useFocusedCell, setUseFocusedCell] = useState(false);
  const activeFormula = props.table;
  const formulaIsLoading = false;

  const tableReference: any = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (tableReference.current) {
        if (!tableReference.current.contains(event.target)) {
          // clicked outside this component
          setUseFocusedCell(false);
        } else if (event.target.closest(".bp5-table-body-cells")) {
          // clicked in the cell space, but not in the headers
          setUseFocusedCell(true);
        } else {
          // clicked in the headers
          setUseFocusedCell(false);
        }
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tableReference]);

  let formula: IFormula = activeFormula ?? ({} as IFormula);

  if (formula.table === undefined) {
    return "";
  }
  const headers = formula.table[0];
  const tableLoader = formulaIsLoading ? [TableLoadingOption.CELLS, TableLoadingOption.COLUMN_HEADERS, TableLoadingOption.ROW_HEADERS] : [];

  // TODO: Coloring is currently hardcoded against the existance of a phase column. We should parameterize this in the future
  const phaseIndex = headers.indexOf("phase");
  const rows = formula.table;

  let columns = headers.map((header, index) => (
    <Column key={"formula-column-" + index} cellRenderer={renderCell(index, rows, phaseIndex)} columnHeaderCellRenderer={renderColumnHeader(header, index)} />
  ));

  // we only want to allow adding rows and columns whenever a single row or single column is selected
  const disableNewRowOperations = selectedRegions[0].rows === undefined || selectedRegions[0].rows?.[0] !== selectedRegions[0].rows?.[1];
  const disableNewColumnOperations = selectedRegions[0].cols === undefined || selectedRegions[0].cols?.[0] !== selectedRegions[0].cols?.[1];
  const disableDeleteRowOperations =
    selectedRegions[0].rows === undefined || (selectedRegions[0].cols !== undefined && selectedRegions[0].rows?.[0] !== selectedRegions[0].rows?.[1]);
  const disableDeleteColOperations =
    selectedRegions[0].cols === undefined || (selectedRegions[0].rows !== undefined && selectedRegions[0].cols?.[0] !== selectedRegions[0].cols?.[1]);

  function localSetFormula(oldTable?: string[][], resetRedoStack?: boolean) {
    if (resetRedoStack === undefined) {
      resetRedoStack = true;
    }
    // new root level reference pointer to the table object so that we can trigger the shallow comparison that blueprint
    // table component does which without we don't get a full table refresh whenever data changes.
    // we also need to do a deep copy so that undo works, this is a bit compute/memory heavy so we should debounce
    if (formula.table !== undefined) {
      // doing a shallow copy so that blueprint triggers the re-render
      formula.table = [...formula.table.map((v) => v)];

      if (oldTable) {
        if (!deepEquals(oldTable, formula.table)) {
          undoStack.push(oldTable);
          setUndoStack(undoStack);
          if (resetRedoStack) {
            setRedoStack([]);
          }
        }
      }
    } else {
      throw "Table is undefined, it should never be undefined here, please debug!";
    }
  }

  function undo() {
    if (formula.table !== undefined && undoStack.length > 0) {
      redoStack.push(formula.table);
      setRedoStack(redoStack);

      formula.table = undoStack.pop();
      setUndoStack(undoStack);

      localSetFormula();
    }
  }

  function redo() {
    if (formula.table !== undefined && redoStack.length > 0) {
      const oldTable = formula.table;

      formula.table = redoStack.pop();
      setRedoStack(redoStack);

      localSetFormula(oldTable, false);
    }
  }

  function clearRegion(): void {
    const rows = selectedRegions[0].rows;
    const cols = selectedRegions[0].cols;
    if (formula.table === undefined) {
      throw "Table is undefined, it should never be undefined here, please debug!";
    }

    const oldTable = deepCopy(formula.table);

    if (rows && cols) {
      for (let i = rows[0]; i <= rows[1]; i++) {
        for (let j = cols[0]; j <= cols[1]; j++) {
          formula.table[i + 1][j] = "";
        }
      }
    } else if (rows) {
      for (let i = rows[0]; i <= rows[1]; i++) {
        for (let j = 0; j < formula.table[i].length; j++) {
          formula.table[i + 1][j] = "";
        }
      }
    } else if (cols) {
      for (let i = 0; i < formula.table.length; i++) {
        for (let j = cols[0]; j <= cols[1]; j++) {
          formula.table[i][j] = "";
        }
      }
    }

    localSetFormula(oldTable);
  }

  function deleteRow() {
    const rows = selectedRegions[0].rows;

    if (formula.table === undefined) {
      throw "Table is undefined, it should never be undefined here, please debug!";
    }

    const oldTable = deepCopy(formula.table);

    if (rows) {
      formula.table.splice(rows[0] + 1, rows[1] - rows[0] + 1);
    }

    localSetFormula(oldTable);
  }

  function deleteColumn() {
    const cols = selectedRegions[0].cols;

    if (formula.table === undefined) {
      throw "Table is undefined, it should never be undefined here, please debug!";
    }

    const oldTable = deepCopy(formula.table);

    if (cols) {
      for (let i = 0; i < formula.table.length; i++) {
        formula.table[i].splice(cols[0], cols[1] - cols[0] + 1);
      }
    }

    localSetFormula(oldTable);
  }

  function newRow(offset: number) {
    const selectedRow = selectedRegions[0].rows ? selectedRegions[0].rows[0] + 1 : undefined;

    if (formula.table && selectedRow !== undefined) {
      const oldTable = deepCopy(formula.table);

      const index = selectedRow + offset;
      const row = formula.table[selectedRow].map((v) => v);
      formula.table.splice(index, 0, row);
      localSetFormula(oldTable);
    }
  }

  function newColumn(offset: number) {
    const selectedCol = selectedRegions[0].cols ? selectedRegions[0].cols[0] : undefined;

    if (formula.table && selectedCol !== undefined) {
      const oldTable = deepCopy(formula.table);

      const index = selectedCol + offset;
      for (let i = 0; i < formula.table.length; i++) {
        formula.table[i].splice(selectedCol, 0, formula.table[i][selectedCol]);
      }

      localSetFormula(oldTable);
    }
  }

  function storeCellValue(rowIndex: number, columnIndex: number) {
    return (value: string) => {
      if (formula.table !== undefined) {
        const oldTable = deepCopy(formula.table);
        formula.table[rowIndex][columnIndex] = value;
        localSetFormula(oldTable);
      }
    };
  }

  function renderColumnHeader(header: string, index: number) {
    const renderHeaderName = (name: string) => {
      return <EditableName name={name} onChange={storeCellValue(0, index)} />;
    };
    // eslint-disable-next-line react/display-name
    return (index: number) => {
      return <ColumnHeaderCell key={"formula-header-" + index} name={header} index={index} nameRenderer={renderHeaderName} />;
    };
  }

  function renderCell(columnIndex: number, rows: string[][], phaseIndex: number) {
    // eslint-disable-next-line react/display-name
    return (rowIndex: number) => {
      const row = rows[rowIndex + 1];
      const colorLeter = phaseIndex >= 0 && phaseIndex < row.length ? row[phaseIndex].toLowerCase() : "none";
      const rowColor = "phase-background-" + colorLeter + (rowIndex % 2 == 0 ? "2" : "");
      return (
        <EditableCell2
          key={"formula-cell-" + rowIndex}
          className={rowColor}
          value={row[columnIndex]}
          onChange={storeCellValue(rowIndex + 1, columnIndex)}
        ></EditableCell2>
      );
    };
  }

  return (
    <div className={props.className} data-testid="formulaTable">
      <div className="table-operators">
        <ButtonGroup minimal={true}>
          <Tooltip content={"Delete selected row"}>
            <Button icon="exclude-row" onClick={deleteRow} disabled={disableDeleteRowOperations}></Button>
          </Tooltip>
          <Tooltip content={"Delete selected column"}>
            <Button icon="remove-column" onClick={deleteColumn} disabled={disableDeleteColOperations}></Button>
          </Tooltip>
        </ButtonGroup>
        <ButtonGroup minimal={true}>
          <Tooltip content={"Undo table change"}>
            <Button icon="undo" onClick={undo}></Button>
          </Tooltip>
          <Tooltip content={"Clear contents"}>
            <Button icon="eraser" onClick={clearRegion}></Button>
          </Tooltip>
          <Tooltip content={"Redo table change"}>
            <Button icon="redo" onClick={redo}></Button>
          </Tooltip>
        </ButtonGroup>
        <ButtonGroup minimal={true}>
          <Tooltip content={"Add a column to the left"}>
            <Button icon="add-column-left" onClick={() => newColumn(0)} disabled={disableNewColumnOperations}></Button>
          </Tooltip>
          <Tooltip content={"Add a row to the top"}>
            <Button icon="add-row-top" onClick={() => newRow(0)} disabled={disableNewRowOperations}></Button>
          </Tooltip>
          <Tooltip content={"Add a column to the right"}>
            <Button icon="add-column-right" onClick={() => newColumn(1)} disabled={disableNewColumnOperations}></Button>
          </Tooltip>
          <Tooltip content={"Add a row to the bottom"}>
            <Button icon="add-row-bottom" onClick={() => newRow(1)} disabled={disableNewRowOperations}></Button>
          </Tooltip>
        </ButtonGroup>
      </div>
      <div ref={tableReference}>
        <Table2
          numRows={rows.length - 1}
          loadingOptions={tableLoader}
          enableFocusedCell={useFocusedCell}
          enableColumnReordering={false}
          enableRowReordering={false}
          onSelection={(selectedRegions: Region[]) => setSelectedRegion(selectedRegions)}
          cellRendererDependencies={[formula.table]}
        >
          {columns}
        </Table2>
      </div>
    </div>
  );
}
