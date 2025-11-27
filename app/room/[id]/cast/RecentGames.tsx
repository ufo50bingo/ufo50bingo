import classes from "./PlayedGame.module.css";
import PlayedGame from "./PlayedGame";
import SideCell from "./SideCell";
import { CurrentGame } from "./useSyncedState";

type Props = {
    recentGames: ReadonlyArray<CurrentGame>;
    limit: number;
};

export default function RecentGames({ recentGames, limit }: Props) {
    const filtered = recentGames.filter((recentGame, index) => {
        const prevGame = index < recentGames.length - 1
            ? recentGames[index + 1]
            : null;
        return recentGame !== prevGame;
    });
    const entries = filtered.map((recentGame, index) => {
        const { game, start_time: startTime } = recentGame;
        if (game == null) {
            return null;
        }
        const endTime = index > 0
            ? filtered[index - 1].start_time
            : null;
        return (
            <SideCell key={startTime}>
                <PlayedGame
                    game={game}
                    startTime={startTime}
                    endTime={endTime}
                />
            </SideCell>
        );
    })
        .filter(entry => entry != null)
        .slice(0, limit);

    while (entries.length < limit) {
        entries.push(
            <SideCell key={entries.length}>
                <div className={classes.container}>
                    {/* TODO: cobwebs */}
                    <img src={`/games/attactics.png`} className={classes.gameIcon} />
                </div>
            </SideCell>
        );
    }
    return <>{entries}</>;
}