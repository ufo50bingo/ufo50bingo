import { Menu } from "@mantine/core";
import { BaseToken, Plain, ResolvedToken } from "../generator/splitAtTokens";
import { STANDARD_UFO } from "../pastas/standardUfo";
import { UFOPasta } from "../generator/ufoGenerator";

type Props = {
  parts: ReadonlyArray<Plain | BaseToken | ResolvedToken>;
  setParts: (
    newParts: ReadonlyArray<Plain | BaseToken | ResolvedToken>
  ) => unknown;
  canClear: boolean;
};

export default function EditableParts({ parts, setParts, canClear }: Props) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "plain") {
          return <span key={index}>{part.text}</span>;
        } else {
          const content =
            part.type === "resolved" ? part.text : "{{" + part.token + "}}";
          return (
            <Menu shadow="md" width="auto" trigger="click-hover" key={index}>
              <Menu.Target>
                <a
                  key={index}
                  href="#"
                  style={{ textDecoration: "none" }}
                  onClick={(event) => {
                    event.preventDefault();
                  }}
                >
                  {content}
                </a>
              </Menu.Target>
              <Menu.Dropdown>
                {canClear && (
                  <Menu.Item
                    onClick={() => {
                      const newPart: BaseToken = {
                        type: "token",
                        token: part.token,
                      };
                      const newParts = parts.toSpliced(index, 1, newPart);
                      setParts(newParts);
                    }}
                  >
                    {`{{${part.token}}}`}
                  </Menu.Item>
                )}
                {(STANDARD_UFO as UFOPasta).tokens[part.token].map((value) => (
                  <Menu.Item
                    key={value}
                    onClick={() => {
                      const newPart: ResolvedToken = {
                        type: "resolved",
                        token: part.token,
                        text: value,
                      };
                      const newParts = parts.toSpliced(index, 1, newPart);
                      setParts(newParts);
                    }}
                  >
                    {value}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          );
        }
      })}
    </>
  );
}
