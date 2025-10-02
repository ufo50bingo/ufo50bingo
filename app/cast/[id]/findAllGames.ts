import { Game, GAME_NAMES, GoalName, ORDERED_PROPER_GAMES } from "@/app/goals";
import { TBoard } from "@/app/matches/parseBingosyncData";
import { GOAL_TO_TYPES } from "./goalToTypes";

export default function findAllGames(
    board: TBoard,
): Set<Game> {
    const games = new Set<Game>();
    board.forEach(square => {
        const game = GOAL_TO_TYPES[square.name][0];
        if (game == null) {
            return;
        }
        if (game !== 'general') {
            games.add(game);
            return;
        }
        if (square.name.includes('Campanella 1/2/3')) {
            games.add('campanella');
            games.add('campanella2');
            games.add("campanella3");
        }
        const strippedGoal = square.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        ORDERED_PROPER_GAMES.forEach(name => {
            if (strippedGoal.includes(name)) {
                games.add(name);
            }
        });
    });
    return games;
}