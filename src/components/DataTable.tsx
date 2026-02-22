import React, { useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  RowSelectionState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Filter, X, ChevronLeft, ChevronRight, ChevronsLeft, CheckSquare } from 'lucide-react';
import { useFloating, FloatingPortal, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { DateTime } from 'luxon';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => void;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
}

interface DateFilterOption {
  label: string;
  value: string;
  getDateRange: () => [string, string];
}

const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  {
    label: 'Today',
    value: 'today',
    getDateRange: () => {
      const today = DateTime.now();
      return [today.toISODate(), today.toISODate()];
    }
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getDateRange: () => {
      const yesterday = DateTime.now().minus({ days: 1 });
      return [yesterday.toISODate(), yesterday.toISODate()];
    }
  },
  {
    label: 'This Week',
    value: 'thisWeek',
    getDateRange: () => {
      const now = DateTime.now();
      const startOfWeek = now.startOf('week');
      return [startOfWeek.toISODate(), now.toISODate()];
    }
  },
  {
    label: 'Past Week',
    value: 'pastWeek',
    getDateRange: () => {
      const now = DateTime.now();
      const weekAgo = now.minus({ days: 7 });
      return [weekAgo.toISODate(), now.toISODate()];
    }
  },
  {
    label: 'This Month',
    value: 'thisMonth',
    getDateRange: () => {
      const now = DateTime.now();
      const startOfMonth = now.startOf('month');
      return [startOfMonth.toISODate(), now.toISODate()];
    }
  },
  {
    label: 'Past Month',
    value: 'pastMonth',
    getDateRange: () => {
      const now = DateTime.now();
      const monthAgo = now.minus({ months: 1 });
      return [monthAgo.toISODate(), now.toISODate()];
    }
  },
  {
    label: 'Last 7 Days',
    value: 'last7Days',
    getDateRange: () => {
      const now = DateTime.now();
      const sevenDaysAgo = now.minus({ days: 7 });
      return [sevenDaysAgo.toISODate(), now.toISODate()];
    }
  },
  {
    label: 'Last 30 Days',
    value: 'last30Days',
    getDateRange: () => {
      const now = DateTime.now();
      const thirtyDaysAgo = now.minus({ days: 30 });
      return [thirtyDaysAgo.toISODate(), now.toISODate()];
    }
  }
];

function DataTable<T>({ data, columns, rowSelection, onRowSelectionChange, onSelectedRowsChange }: DataTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const [selectedDateOptions, setSelectedDateOptions] = useState<{[columnId: string]: string[]}>({});
  const [customDateRanges, setCustomDateRanges] = useState<{[columnId: string]: [string, string]}>({});
  const filterRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded bg-[#111827] border-[#00f0ff]/20 text-[#00f0ff] focus:ring-[#00f0ff]/30 focus:ring-offset-0 cursor-pointer accent-[#00f0ff]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded bg-[#111827] border-[#00f0ff]/20 text-[#00f0ff] focus:ring-[#00f0ff]/30 focus:ring-offset-0 cursor-pointer accent-[#00f0ff]"
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
        size: 40,
      },
      ...columns
    ],
    getRowId: (row: any) => row.id?.toString(),
    state: {
      rowSelection,
      columnFilters,
      pagination: paginationState,
    },
    enableRowSelection: true,
    onRowSelectionChange,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPaginationState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Floating UI setup for filter popover
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current && 
        !filterRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.filter-button')
      ) {
        setActiveFilter(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify parent component of selection changes
  React.useEffect(() => {
    if (onSelectedRowsChange) {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
      onSelectedRowsChange(selectedRows);
    }
  }, [rowSelection]);

  const handleDateOptionChange = (columnId: string, optionValue: string, checked: boolean) => {
    const currentOptions = selectedDateOptions[columnId] || [];
    let newOptions: string[];
    
    if (checked) {
      newOptions = [...currentOptions, optionValue];
    } else {
      newOptions = currentOptions.filter(opt => opt !== optionValue);
    }
    
    setSelectedDateOptions(prev => ({
      ...prev,
      [columnId]: newOptions
    }));
    
    // Apply the filter
    applyDateFilter(columnId, newOptions, customDateRanges[columnId]);
  };

  const handleCustomDateChange = (columnId: string, fromDate: string, toDate: string) => {
    const newRange: [string, string] = [fromDate, toDate];
    setCustomDateRanges(prev => ({
      ...prev,
      [columnId]: newRange
    }));
    
    // Apply the filter
    applyDateFilter(columnId, selectedDateOptions[columnId] || [], newRange);
  };

  const applyDateFilter = (columnId: string, options: string[], customRange?: [string, string]) => {
    const column = table.getColumn(columnId);
    if (!column) return;
    
    const dateRanges: [string, string][] = [];
    
    // Add predefined option ranges
    options.forEach(optionValue => {
      const option = DATE_FILTER_OPTIONS.find(opt => opt.value === optionValue);
      if (option) {
        dateRanges.push(option.getDateRange());
      }
    });
    
    // Add custom range if both dates are provided
    if (customRange && customRange[0] && customRange[1]) {
      dateRanges.push(customRange);
    }
    
    // Set the filter value
    if (dateRanges.length > 0) {
      column.setFilterValue(dateRanges);
    } else {
      column.setFilterValue(undefined);
    }
  };

  const clearDateFilter = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return;
    
    column.setFilterValue(undefined);
    setSelectedDateOptions(prev => ({
      ...prev,
      [columnId]: []
    }));
    setCustomDateRanges(prev => ({
      ...prev,
      [columnId]: ['', '']
    }));
  };

  const renderFilterPopover = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return null;

    // Special handling for date columns
    if (columnId === 'created_at' || columnId === 'converted_at') {
      const currentOptions = selectedDateOptions[columnId] || [];
      const currentCustomRange = customDateRanges[columnId] || ['', ''];
      
      return (
        <FloatingPortal>
          <div
            ref={(node) => {
              refs.setFloating(node);
              if (filterRef) filterRef.current = node;
            }}
            style={floatingStyles}
            className="z-50 glass-panel rounded-xl shadow-2xl shadow-[#00f0ff]/5 neon-border-strong w-80 animate-fade-in-up"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-[#e8edf5]">Filter by Date</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allOptions = DATE_FILTER_OPTIONS.map(opt => opt.value);
                      setSelectedDateOptions(prev => ({
                        ...prev,
                        [columnId]: allOptions
                      }));
                      applyDateFilter(columnId, allOptions, currentCustomRange);
                    }}
                    className="px-2 py-1 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/20 rounded-md text-xs text-[#00f0ff] transition-all duration-200"
                  >
                    Check All
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDateOptions(prev => ({
                        ...prev,
                        [columnId]: []
                      }));
                      applyDateFilter(columnId, [], currentCustomRange);
                    }}
                    className="px-2 py-1 bg-[#111827] hover:bg-[#1a2332] border border-[#1e293b] rounded-md text-xs text-[#7b8ba3] transition-all duration-200"
                  >
                    Uncheck All
                  </button>
                </div>
              </div>
              
              {/* Predefined Options */}
              <div className="space-y-1 mb-4 max-h-48 overflow-y-auto">
                {DATE_FILTER_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-[#00f0ff]/5 p-1.5 rounded-lg transition-colors duration-150">
                    <input
                      type="checkbox"
                      checked={currentOptions.includes(option.value)}
                      onChange={(e) => handleDateOptionChange(columnId, option.value, e.target.checked)}
                      className="rounded bg-[#111827] border-[#00f0ff]/20 text-[#00f0ff] accent-[#00f0ff]"
                    />
                    <span className="text-sm text-[#e8edf5]">{option.label}</span>
                  </label>
                ))}
              </div>
              
              {/* Custom Date Range */}
              <div className="border-t border-[#00f0ff]/10 pt-3">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-[#00f0ff]/5 p-1.5 rounded-lg mb-2 transition-colors duration-150">
                  <input
                    type="checkbox"
                    checked={currentCustomRange[0] !== '' || currentCustomRange[1] !== ''}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleCustomDateChange(columnId, '', '');
                      }
                    }}
                    className="rounded bg-[#111827] border-[#00f0ff]/20 text-[#00f0ff] accent-[#00f0ff]"
                  />
                  <span className="text-sm text-[#e8edf5] font-medium">Custom</span>
                </label>
                
                <div className="ml-6 space-y-2">
                  <div>
                    <label className="block text-xs text-[#7b8ba3] mb-1">From:</label>
                    <input
                      type="date"
                      value={currentCustomRange[0]}
                      onChange={(e) => handleCustomDateChange(columnId, e.target.value, currentCustomRange[1])}
                      className="w-full bg-[#111827] neon-border rounded-lg px-3 py-1.5 text-sm text-[#e8edf5] focus:outline-none focus:border-[#00f0ff]/40 transition-colors duration-200"
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7b8ba3] mb-1">To:</label>
                    <input
                      type="date"
                      value={currentCustomRange[1]}
                      onChange={(e) => handleCustomDateChange(columnId, currentCustomRange[0], e.target.value)}
                      className="w-full bg-[#111827] neon-border rounded-lg px-3 py-1.5 text-sm text-[#e8edf5] focus:outline-none focus:border-[#00f0ff]/40 transition-colors duration-200"
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => clearDateFilter(columnId)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-400 transition-all duration-200"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          </div>
        </FloatingPortal>
      );
    }

    const uniqueValues = Array.from(column.getFacetedUniqueValues().keys())
      .filter(value => value !== null && value !== undefined)
      .sort();

    return (
      <FloatingPortal>
        <div
          ref={(node) => {
            refs.setFloating(node);
            if (filterRef) filterRef.current = node;
          }}
          style={floatingStyles}
          className="z-50 glass-panel rounded-xl shadow-2xl shadow-[#00f0ff]/5 neon-border-strong w-64 max-h-96 overflow-auto animate-fade-in-up"
        >
          <div className="p-3 border-b border-[#00f0ff]/10">
            <input
              type="text"
              value={(column.getFilterValue() as string) ?? ''}
              onChange={e => column.setFilterValue(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#111827] neon-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00f0ff]/40 text-[#e8edf5] placeholder-[#4a5568] transition-colors duration-200"
            />
          </div>
          
          <div className="p-2">
            {uniqueValues.map((value) => (
              <label key={value} className="flex items-center px-2 py-1.5 hover:bg-[#00f0ff]/5 rounded-lg cursor-pointer transition-colors duration-150">
                <input
                  type="checkbox"
                  checked={((column.getFilterValue() as string[]) || []).includes(value)}
                  onChange={(e) => {
                    const filterValue = (column.getFilterValue() as string[]) || [];
                    if (e.target.checked) {
                      column.setFilterValue([...filterValue, value]);
                    } else {
                      column.setFilterValue(filterValue.filter(v => v !== value));
                    }
                  }}
                  className="rounded bg-[#111827] border-[#00f0ff]/20 text-[#00f0ff] mr-2 accent-[#00f0ff]"
                />
                <span className="text-sm text-[#e8edf5]">{value}</span>
              </label>
            ))}
          </div>
        </div>
      </FloatingPortal>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto flex-1" ref={tableRef}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10" style={{ background: 'linear-gradient(180deg, #0d1320 0%, #0d1320 90%, transparent 100%)' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-[#00f0ff]/10">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-[#7b8ba3] text-xs uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'flex items-center gap-1 cursor-pointer select-none group'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="group-hover:text-[#00f0ff] transition-colors duration-200">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {{
                            asc: <ChevronUp size={14} className="text-[#00f0ff]" />,
                            desc: <ChevronDown size={14} className="text-[#00f0ff]" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        
                        {header.column.getCanFilter() && (
                          <div className="relative" ref={refs.setReference}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveFilter(activeFilter === header.column.id ? null : header.column.id);
                              }}
                              className={`filter-button text-[#4a5568] hover:text-[#00f0ff] transition-colors duration-200 ${header.column.getFilterValue() ? 'text-[#00f0ff]' : ''}`}
                            >
                              {header.column.getFilterValue() ? (
                                <X size={14} className="text-[#00f0ff]" onClick={(e) => {
                                  e.stopPropagation();
                                  header.column.setFilterValue(null);
                                }} />
                              ) : (
                                <Filter size={14} />
                              )}
                            </button>
                            {activeFilter === header.column.id && renderFilterPopover(header.column.id)}
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className="table-row-hover border-b border-[#0d1320]/80 transition-all duration-200"
                style={{
                  animationDelay: `${Math.min(index * 20, 500)}ms`,
                  background: row.getIsSelected()
                    ? 'linear-gradient(90deg, rgba(0,240,255,0.08), rgba(0,240,255,0.03), transparent)'
                    : undefined,
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id} 
                    className="px-4 py-3 text-[#e8edf5] text-sm"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-[#00f0ff]/10 bg-[#0d1320]/80 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-[#7b8ba3]">
          <span>
            <span className="text-[#00f0ff] font-medium">{table.getSelectedRowModel().rows.length}</span>
            {' '}of{' '}
            <span className="text-[#e8edf5]">{table.getRowModel().rows.length}</span>
            {' '}row(s) selected
          </span>
          <span className="text-[#1e293b]">|</span>
          <span><span className="text-[#00f0ff] font-medium">{table.getFilteredRowModel().rows.length}</span> filtered leads</span>
          {table.getSelectedRowModel().rows.length < table.getFilteredRowModel().rows.length && (
            <>
              <span className="text-[#1e293b]">|</span>
              <button
                onClick={() => table.toggleAllRowsSelected(true)}
                className="flex items-center gap-1 text-[#00f0ff] hover:text-[#00f0ff]/80 underline underline-offset-2 transition-colors duration-200"
              >
                <CheckSquare size={14} />
                <span>Select all {table.getFilteredRowModel().rows.length} leads</span>
              </button>
            </>
          )}
          <span className="text-[#1e293b]">|</span>
          <select
            value={paginationState.pageSize}
            onChange={e => setPaginationState(prev => ({
              ...prev,
              pageSize: Number(e.target.value),
              pageIndex: 0,
            }))}
            className="bg-[#111827] neon-border rounded-lg px-2 py-1 text-xs md:text-sm text-[#e8edf5] focus:outline-none focus:border-[#00f0ff]/40 transition-colors duration-200 cursor-pointer"
          >
            {[10, 25, 50, 100, 250].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
            {[500, 1000, 2500, 5000].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
            <option value={10000}>Show 10,000</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg hover:bg-[#00f0ff]/10 disabled:opacity-30 disabled:hover:bg-transparent text-[#7b8ba3] hover:text-[#00f0ff] transition-all duration-200"
            title="Go to first page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg hover:bg-[#00f0ff]/10 disabled:opacity-30 disabled:hover:bg-transparent text-[#7b8ba3] hover:text-[#00f0ff] transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs md:text-sm text-[#7b8ba3] px-3">
            Page <span className="text-[#00f0ff] font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="text-[#e8edf5]">{table.getPageCount()}</span>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg hover:bg-[#00f0ff]/10 disabled:opacity-30 disabled:hover:bg-transparent text-[#7b8ba3] hover:text-[#00f0ff] transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
