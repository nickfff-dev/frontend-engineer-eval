"use client";
import {
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { getTaskTypeLabel } from "@/lib/mock-data";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { buildColumns } from "./build-columns";
import type { Task, TaskType } from "@/types/types";
import { useDeleteTask, useEditTask, useTasks } from "@/hooks/use-tasks";
import { SkeletonTable } from "../table-skeleton";
import { ErrorOccurred } from "../error-view";
import { toast } from "sonner";
import { DeleteAlert } from "../delete-modal";
import { BulkEditBar } from "../bulk-edit-bar";

// ── helpers ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["active", "completed", "archived"] as const;


// ── main table component ──────────────────────────────────────────────────────
export default function TaskTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [isBulkPending, setIsBulkPending] = React.useState(false);

    const [deleteTarget, setDeleteTarget] = React.useState<Task | null>(null)
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const { data, isPending, isError } = useTasks();


    const { mutate: deleteTask } = useDeleteTask();
    const { mutateAsync: editTask } = useEditTask();

    const handleDeleteClick = React.useCallback((task: Task) => {
        setDeleteTarget(task)
        setDeleteOpen(true)
    }, [])

    const handleDeleteConfirm = React.useCallback(() => {
        if (!deleteTarget) return
        deleteTask(deleteTarget.id, {
            onSuccess: () => {
                toast.success("Task deleted")
                setDeleteOpen(false)
                setDeleteTarget(null)
            },
            onError: () => toast.error("Failed to delete task"),
        })
    }, [deleteTarget, deleteTask])

    const columns = React.useMemo(
        () => buildColumns(handleDeleteClick),
        [handleDeleteClick]
    )

    // ── derive unique type options from data ─────────────────────────────────────
    const typeOptions = React.useMemo<string[]>(() => {
        if (!data) return [];
        return Array.from(new Set(data.map((t) => t.type)));
    }, [data]);

    // ── client-side filtering (status + type; title handled by tanstack) ─────────
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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {

            pagination: { pageSize: 6 }
        }
    });


    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const handleBulkApply = React.useCallback(
        async (changes: { amount?: number; campaignId?: string }) => {
            if (!selectedRows.length) return
            setIsBulkPending(true)
            try {
                await Promise.all(
                    selectedRows.map((row) =>
                        editTask({ id: row.original.id, data: changes })
                    )
                )
                toast.success(`Updated ${selectedRows.length} task${selectedRows.length > 1 ? "s" : ""}`)
                table.resetRowSelection()
            } catch {
                toast.error("Some updates failed")
            } finally {
                setIsBulkPending(false)
            }
        },
        [selectedRows, editTask, table]
    )
    if (isPending) return <SkeletonTable />;
    if (isError) return <ErrorOccurred />;
    return (
        <div className="w-full space-y-4">
            {/* ── Filters bar ────────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Title search */}
                <Input
                    className="max-w-xs"
                    placeholder="Search by title…"
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
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
                        <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue(undefined)}>
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

                {/* Type filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {table.getColumn("type")?.getFilterValue()
                                ? getTaskTypeLabel(table.getColumn("type")?.getFilterValue() as TaskType)
                                : "All Types"}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => table.getColumn("type")?.setFilterValue(undefined)}>
                            All Types
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {typeOptions.map((t) => (
                            <DropdownMenuItem
                                key={t}
                                onClick={() => table.getColumn("type")?.setFilterValue(t)}
                            >
                                {getTaskTypeLabel(t as TaskType)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* Column visibility */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="ml-auto" variant="outline">
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
            {/* ✅ Bulk edit bar — only visible when rows are selected */}
            {selectedRows.length > 0 && (
                <BulkEditBar
                    selectedCount={selectedRows.length}
                    onApply={handleBulkApply}
                    onClear={() => table.resetRowSelection()}
                    isPending={isBulkPending}
                />
            )}
            {/* ── Table ──────────────────────────────────────────────────────────── */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
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

            {/* ── Pagination ─────────────────────────────────────────────────────── */}
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

            <DeleteAlert
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Task?"
                description={`Task "${deleteTarget?.title}" will be permanently deleted along with all its submissions.`}
            />
        </div>
    );
}
