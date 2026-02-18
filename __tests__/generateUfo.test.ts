import addPrefixToPasta from "@/app/generator/addPrefixToPasta";
import ufoGenerator from "@/app/generator/ufoGenerator";
import { METADATA } from "@/app/pastas/metadata";
import { mockRandom, restoreRandom } from "./__utils__/mockRandom";

const PASTAS = METADATA.filter((d) => d.type === "UFO");

describe.each(PASTAS)("generate for $name", ({ pasta }) => {
  it("generates a fixed board", () => {
    mockRandom();
    const board = ufoGenerator(pasta);
    expect(
      board.every(
        (goal) => goal != null && goal !== "ERROR: Failed to find goal",
      ),
    ).toBe(true);
    restoreRandom();
  });
  it("matches board generated with prefix", () => {
    const prefixPasta = addPrefixToPasta(pasta, "Prf");
    mockRandom();
    const normalBoard = ufoGenerator(pasta);
    mockRandom();
    const prefixBoard = ufoGenerator(prefixPasta);
    expect(prefixBoard).toEqual(normalBoard);
    restoreRandom();
  });
});
