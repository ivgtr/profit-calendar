import React from 'react';
import { Icon } from '../base/Icon';
import './Table.css';

export type TableVariant = 'default' | 'striped' | 'bordered';
export type TableSize = 'compact' | 'medium' | 'comfortable';
export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right';
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  variant?: TableVariant;
  size?: TableSize;
  loading?: boolean;
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
  rowKey?: keyof T | ((record: T) => string);
  className?: string;
  emptyText?: string;
  showHeader?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

export function Table<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  data,
  variant = 'default',
  size = 'medium',
  loading = false,
  sortColumn,
  sortDirection,
  onSort,
  rowKey = 'id' as keyof T,
  className = '',
  emptyText = 'データがありません',
  showHeader = true,
  bordered = false,
  hoverable = true
}: TableProps<T>) {
  const tableClasses = [
    'table',
    `table--${variant}`,
    `table--${size}`,
    bordered && 'table--bordered',
    hoverable && 'table--hoverable',
    className
  ].filter(Boolean).join(' ');

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey as keyof T] || index);
  };

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    let newDirection: SortDirection = 'asc';
    if (sortColumn === column.key) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }
    onSort(column.key, newDirection);
  };

  const renderCell = (column: TableColumn<T>, record: T, index: number): React.ReactNode => {
    if (column.render) {
      const value = column.dataIndex ? record[column.dataIndex] : (record as T[keyof T]);
      return column.render(value, record, index);
    }
    return column.dataIndex ? String(record[column.dataIndex]) : '';
  };

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    if (sortColumn === column.key) {
      return sortDirection === 'asc' ? (
        <Icon name="chevron-up" size="small" />
      ) : sortDirection === 'desc' ? (
        <Icon name="chevron-down" size="small" />
      ) : (
        <Icon name="chevron-up" size="small" className="table__sort-icon--inactive" />
      );
    }
    
    return <Icon name="chevron-up" size="small" className="table__sort-icon--inactive" />;
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="table__loading">
          <div className="table__loading-spinner" />
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className={tableClasses}>
        {showHeader && (
          <thead className="table__header">
            <tr className="table__header-row">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`table__header-cell table__header-cell--${column.align || 'left'} ${
                    column.sortable ? 'table__header-cell--sortable' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="table__header-content">
                    <span>{column.title}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="table__body">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr key={getRowKey(record, index)} className="table__body-row">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`table__body-cell table__body-cell--${column.align || 'left'}`}
                  >
                    {renderCell(column, record, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}