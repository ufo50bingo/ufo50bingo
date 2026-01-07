import { JSONContent } from "@tiptap/react";

export default function getRTContent(
  content: string | null | undefined
): JSONContent | null {
  if (content == null || content === "") {
    return null;
  }
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    // assume it's plain text
    const finalContent: JSONContent[] = [];
    content.split("\n").forEach((text) => {
      if (text !== "") {
        finalContent.push({
          type: "paragraph",
          content: [{ type: "text", text }],
        });
      } else {
        finalContent.push({
          type: "paragraph",
        });
      }
    });
    return { type: "doc", content: finalContent };
  }
}
