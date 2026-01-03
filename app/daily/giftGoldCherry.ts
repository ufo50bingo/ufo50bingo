import { StandardGeneral } from "../pastas/pastaTypes";

export function isGift(goal: StandardGeneral): boolean {
  return goal === "Collect {{gift_count}} gifts from games on this card";
}

export function isGoldCherry(goal: StandardGeneral): boolean {
  return (
    goal === "Collect {{cherry_count}} cherry disks from games on this card" ||
    goal === "Collect {{gold_count}} gold disks from games on this card"
  );
}
