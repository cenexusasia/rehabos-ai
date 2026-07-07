'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { statusColors, calculateAge } from '@/components/patients/patient-card';
import type { PatientListItem } from '@/types/patient';

const columnHelper = createColumnHelper<PatientListItem>();

interface PatientListProps {
  data: PatientListItem[];
  isLoading?: boolean;
}

export function PatientList({ data, isLoading }: PatientListProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('first_name', {
        header: 'Name',
        cell: (info) => (
          <span className="text-foreground font-medium">
            {info.row.original.first_name} {info.row.original.last_name}
          </span>
        ),
        sortingFn: (a, b) => {
          const nameA = `${a.original.first_name} ${a.original.last_name}`.toLowerCase();
          const nameB = `${b.original.first_name} ${b.original.last_name}`.toLowerCase();
          return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        },
      }),
      columnHelper.accessor('date_of_birth', {
        header: 'Age',
        cell: (info) => {
          const age = calculateAge(info.getValue());
          return <span className="text-muted-foreground text-sm">{age}</span>;
        },
      }),
      columnHelper.accessor('diagnosis_codes', {
        header: 'Diagnosis',
        cell: (info) => {
          const codes = info.getValue();
          if (!codes || codes.length === 0) {
            return <span className="text-muted-foreground text-sm italic">None</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {codes.slice(0, 3).map((code) => (
                <span
                  key={code}
                  className="bg-secondary/10 text-secondary-foreground rounded-md px-1.5 py-0.5 text-xs font-medium"
                >
                  {code}
                </span>
              ))}
              {codes.length > 3 && (
                <span className="text-muted-foreground text-xs">+{codes.length - 3}</span>
              )}
            </div>
          );
        },
        filterFn: (row, _columnId, filterValue: string) => {
          const codes = row.original.diagnosis_codes ?? [];
          return codes.some((code) =>
            code.toLowerCase().includes(filterValue.toLowerCase()),
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const s = info.getValue();
          const color = statusColors[s] ?? 'bg-muted text-muted-foreground';
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                color,
              )}
            >
              {s}
            </span>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: ({ column }) => (
          <button
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <span className="text-muted-foreground text-sm">
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const name = `${row.original.first_name} ${row.original.last_name}`.toLowerCase();
      const codes = (row.original.diagnosis_codes ?? [])
        .join(' ')
        .toLowerCase();
      return name.includes(search) || codes.includes(search);
    },
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border-border overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-border border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                  <th className="w-10 px-2 py-3" />
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-border border-b last:border-0">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="bg-muted h-4 animate-pulse rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-4 py-12 text-center text-sm">
                    No patients found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-border hover:bg-accent/50 cursor-pointer border-b transition-colors last:border-0"
                    onClick={() => router.push(`/patients/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td className="px-2 py-3 text-right">
                      <ChevronRight className="text-muted-foreground ml-auto h-4 w-4" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row count */}
      {!isLoading && data.length > 0 && (
        <p className="text-muted-foreground text-center text-xs">
          Showing {table.getRowModel().rows.length} of {data.length} patients
        </p>
      )}
    </div>
  );
}
