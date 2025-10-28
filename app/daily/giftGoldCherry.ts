import { GoalName } from "../goals";

export function isGift(goal: GoalName): boolean {
  switch (goal) {
    case "Collect 6 gifts from games on this card":
    case "Collect 7 gifts from games on this card":
    case "Collect 8 gifts from games on this card":
      return true;
    default:
      return false;
  }
}

export function isGoldCherry(goal: GoalName): boolean {
  switch (goal) {
    case "Collect 2 cherry disks from games on this card":
    case "Collect 3 cherry disks from games on this card":
    case "Collect 3 gold disks from games on this card":
    case "Collect 4 gold disks from games on this card":
      return true;
    default:
      return false;
  }
}