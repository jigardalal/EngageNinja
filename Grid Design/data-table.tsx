import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  X,
  MoreVertical,
  Pencil,
  Eye,
  Trash2,
  Copy,
} from "lucide-react";

export interface RowAction<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  rowActions?: RowAction<TData>[];
  onSelectionChange?: (selectedRows: TData[]) => void;
  enableSelection?: boolean;
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  rowActions,
  onSelectionChange,
  enableSelection = true,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectionColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        data-testid="checkbox-select-all"
        className="border-white/30"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        data-testid={`checkbox-select-row-${row.index}`}
        className="border-white/30"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const actionsColumn: ColumnDef<TData, TValue> = {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-white/10"
            data-testid={`button-row-actions-${row.index}`}
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/30"
        >
          {rowActions && rowActions.length > 0 ? (
            rowActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(row.original)}
                className={action.variant === "destructive" ? "text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400" : ""}
                data-testid={`menu-item-${action.label.toLowerCase().replace(/\s+/g, '-')}-${row.index}`}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))
          ) : (
            <>
              <DropdownMenuItem data-testid={`menu-item-view-${row.index}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`menu-item-edit-${row.index}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem data-testid={`menu-item-copy-${row.index}`}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                data-testid={`menu-item-delete-${row.index}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const allColumns: ColumnDef<TData, TValue>[] = [
    ...(enableSelection ? [selectionColumn] : []),
    ...columns,
    actionsColumn,
  ];

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter(key => newSelection[key])
          .map(key => data[parseInt(key)]);
        onSelectionChange(selectedRows);
      }
    },
    enableRowSelection: enableSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedCount = Object.keys(rowSelection).filter(key => rowSelection[key]).length;
  const totalRows = table.getFilteredRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);

  const handleClearSelection = () => {
    setRowSelection({});
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const getSelectedRows = () => {
    return Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(key => data[parseInt(key)]);
  };

  return (
    <div className="space-y-4">
      {selectedCount > 0 && (
        <div 
          className="flex items-center justify-between p-4 rounded-lg bg-primary/10 dark:bg-primary/20 backdrop-blur-xl border border-primary/30 shadow-lg"
          data-testid="bulk-action-bar"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" data-testid="text-selected-count">
              {selectedCount} {selectedCount === 1 ? 'row' : 'rows'} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-clear-selection"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions && bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === "destructive" ? "destructive" : "default"}
                size="sm"
                onClick={() => action.onClick(getSelectedRows())}
                data-testid={`button-bulk-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
            {!bulkActions && (
              <>
                <Button variant="outline" size="sm" data-testid="button-bulk-export">
                  Export Selected
                </Button>
                <Button variant="destructive" size="sm" data-testid="button-bulk-delete">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 pr-9 bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/30"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="default" 
                data-testid="button-columns"
                className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/30"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/30"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      data-testid={`checkbox-column-${column.id}`}
                    >
                      {column.id.replace(/_/g, ' ')}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border border-white/30 overflow-hidden bg-white/30 dark:bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-white/50 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/5 border-white/20">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover-elevate border-white/10 ${row.getIsSelected() ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  data-testid={`row-${index}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
          {enableSelection && selectedCount > 0 && (
            <span className="mr-2 text-primary font-medium">
              {selectedCount} selected
            </span>
          )}
          Showing {totalRows > 0 ? startRow : 0} to {endRow} of {totalRows} results
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[70px] bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/30" data-testid="select-page-size">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/30">
                {[5, 10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`} data-testid={`option-page-size-${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              data-testid="button-first-page"
              className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/30"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              data-testid="button-prev-page"
              className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm text-muted-foreground">Page</span>
              <span className="text-sm font-medium" data-testid="text-current-page">
                {currentPage + 1}
              </span>
              <span className="text-sm text-muted-foreground">of</span>
              <span className="text-sm font-medium" data-testid="text-total-pages">
                {table.getPageCount() || 1}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              data-testid="button-next-page"
              className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              data-testid="button-last-page"
              className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/30"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
