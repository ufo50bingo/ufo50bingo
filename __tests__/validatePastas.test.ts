import validateUfo from "@/app/generator/validateUfo";
import { METADATA } from "@/app/pastas/metadata"

const PASTAS = METADATA.filter(d => d.type === "UFO");

describe.each(PASTAS)('validate $name', ({ pasta }) => {
  it('Has no errors', () => {
    const result = validateUfo(pasta);
    expect(result.errors).toEqual([]);
  })
});
