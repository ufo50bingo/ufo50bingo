import { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { useMemo } from "react";
import classes from "./RTView.module.css";

type Props = {
  content: JSONContent;
};

export default function RTView({ content }: Props) {
  const element = useMemo(
    () =>
      renderToReactElement({
        extensions: [StarterKit],
        content,
      }),
    [content]
  );
  return (
    <div className={classes.Typography + " " + classes.content}>{element}</div>
  );
}
