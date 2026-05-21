// DP algorithms for the Max LED Lighting problem.
//
// Problem: board S has sources 1..n sorted top-to-bottom.
//          board L has LEDs in a random order.
//          LED k must connect to source k — wires must not cross.
//          Goal: light the maximum number of LEDs.
//
// Why LIS? Wire i (LED at row i) and wire j (LED at row j, j > i) cross
// when leds[i] > leds[j] — the source positions invert relative to L.
// So a crossing-free set of wires = an increasing subsequence of L.
// Maximum non-crossing connections = LIS length of L.

import type { LISResult } from "../types";

/**
 * computeLIS — O(n²) time, O(n) space.
 * Returns the full DP table, parent table, answer, and chosen chain.
 */
export function computeLIS(leds: number[]): LISResult {
  const n = leds.length;

  // Step 1: dp[i] = length of the longest increasing subsequence ending at i
  // Every position starts a chain of length 1 (just itself)
  const dp: number[] = new Array(n).fill(1);

  // Step 2: parent[i] = the index j that gave dp[i] its value
  // -1 means no predecessor (position i starts a new chain)
  const parent: number[] = new Array(n).fill(-1);

  // Step 3: fill dp[] bottom-up using the recurrence
  //   dp[i] = 1 + max{ dp[j] | j < i, leds[j] < leds[i] }
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      // leds[j] < leds[i] means wires j and i do not cross
      if (leds[j] < leds[i]) {
        // Extend j's chain if it gives a longer result at i
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          parent[i] = j;
        }
      }
    }
  }

  // Step 4: find the maximum value in dp[] — that is the answer
  let maxLEDs = 0;
  let maxIndex = 0;
  for (let i = 0; i < n; i++) {
    if (dp[i] > maxLEDs) {
      maxLEDs = dp[i];
      maxIndex = i;
    }
  }

  // Step 5: backtrack through parent[] to reconstruct the chain in order
  // unshift() prepends each index so the final list is in forward (top-to-bottom) order
  const chosenIndices: number[] = [];
  let cur = maxIndex;
  while (cur !== -1) {
    chosenIndices.unshift(cur);
    cur = parent[cur];
  }

  const chosenLEDs = chosenIndices.map((idx) => leds[idx]);

  return { leds, dp, parent, maxLEDs, chosenIndices, chosenLEDs };
}


// Fisher-Yates shuffle — build [1..n] then swap each position randomly
// Used for the "Random" button in the input panel
export function generateRandomPermutation(n: number): number[] {
  // Start with the sorted identity permutation [1, 2, ..., n]
  const arr: number[] = Array.from({ length: n }, (_, i) => i + 1);

  // For each position i (from end to 1), swap arr[i] with a random j in [0..i]
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
