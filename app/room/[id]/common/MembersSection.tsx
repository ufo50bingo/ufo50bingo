import { Accordion, Group, List, Stack, Text } from "@mantine/core";
import { CasterMember, PlayerMember } from "./useMembers";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { IconGripVertical } from "@tabler/icons-react";

interface Props {
  gameId: number;
  players: ReadonlyArray<PlayerMember>;
  casters: ReadonlyArray<CasterMember>;
  isMobile: boolean;
  isCast: boolean;
}

export default function MembersSection({
  gameId,
  players,
  casters,
  isMobile,
}: Props) {
  return (
    <>
      <Accordion.Item value="members">
        <Accordion.Control>Members</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Text>Players</Text>
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

                console.log(destIndex, sourceIndex, lowerIndex, upperIndex);
              }}
            >
              <Droppable droppableId="dnd-list" direction="vertical">
                {(provided) => (
                  <Stack {...provided.droppableProps} ref={provided.innerRef}>
                    {players.map((player, idx) => {
                      return (
                        <Draggable
                          key={player.userId}
                          index={idx}
                          draggableId={player.userId.toString()}
                        >
                          {(provided, snapshot) => (
                            <Group
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: snapshot.isDragging
                                  ? "red"
                                  : "transparent",
                                padding: 8,
                                zIndex: snapshot.isDragging ? 9999 : undefined,
                              }}
                            >
                              <div {...provided.dragHandleProps}>
                                <IconGripVertical size={16} />
                              </div>
                              <span>{player.name}</span>
                            </Group>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </DragDropContext>
            <Text>Casters</Text>
            <List>
              {casters.map((p) => (
                <List.Item key={p.userId}>{p.name}</List.Item>
              ))}
            </List>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </>
  );
}
