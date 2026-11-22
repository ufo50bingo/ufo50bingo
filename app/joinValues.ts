import { NeonQueryFunction, NeonQueryPromise } from "@neondatabase/serverless";

export default function joinValues(
  sql: NeonQueryFunction<false, false>,
  values: ReadonlyArray<
    NeonQueryPromise<false, false, Record<string, unknown>[]>
  >,
): NeonQueryPromise<false, false, Record<string, unknown>[]> {
  if (values.length === 0) {
    throw new Error("Expected nonempty values");
  }
  let acc = values[values.length - 1];
  for (let i = values.length - 2; i >= 0; i--) {
    acc = sql`${values[i]}, ${acc}`;
  }
  return acc;
}
