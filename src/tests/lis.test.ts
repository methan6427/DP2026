// ============================================================
// src/tests/lis.test.ts
//
// Automated test suite for computeLIS, computeLISTable, and
// generateRandomPermutation (utils/lis.ts).
//
// Runner: Vitest (vitest run)
// ============================================================

import { describe, it, expect } from "vitest";
import { computeLIS, generateRandomPermutation } from "../utils/lis";

// ── Helpers ─────────────────────────────────────────────────
function isStrictlyIncreasing(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] <= arr[i - 1]) return false;
  }
  return true;
}

function isSubsequenceOf(sub: number[], arr: number[]): boolean {
  let si = 0;
  for (let i = 0; i < arr.length && si < sub.length; i++) {
    if (arr[i] === sub[si]) si++;
  }
  return si === sub.length;
}

// ── computeLIS ───────────────────────────────────────────────
describe("computeLIS", () => {

  // ------ Project example (n=6) --------------------------------
  it("project example [2,6,3,5,4,1] — exact dp/parent/answer", () => {
    const r = computeLIS([2, 6, 3, 5, 4, 1]);
    expect(r.maxLEDs).toBe(3);
    expect(r.dp).toEqual([1, 2, 2, 3, 3, 1]);
    expect(r.parent).toEqual([-1, 0, 0, 2, 2, -1]);
  });

  it("project example — chosen chain is valid (increasing subsequence of L)", () => {
    const r = computeLIS([2, 6, 3, 5, 4, 1]);
    expect(r.chosenLEDs).toHaveLength(r.maxLEDs);
    expect(isStrictlyIncreasing(r.chosenLEDs)).toBe(true);
    expect(isSubsequenceOf(r.chosenLEDs, r.leds)).toBe(true);
  });

  // ------ Already sorted: best case --------------------------------
  it("sorted [1,2,3,4,5] — all LEDs can be lit (best case)", () => {
    const r = computeLIS([1, 2, 3, 4, 5]);
    expect(r.maxLEDs).toBe(5);
    expect(r.dp).toEqual([1, 2, 3, 4, 5]);
    expect(r.parent).toEqual([-1, 0, 1, 2, 3]);
    expect(r.chosenLEDs).toEqual([1, 2, 3, 4, 5]);
  });

  // ------ Reverse sorted: worst case --------------------------------
  it("reverse sorted [5,4,3,2,1] — only 1 LED (worst case)", () => {
    const r = computeLIS([5, 4, 3, 2, 1]);
    expect(r.maxLEDs).toBe(1);
    expect(r.dp).toEqual([1, 1, 1, 1, 1]);
    expect(r.parent).toEqual([-1, -1, -1, -1, -1]);
    expect(r.chosenLEDs).toHaveLength(1);
  });

  // ------ Edge cases --------------------------------
  it("single LED [1] — trivial base case", () => {
    const r = computeLIS([1]);
    expect(r.maxLEDs).toBe(1);
    expect(r.dp).toEqual([1]);
    expect(r.parent).toEqual([-1]);
    expect(r.chosenLEDs).toEqual([1]);
  });

  it("two LEDs ascending [1,2]", () => {
    const r = computeLIS([1, 2]);
    expect(r.maxLEDs).toBe(2);
  });

  it("two LEDs descending [2,1]", () => {
    const r = computeLIS([2, 1]);
    expect(r.maxLEDs).toBe(1);
  });

  // ------ Answer-only checks --------------------------------
  it("[7,2,9,1,8,3,10,4,6,5] → maxLEDs = 4", () => {
    expect(computeLIS([7, 2, 9, 1, 8, 3, 10, 4, 6, 5]).maxLEDs).toBe(4);
  });

  it("[4,1,6,2,7,3,5] (DP demo n=7) → maxLEDs = 4", () => {
    expect(computeLIS([4, 1, 6, 2, 7, 3, 5]).maxLEDs).toBe(4);
  });

  it("[1,5,2,6,3,7,4,8] (interleaved n=8) → maxLEDs = 5", () => {
    expect(computeLIS([1, 5, 2, 6, 3, 7, 4, 8]).maxLEDs).toBe(5);
  });

  it("n=20 complex permutation → maxLEDs = 7", () => {
    const leds = [5, 3, 17, 8, 1, 14, 20, 6, 11, 2, 16, 9, 4, 19, 7, 13, 15, 10, 12, 18];
    expect(computeLIS(leds).maxLEDs).toBe(7);
  });

  it("identity [1..20] → maxLEDs = 20", () => {
    const leds = Array.from({ length: 20 }, (_, i) => i + 1);
    expect(computeLIS(leds).maxLEDs).toBe(20);
  });

  it("reverse [20..1] → maxLEDs = 1", () => {
    const leds = Array.from({ length: 20 }, (_, i) => 20 - i);
    expect(computeLIS(leds).maxLEDs).toBe(1);
  });

  // ------ Structural invariants (hold for every valid input) ------
  it("dp has no value less than 1", () => {
    const r = computeLIS([2, 6, 3, 5, 4, 1]);
    expect(r.dp.every((v: number) => v >= 1)).toBe(true);
  });

  it("max of dp[] equals maxLEDs", () => {
    for (const leds of [
      [2, 6, 3, 5, 4, 1],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [4, 1, 6, 2, 7, 3, 5],
    ]) {
      const r = computeLIS(leds);
      expect(Math.max(...r.dp)).toBe(r.maxLEDs);
    }
  });

  it("chosenLEDs is always strictly increasing (valid non-crossing chain)", () => {
    for (const leds of [
      [2, 6, 3, 5, 4, 1],
      [1, 5, 2, 6, 3, 7, 4, 8],
      [4, 1, 6, 2, 7, 3, 5],
      [7, 2, 9, 1, 8, 3, 10, 4, 6, 5],
    ]) {
      const r = computeLIS(leds);
      expect(isStrictlyIncreasing(r.chosenLEDs)).toBe(true);
    }
  });

  it("chosenLEDs is a subsequence of the input permutation", () => {
    for (const leds of [
      [2, 6, 3, 5, 4, 1],
      [1, 5, 2, 6, 3, 7, 4, 8],
      [4, 1, 6, 2, 7, 3, 5],
    ]) {
      const r = computeLIS(leds);
      expect(isSubsequenceOf(r.chosenLEDs, leds)).toBe(true);
    }
  });
});

// ── generateRandomPermutation ────────────────────────────────
describe("generateRandomPermutation", () => {

  it("returns an array of exactly n elements", () => {
    for (const n of [1, 5, 10, 20]) {
      expect(generateRandomPermutation(n)).toHaveLength(n);
    }
  });

  it("all values are in range [1, n] with no duplicates (3 runs, n=10)", () => {
    for (let run = 0; run < 3; run++) {
      const perm = generateRandomPermutation(10);
      const sorted = [...perm].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });

  it("all values are in range [1, n] with no duplicates (n=1)", () => {
    expect(generateRandomPermutation(1)).toEqual([1]);
  });

  it("sorted result equals [1..n] for n=5 (confirming it is a permutation)", () => {
    const perm = generateRandomPermutation(5);
    expect([...perm].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it("computeLIS on a random permutation produces a valid chain", () => {
    const perm = generateRandomPermutation(15);
    const r = computeLIS(perm);
    expect(r.maxLEDs).toBeGreaterThanOrEqual(1);
    expect(r.maxLEDs).toBeLessThanOrEqual(perm.length);
    expect(isStrictlyIncreasing(r.chosenLEDs)).toBe(true);
    expect(isSubsequenceOf(r.chosenLEDs, perm)).toBe(true);
  });
});
