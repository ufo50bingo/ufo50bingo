import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

export const files = new Files({ adapter: neon({ bucket: "pastas" }) });
