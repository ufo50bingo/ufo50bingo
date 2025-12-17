const REQUIRED_KEYS = ["goals", "tokens", "category_counts"];
const OPTIONAL_KEYS = [
  "categories_with_global_group_repeat_prevention",
  "category_difficulty_tiers",
];

export default function validateUfo(json: string): Array<string> {
  try {
    const parsed = JSON.parse(json);
    if (!isObject(parsed)) {
      return ["Expected a top-level object"];
    }
    const validationErrors: Array<string> = [];
    const keys = Object.keys(parsed);
    const missingRequiredKeys = REQUIRED_KEYS.filter(
      (key) => !keys.includes(key)
    );
    if (missingRequiredKeys.length > 0) {
      validationErrors.push(
        `Missing required top-level keys: ${missingRequiredKeys}`
      );
    }
    const extraKeys = keys.filter(
      (key) => !REQUIRED_KEYS.includes(key) && !OPTIONAL_KEYS.includes(key)
    );
    if (extraKeys.length > 0) {
      validationErrors.push(`Unsupported top-level keys found: ${extraKeys}`);
    }
    return validationErrors;
  } catch {
    return ["Failed to parse JSON"];
  }
}

function isObject(item: unknown): boolean {
  return typeof item === "object" && !Array.isArray(item) && item != null;
}
