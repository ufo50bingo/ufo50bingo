import {
  Accordion,
  Button,
  ColorSwatch,
  Group,
  Stack,
  Text,
} from "@mantine/core";
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
import { CasterMember, PlayerMember } from "./useMembers";
import { FeedMember, FeedPlayerOrder, NewFeedItem } from "@/app/fetchFeed";
import { useServerOffsetContext } from "../ServerOffsetContext";
import getColorHex from "../cast/getColorHex";
import { UserTokenizer } from "@/app/UserTokenizer";
import { BasicUser } from "@/app/api/users/route";
import { useMemo, useState } from "react";

interface Props {
  players: ReadonlyArray<PlayerMember>;
  casters: ReadonlyArray<CasterMember>;
  isMobile: boolean;
  isCast: boolean;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
}

function SortablePlayer({ player }: { player: PlayerMember }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.userId.toString() });

  return (
    <Group
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <ColorSwatch color={getColorHex(player.color)} size={14} />
      <span>{player.name}</span>
    </Group>
  );
}

export default function CasterMembersSection({
  players,
  casters,
  sendEvents,
}: Props) {
  const { getServerMsFromClientMs } = useServerOffsetContext();
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
    const event: FeedPlayerOrder = {
      type: "player_order",
      time: getServerMsFromClientMs(Date.now()) / 1000,
      orderedIds: newPlayers.map((p) => p.userId),
    };
    await sendEvents([event]);
  };

  const [playersToAdd, setPlayersToAdd] = useState<ReadonlyArray<BasicUser>>(
    [],
  );
  const selectedUserIds = useMemo(
    () => playersToAdd.map((p) => p.userId),
    [playersToAdd],
  );
  const excludedUserIds = useMemo(
    () => players.map((p) => p.userId).concat(casters.map((c) => c.userId)),
    [players, casters],
  );
  const [isSending, setIsSending] = useState(false);

  return (
    <Accordion.Item value="members">
      <Accordion.Control>Members</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Text>
            <strong>Players</strong>
          </Text>
          <Text size="sm">
            Drag and drop to sort the player list. The first player's tracker
            info will be on the left side, and the second player's tracker info
            will be on the right.
          </Text>
          <DndContext
            id="members-dnd"
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
          <Stack gap={4}>
            <UserTokenizer
              label="Add players"
              selectedUserIds={selectedUserIds}
              onChange={setPlayersToAdd}
              excludedIds={excludedUserIds}
            />
            {playersToAdd.length > 0 && (
              <Group gap={8} justify="end">
                <Button
                  disabled={isSending}
                  size="xs"
                  color="red"
                  onClick={() => setPlayersToAdd([])}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSending}
                  size="xs"
                  color="green"
                  onClick={async () => {
                    const time = getServerMsFromClientMs(Date.now()) / 1000;
                    const events: ReadonlyArray<FeedMember> = playersToAdd.map(
                      (p) => ({
                        type: "member",
                        userId: p.userId,
                        time,
                        // TODO: use favorite color
                        playerColor: "red",
                        isInvite: true,
                        name: p.name,
                        overrideName: null,
                      }),
                    );
                    try {
                      setIsSending(true);
                      const success = await sendEvents(events);
                      if (success) {
                        setPlayersToAdd([]);
                      }
                    } finally {
                      setIsSending(false);
                    }
                  }}
                >
                  Add
                </Button>
              </Group>
            )}
          </Stack>
          <Text>
            <strong>Casters</strong>
          </Text>
          <Stack>
            {casters.map((c) => (
              <span key={c.userId}>{c.name}</span>
            ))}
          </Stack>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
