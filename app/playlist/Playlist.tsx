"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical, IconPlaylistAdd, IconX } from "@tabler/icons-react";
import { ActionIcon, Container, Table } from "@mantine/core";
import { useMemo, useState } from "react";
import { useAppContext } from "../AppContextProvider";
import { db, PlaylistRow } from "../db";
import { PRIORITY_MULTIPLIER } from "../PlaylistAddButton";
import LinkWithVariant from "../links/LinkWithVariant";

function SortableRow({ row, index }: { row: PlaylistRow; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id.toString() });

  return (
    <Table.Tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <Table.Td>
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          <IconGripVertical size={16} />
        </div>
      </Table.Td>
      <Table.Td>{index + 1}</Table.Td>
      <Table.Td>{row.goal}</Table.Td>
      <Table.Td>
        <ActionIcon onClick={() => db.playlist.delete(row.id)} color="red">
          <IconX size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

export default function Playlist() {
  const { playlist } = useAppContext();
  // needed to make sure the items don't jump around while we wait for the dexie save
  const [dropped, setDropped] = useState<null | {
    playlist: ReadonlyArray<PlaylistRow>;
    rows: ReadonlyArray<PlaylistRow>;
  }>(null);
  const rows = useMemo(
    () =>
      dropped != null && dropped.playlist === playlist
        ? dropped.rows
        : playlist,
    [dropped, playlist],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (over == null || active.id === over.id) {
      return;
    }
    const sourceIndex = rows.findIndex(
      (row) => row.id.toString() === active.id,
    );
    const destIndex = rows.findIndex((row) => row.id.toString() === over.id);
    if (sourceIndex < 0 || destIndex < 0) {
      return;
    }
    setDropped({
      playlist,
      rows: arrayMove([...rows], sourceIndex, destIndex),
    });

    // the moved goal gets a priority between its new neighbors'
    const destItemWillBeAboveDroppedItem = sourceIndex > destIndex;
    const lowerIndex = destItemWillBeAboveDroppedItem
      ? destIndex - 1
      : destIndex;
    const upperIndex = destItemWillBeAboveDroppedItem
      ? destIndex
      : destIndex + 1;

    const lowerPriority = lowerIndex < 0 ? 0 : rows[lowerIndex].priority;

    const upperPriority =
      upperIndex >= rows.length
        ? rows[rows.length - 1].priority + PRIORITY_MULTIPLIER
        : rows[upperIndex].priority;

    // technically if you reordered a playlist enough you could have diff = 0 due to floating point
    // rounding, but it's not worth dealing with
    await db.playlist.update(rows[sourceIndex].id, {
      priority: (upperPriority + lowerPriority) / 2,
    });
  };

  return (
    <Container my="md">
      {playlist.length > 0 ? (
        <DndContext
          id="playlist-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rows.map((row) => row.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <Table striped highlightOnHover withTableBorder>
              <Table.Tbody>
                {rows.map((row, index) => (
                  <SortableRow key={row.id} row={row} index={index} />
                ))}
              </Table.Tbody>
            </Table>
          </SortableContext>
        </DndContext>
      ) : (
        <>
          Your playlist is empty! Add goals to your playlist by clicking{" "}
          <ActionIcon onClick={() => {}} color="green">
            <IconPlaylistAdd size={16} />
          </ActionIcon>{" "}
          on the{" "}
          <LinkWithVariant prefetch={false} href="/goals">
            All Goals
          </LinkWithVariant>{" "}
          or{" "}
          <LinkWithVariant prefetch={false} href="/practice">
            Practice
          </LinkWithVariant>{" "}
          tabs.
        </>
      )}
    </Container>
  );
}
