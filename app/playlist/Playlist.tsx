"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { IconGripVertical, IconPlaylistAdd, IconX } from "@tabler/icons-react";
import { ActionIcon, Container, Table } from "@mantine/core";
import { useAppContext } from "../AppContextProvider";
import { db } from "../db";
import { PRIORITY_MULTIPLIER } from "../PlaylistAddButton";
import LinkWithVariant from "../links/LinkWithVariant";
import { Metadata } from "next";

export default function Playlist() {
    const { playlist } = useAppContext();
    return (
        <Container my="md">
            {playlist.length > 0 ? (
                <DragDropContext
                    onDragEnd={async ({ destination, source }) => {
                        const destIndex = destination?.index ?? 0;
                        const sourceIndex = source.index;

                        if (destIndex === sourceIndex) {
                            return;
                        }

                        const destItemWillBeAboveDroppedItem = sourceIndex > destIndex;
                        const lowerIndex = destItemWillBeAboveDroppedItem
                            ? destIndex - 1
                            : destIndex;
                        const upperIndex = destItemWillBeAboveDroppedItem
                            ? destIndex
                            : destIndex + 1;

                        const lowerPriority =
                            lowerIndex < 0 ? 0 : playlist[lowerIndex].priority;

                        const upperPriority =
                            upperIndex >= playlist.length
                                ? playlist[playlist.length - 1].priority + PRIORITY_MULTIPLIER
                                : playlist[upperIndex].priority;

                        // technically if you reordered a playlist enough you could have diff = 0 due to floating point
                        // rounding, but it's not worth dealing with
                        await db.playlist.update(playlist[sourceIndex].id, {
                            priority: (upperPriority + lowerPriority) / 2,
                        });
                    }}
                >
                    <Table striped highlightOnHover withTableBorder>
                        <Droppable droppableId="dnd-list" direction="vertical">
                            {(provided) => (
                                <Table.Tbody
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {playlist.map((row, idx) => {
                                        return (
                                            <Draggable
                                                key={row.id}
                                                index={idx}
                                                draggableId={row.id.toString()}
                                            >
                                                {(provided) => (
                                                    <Table.Tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                    >
                                                        <Table.Td>
                                                            <div {...provided.dragHandleProps}>
                                                                <IconGripVertical size={16} />
                                                            </div>
                                                        </Table.Td>
                                                        <Table.Td>{idx + 1}</Table.Td>
                                                        <Table.Td>{row.goal}</Table.Td>
                                                        <Table.Td>
                                                            <ActionIcon
                                                                onClick={() => db.playlist.delete(row.id)}
                                                                color="red"
                                                            >
                                                                <IconX size={16} />
                                                            </ActionIcon>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </Table.Tbody>
                            )}
                        </Droppable>
                    </Table>
                </DragDropContext>
            ) : (
                <>
                    Your playlist is empty! Add goals to your playlist by clicking{" "}
                    <ActionIcon onClick={() => { }} color="green">
                        <IconPlaylistAdd size={16} />
                    </ActionIcon>{" "}
                    on the <LinkWithVariant href="/goals">All Goals</LinkWithVariant> or{" "}
                    <LinkWithVariant href="/practice">Practice</LinkWithVariant> tabs.
                </>
            )}
        </Container>
    );
}
