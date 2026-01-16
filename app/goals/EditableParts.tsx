import { Menu } from "@mantine/core";
import { BaseToken, Plain, ResolvedToken } from "../generator/splitAtTokens";
import { STANDARD_UFO } from "../pastas/standardUfo";
import { UFOPasta } from "../generator/ufoGenerator";
import { useAppContext } from "../AppContextProvider";
import { SPICY_UFO } from "../pastas/spicyUfo";

type Props = {
  parts: ReadonlyArray<Plain | BaseToken | ResolvedToken>;
  setParts: (
    newParts: ReadonlyArray<Plain | BaseToken | ResolvedToken>
  ) => unknown;
  canClear: boolean;
};

export default function EditableParts({ parts, setParts, canClear }: Props) {
  const { practiceVariant } = useAppContext();
  const pastas: ReadonlyArray<UFOPasta> = practiceVariant === "Standard" ? [STANDARD_UFO, SPICY_UFO] : [SPICY_UFO, STANDARD_UFO];
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "plain") {
          return <span key={index}>{part.text}</span>;
        } else {
          const content =
            part.type === "resolved" ? part.text : "{{" + part.token + "}}";
          let options: ReadonlyArray<string> = [];
          for (const pasta of pastas) {
            let tempOptions = pasta.tokens[part.token];
            if (tempOptions != null) {
              options = tempOptions;
              break;
            }
          }
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
                {options.map((value) => (
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
