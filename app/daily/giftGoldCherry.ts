import { StandardGeneral } from "../pastas/pastaTypes";

export function isGift(goal: StandardGeneral): boolean {
  return goal === "Collect {{gift_count}} gifts from games on this card";
}

export function isGoldCherry(goal: StandardGeneral): boolean {
  return (
    goal === "Cherry disk {{cherry_count}} games on this card" ||
    goal === "Gold disk {{gold_count}} games on this card"
  );
}
