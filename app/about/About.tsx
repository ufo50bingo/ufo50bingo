"use client";

import Link from "next/link";
import { Card, Container, Divider, List, Title } from "@mantine/core";
import Board from "../Board";
import { useState } from "react";
import { BingosyncColor, TBoard } from "../matches/parseBingosyncData";

const COLOR: BingosyncColor = "red";

type Props = {
  initialBoard: TBoard;
};

export default function About({ initialBoard }: Props) {
  const [isHidden, setIsHidden] = useState(true);
  const [board, setBoard] = useState<TBoard>(initialBoard);

  return (
    <Container my="md">
      <Card
        style={{ alignItems: "flex-start" }}
        shadow="sm"
        padding="sm"
        radius="md"
        withBorder
      >
        <Title order={1}>Welcome to UFO 50 Bingo!</Title>
        <Divider my="md" />
        <Title order={2}>How to Play</Title>
        <p>
          UFO 50 Bingo is a new way to play UFO 50 competitively with other
          players!
          <br />
          When you first join a game, you will be presented with a hidden board.
          Once all players are ready, everyone should reveal the board
          simultaneously. For example, you might see a board like this:
        </p>
        <div style={{ alignSelf: "center" }}>
          <Board
            board={board}
            onClickSquare={(squareIndex: number) => {
              const newBoard = [...board];
              const newSquare = { ...board[squareIndex] };
              newSquare.color = newSquare.color === "blank" ? COLOR : "blank";
              newBoard[squareIndex] = newSquare;
              setBoard(newBoard);
            }}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
            showDifficulty={false}
          />
        </div>
        <p>
          After revealing the board you will have one minute to plan your
          strategy, then your match starts!
          <br />
          When the match starts, you can choose to attempt any goal on the card.
          Once you've completed a goal, click on the corresponding square in the
          grid to claim it with your color. The standard "Lockout" ruleset
          allows only one player to claim a square, so your opponent can never
          steal the square from you.
        </p>
        <p>
          During play, you are allowed to use any resources you like! The only
          restriction is that you're not allowed to view your opponent's
          gameplay stream.
          <br />
          In particular, the community maintains a{" "}
          <a
            href="https://docs.google.com/document/d/1RK6UH8mte79lF7yobr9yvkdpMHINBRBRV3hjJVb4MIk/edit?tab=t.0#heading=h.49ykwvj25bpo"
            target="_blank"
          >
            Resources document
          </a>{" "}
          with strategies for most games!
        </p>
        <p>You win the match by:</p>
        <List>
          <List.Item>
            Making a Bingo by marking all 5 squares in a row, column, or
            diagonal
          </List.Item>
          <List.Item>
            Claiming your 13th square (only if your opponent has no possible
            Bingo available)
          </List.Item>
          <List.Item>
            The pre-agreed time (usually 1 hour and 45 minutes) expires, and
            either
            <List>
              <List.Item>
                You have claimed more squares than your opponent
              </List.Item>
              <List.Item>
                Or if you and your opponent are tied, the player who most
                recently claimed a square loses
              </List.Item>
            </List>
          </List.Item>
        </List>
        <p>
          For more information, see the{" "}
          <Link href="https://docs.google.com/document/d/1VRHljWeJ3lHuN3ou-9R0kMgwoZeCcaEPBsRCI1nWEig/edit?tab=t.0#heading=h.us0d6jom1jp">
            official UFO 50 Bingo Rules
          </Link>
          .
        </p>
        <Title order={2}>How to Create Matches</Title>
        <p>Creating a standard match is simple!</p>
        <List type="ordered">
          <List.Item>
            Go to the <Link href="/">Create Match</Link> tab
          </List.Item>
          <List.Item>Click on "Non-League"</List.Item>
          <List.Item>Enter a Room Name and Password.</List.Item>
          <List.Item>Click "Create Bingosync Board"</List.Item>
          <List.Item>
            Your browser will open a new tab on bingosync.com. Copy the URL and
            send it to your opponent, along with the password you chose.
          </List.Item>
          <List.Item>
            Enter your desired name and the password you chose earlier to join
            the room.
          </List.Item>
          <List.Item>
            Follow the instructions above to play your game!
          </List.Item>
        </List>
        <br />
        <Title order={2}>Variants and Customization</Title>
        <p>
          Most players use the Standard variant (goal list), but UFO 50 Bingo
          supports other variants as well. Hover over the names of variants on
          the Non-League section of the <Link href="/">Create Match</Link> tab
          to explore them!
        </p>
        <p>
          In addition to selecting alternate goal lists, the "Customize game and
          difficulty counts" checkbox on the Non-League section of the{" "}
          <Link href="/">Create Match</Link> tab allows you to change which
          goals will appear in your match. You can choose games to
          include/exclude from your match, or update the difficulty distribution
          to have an easier or harder match than usual.
        </p>
        <Title order={2}>Practice Tools</Title>
        <p>
          If you want to practice goals on your own, you can either use the
          Non-League section of the <Link href="/">Create Match</Link> tab to
          create a board for yourself, or use the{" "}
          <Link href="/practice">Practice</Link> tab, which automatically
          selects goals for you to attempt with built-in stat tracking.
        </p>
        <p>
          The <Link href="goals">All Goals</Link> tab contains the full list of
          Standard Bingo goals. From this tab, you can
        </p>
        <List>
          <List.Item>View your stats for every goal</List.Item>
          <List.Item>
            Uncheck goals to remove them from the{" "}
            <Link href="/practice">Practice</Link> tab goal selection
          </List.Item>
          <List.Item>
            Immediately attempt a goal by clicking the blue "Play" button
          </List.Item>
          <List.Item>
            Add a goal to your Playlist by clicking the green "Add to Playlist"
            button
          </List.Item>
        </List>
        <p>
          You can also use the <Link href="/settings">Settings</Link> tab to
          change how practice goals are selected, back up your stats, or change
          to dark mode.
        </p>
      </Card>
    </Container>
  );
}
