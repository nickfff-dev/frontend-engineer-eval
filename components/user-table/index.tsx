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
import { useDeleteUser, useEditUser, useUsers } from "@/hooks/use-users";
import { buildColumns } from "./build-columns";
import { UserDetails } from "./user-details";
import type { User, UserRole } from "@/types/types";
import { SkeletonTable } from "../table-skeleton";
import { ErrorOccurred } from "../error-view";
import { toast } from "sonner";
import { DeleteAlert } from "../delete-modal";
import { UserBulkEditBar } from "../bulk-actions/bulk-edit-bar";


const STATUS_OPTIONS: User["status"][] = ["active", "inactive"];
const ROLE_OPTIONS: UserRole[] = ["admin", "worker"];

export default function UserTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isBulkPending, setIsBulkPending] = React.useState(false);

  const handleView = React.useCallback((user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((user: User) => {
    setDeleteTarget(user)
    setDeleteOpen(true)
  }, [])

  const { mutate: deleteUser } = useDeleteUser();
  const { mutateAsync: editUser } = useEditUser();

  const handleDeleteConfirm = React.useCallback(() => {
    if (!deleteTarget) return
    deleteUser(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Task deleted")
        setDeleteOpen(false)
        setDeleteTarget(null)
      },
      onError: () => toast.error("Failed to delete task"),
    })
  }, [deleteTarget, deleteUser])

  const columns = React.useMemo(
    () => buildColumns(handleView, handleDeleteClick),
    [handleView, handleDeleteClick]
  )

  const { data, isPending, isError } = useUsers();

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
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkApply = React.useCallback(
    async (changes: { role?: UserRole; status?: User["status"] }) => {
      if (!selectedRows.length) return
      setIsBulkPending(true)
      try {
        await Promise.all(
          selectedRows.map((row) =>
            editUser({ id: row.original.id, data: changes })
          )
        )
        toast.success(`Updated ${selectedRows.length} user${selectedRows.length > 1 ? "s" : ""}`)
        table.resetRowSelection()
      } catch {
        toast.error("Some updates failed")
      } finally {
        setIsBulkPending(false)
      }
    },
    [selectedRows, editUser, table]
  )
  if (isPending) return <SkeletonTable />;
  if (isError) return <ErrorOccurred />;

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Name search */}
        <Input
          className="max-w-xs"
          placeholder="Search by name…"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value || undefined)
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

        {/* Role filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="capitalize">
              {(table.getColumn("role")?.getFilterValue() as string) ?? "All Roles"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => table.getColumn("role")?.setFilterValue(undefined)}
            >
              All Roles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {ROLE_OPTIONS.map((r) => (
              <DropdownMenuItem
                key={r}
                className="capitalize"
                onClick={() => table.getColumn("role")?.setFilterValue(r)}
              >
                {r}
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
      {selectedRows.length > 0 && (
        <UserBulkEditBar
          selectedCount={selectedRows.length}
          onApply={handleBulkApply}
          onClear={() => table.resetRowSelection()}
          isPending={isBulkPending}
        />
      )}
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
      <UserDetails
        user={selectedUser}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <DeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Task?"
        description={`"${deleteTarget?.name}" will be permanently deleted along with all its submissions.`}
      />
    </div>
  );
}