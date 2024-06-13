import { expect, test } from "vitest";
import { sum } from "./sum";

test("sum", () => {
  expect(sum(1, 2)).toBe(3);
});
// test("sum", () => {
//   expect(sum(1, 2)).toBe(4);
// });
