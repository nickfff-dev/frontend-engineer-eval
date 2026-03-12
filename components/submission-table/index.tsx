"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteSubmission, useSubmissions } from "@/hooks/use-submissions";
import { buildColumns } from "./build-columns";
import { SubmissionDetails } from "./submission-details";
import type { Submission, SubmissionStatus } from "@/types/types";
import { SkeletonTable } from "../table-skeleton";
import { ErrorOccurred } from "../error-view";
import { toast } from "sonner";
import { useEditTask, useTasks } from "@/hooks/use-tasks";
import { DeleteAlert } from "../delete-modal";

const STATUS_OPTIONS: SubmissionStatus[] = ["pending", "approved", "rejected"];

export default function SubmissionTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Submission | null>(null)


  const { data: relatedTaskData } = useTasks([{ field: 'id', value: selectedSubmission?.taskId }]);
  const { mutate: deleteSubmission } = useDeleteSubmission();
  const { mutate: editTask } = useEditTask();

  const handleView = React.useCallback((submission: Submission) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  }, []);
  const handleDeleteClick = React.useCallback((submission: Submission) => {
    setDeleteTarget(submission)
    setDeleteOpen(true)
  }, [])

  const handleDeleteConfirm = React.useCallback(() => {
    if(!deleteTarget) return;
    const relatedTask = relatedTaskData?.[0];
    deleteSubmission(deleteTarget.id, {
      onSuccess: () => {
        if (relatedTask) {
          editTask({
            id: relatedTask.id,
            data: { submissionsReceived: Math.max(0, relatedTask.submissionsReceived - 1) },
          });
        }
        toast.success("Submission deleted");
      },
      onError: () => toast.error("Failed to delete submission"),
    });
  }, [deleteTarget, deleteSubmission, editTask])


  const columns = React.useMemo(() => buildColumns(handleView, handleDeleteClick), [handleView, handleDeleteClick]);

  const { data, isPending, isError } = useSubmissions();

  const table = useReactTable({
    data: data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: {

      pagination: { pageSize: 6 }
  }
  });

  if (isPending) return <SkeletonTable />;
  if (isError) return <ErrorOccurred />;

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Task ID search */}
        <Input
          className="max-w-xs"
          placeholder="Search by task ID…"
          value={(table.getColumn("taskId")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("taskId")?.setFilterValue(e.target.value || undefined)
          }
        />

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="capitalize">
              {(table.getColumn("status")?.getFilterValue() as string) ?? "All Statuses"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => table.getColumn("status")?.setFilterValue(undefined)}
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((s) => (
              <DropdownMenuItem
                key={s}
                className="capitalize"
                onClick={() => table.getColumn("status")?.setFilterValue(s)}
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  className="capitalize"
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Details dialog — outside dropdown */}
      <SubmissionDetails
        submission={selectedSubmission}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
       <DeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Submission?"
        description={`"Submission with ID ${deleteTarget?.id}" will be permanently deleted.`}
      />
    </div>
  );
}