import PlayedGame from "./PlayedGame";
import { CurrentGame } from "./useSyncedState";

type Props = {
    recentGames: ReadonlyArray<CurrentGame>;
    limit: number;
};

export default function RecentGames({ recentGames, limit }: Props) {
    const entries = recentGames.map((recentGame, index) => {
        const { game, start_time: startTime } = recentGame;
        if (game == null) {
            return null;
        }
        const endTime = index > 0
            ? recentGames[index - 1].start_time
            : null;
        return (
            <PlayedGame
                key={startTime}
                game={game}
                startTime={startTime}
                endTime={endTime}
            />
        );
    })
        .filter(entry => entry != null)
        .slice(0, limit);
    return <>{entries}</>;
}