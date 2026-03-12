import { getTaskTypeLabel } from "@/lib/mock-data";
import { Task } from "@/types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { ArrowUpDown, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

const statusBadgeVariant: Record<
  Task["status"],
  "default" | "secondary" | "outline"
> = {
  active: "default",
  completed: "secondary",
  archived: "outline",
};


export function buildColumns(
  onView: (task: Task) => void,
  onDelete: (task: Task) => void
): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize text-sm">
          {getTaskTypeLabel(row.getValue("type"))}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Task["status"];
        return (
          <Badge variant={statusBadgeVariant[status]} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "campaignId",
      header: "Campaign ID",
      cell: ({ row }) => {
        return (
          <p>{row.getValue('campaignId')}</p>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
          className="px-0"
        >
          Amount <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(Number(row.getValue("amount")))}
        </div>
      ),
    },
    {
      accessorKey: "reward",
      header: ({ column }) => (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
          className="px-0"
        >
          Reward <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(Number(row.getValue("reward")))}
        </div>
      ),
    },
    {
      accessorKey: "submissionsReceived",
      header: ({ column }) => {
        return (
          <Button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            variant="ghost"
            className="px-0"
          >
            Submissions <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>)
      },
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("submissionsReceived")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(task.id)}
              >
                Copy Task ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* ✅ Trigger the lifted dialog via callback — no nested Dialog here */}
              <DropdownMenuItem onClick={() => onView(task)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task)}
                className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}