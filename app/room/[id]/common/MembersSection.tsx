import { Accordion, Group, List, Stack, Text } from "@mantine/core";
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
import { IconGripVertical } from "@tabler/icons-react";
import { CasterMember, PlayerMember } from "./useMembers";
import addPlayerOrder from "../cast/addPlayerOrder";

interface Props {
  gameId: number;
  players: ReadonlyArray<PlayerMember>;
  casters: ReadonlyArray<CasterMember>;
  isMobile: boolean;
  isCast: boolean;
}

function SortablePlayer({ player }: { player: PlayerMember }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.userId.toString() });

  return (
    <Group
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          display: "flex",
        }}
      >
        <IconGripVertical size={16} />
      </div>
      <span>{player.name}</span>
    </Group>
  );
}

export default function MembersSection({ gameId, players, casters }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const sourceIndex = players.findIndex(
      (p) => p.userId.toString() === active.id,
    );
    const destIndex = players.findIndex((p) => p.userId.toString() === over.id);
    const newPlayers = arrayMove([...players], sourceIndex, destIndex);

    await addPlayerOrder(
      gameId,
      newPlayers.map((p) => p.userId),
    );
  };

  return (
    <Accordion.Item value="members">
      <Accordion.Control>Members</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Text>Players</Text>
          <DndContext
            id={`members-dnd-${gameId}`}
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={players.map((p) => p.userId.toString())}
              strategy={verticalListSortingStrategy}
            >
              <Stack>
                {players.map((player) => (
                  <SortablePlayer key={player.userId} player={player} />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
          <Text>Casters</Text>
          <List>
            {casters.map((p) => (
              <List.Item key={p.userId}>{p.name}</List.Item>
            ))}
          </List>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
