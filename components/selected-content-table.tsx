'use client';

import * as React from 'react';
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconDotsVertical, IconGripVertical } from '@tabler/icons-react';
import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	Row,
	SortingState,
	useReactTable,
	VisibilityState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

export const schema = z.object({
	url: z.string(),
	type: z.string(),
	duration: z.string().optional(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
	const { attributes, listeners } = useSortable({
		id,
	});

	return (
		<Button
			{...attributes}
			{...listeners}
			variant="ghost"
			size="icon"
			className="text-muted-foreground size-7 hover:bg-transparent"
		>
			<IconGripVertical className="text-muted-foreground size-3" />
			<span className="sr-only">Arrastrá para reordernar</span>
		</Button>
	);
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.url,
	});

	return (
		<TableRow
			data-state={row.getIsSelected() && 'selected'}
			data-dragging={isDragging}
			ref={setNodeRef}
			className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map(cell => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}

export function SelectedContentTable({
	data: initialData,
	updateItemDuration,
}: {
	data: z.infer<typeof schema>[] | [];
	updateItemDuration: (url: string, value: string) => void;
}) {
	const [data, setData] = React.useState(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const sortableId = React.useId();
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {})
	);

	React.useEffect(() => {
		setData(initialData);
	}, [initialData]);

	const columns: ColumnDef<z.infer<typeof schema>>[] = [
		// {
		// 	id: 'drag',
		// 	header: () => null,
		// 	cell: ({ row }) => <DragHandle id={row.original.url} />,
		// },
		{
			accessorKey: 'image',
			header: 'Imagen',
			cell: ({ row }) => {
				return row.original.type.includes('image') ? (
					<div className="relative w-[100px] h-[70px]">
						<Image
							src={row.original.url}
							fill
							style={{ objectFit: 'contain' }}
							alt=""
							sizes="(max-width: 768px) 100vw, 25vw"
						/>
					</div>
				) : (
					<video
						key={row.original.url}
						src={row.original.url}
						width={'100%'}
						// controls
						className="w-[100px] object-cover"
					/>
				);
			},
		},
		{
			accessorKey: 'type',
			header: 'Tipo',
			cell: ({ row }) => (
				<div>
					<Badge variant={row.original.type.includes('image') ? 'secondary' : 'default'}>
						{row.original.type.includes('image') ? 'Imagen' : 'Video'}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: 'duration',
			header: () => <div className="w-full text-right">Duración</div>,
			cell: ({ row }) =>
				row.original.type !== 'video' && (
					<form
						onSubmit={e => {
							e.preventDefault();

							const formData = new FormData(e.currentTarget); // e.currentTarget is the <form>
							const value = formData.get(`${row.original.url}-limit`)?.toString() || '';
							updateItemDuration(row.original.url, value);

							toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
								loading: 'Guardando nueva duración',
								success: 'Done',
								error: 'Error',
							});
						}}
					>
						<Label
							htmlFor={`${row.original.url}-limit`}
							className="sr-only"
						>
							Limit
						</Label>
						<Input
							id={`${row.original.url}-limit`}
							name={`${row.original.url}-limit`}
							className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
							defaultValue={row.original.duration}
						/>
					</form>
				),
		},
		{
			id: 'actions',
			cell: () => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
							size="icon"
						>
							<IconDotsVertical />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-32"
					>
						<DropdownMenuItem>Edit</DropdownMenuItem>
						<DropdownMenuItem>Make a copy</DropdownMenuItem>
						<DropdownMenuItem>Favorite</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => data?.map(({ url }) => url) || [],
		[data]
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: row => row.url,
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setData(data => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToVerticalAxis]}
			onDragEnd={handleDragEnd}
			sensors={sensors}
			id={sortableId}
		>
			<Table>
				<TableHeader className="bg-muted sticky top-0 z-10">
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map(header => {
								return (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody className="**:data-[slot=table-cell]:first:w-8">
					{table.getRowModel().rows?.length ? (
						<SortableContext
							items={dataIds}
							strategy={verticalListSortingStrategy}
						>
							{table.getRowModel().rows.map(row => (
								<DraggableRow
									key={row.id}
									row={row}
								/>
							))}
						</SortableContext>
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</DndContext>
	);
}
