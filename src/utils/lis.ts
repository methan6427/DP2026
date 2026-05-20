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

import type { LISResult, LCSResult } from "../types";

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

/**
 * computeLCS — O(m·n) time, O(n) computation space, O(m·n) display space.
 *
 * Runs LCS(x, y) where y = sorted(x), proving LIS(x) = LCS(x, sorted(x)).
 * Uses rolling rows: only prev[] and curr[] are live at any time (O(n)).
 * All completed rows are saved into rows[][] and bRows[][] for display.
 */
export function computeLCS(x: number[], y: number[]): LCSResult {
  const m = x.length;
  const n = y.length;

  // Base case: c[0][j] = 0 for all j (empty x prefix vs any y)
  // prev[] represents c[i-1][*]; start with i=0 so all values are 0
  let prev: number[] = new Array(n + 1).fill(0);

  // rows[0] = base-case all-zero row — saved for display
  const rows: number[][] = [new Array(n + 1).fill(0)];
  // bRows[0] = 'none' for every cell in the base row
  const bRows: string[][] = [new Array(n + 1).fill("none")];

  // Fill rows i = 1 to m
  for (let i = 1; i <= m; i++) {

    // curr[j] = c[i][j]; column 0 is always 0 (base case c[i][0] = 0)
    const curr: number[] = new Array(n + 1).fill(0);
    const bRow: string[] = new Array(n + 1).fill("none");

    for (let j = 1; j <= n; j++) {
      // x[i-1] and y[j-1]: arrays are 0-indexed, recurrence uses 1-indexed notation
      if (x[i - 1] === y[j - 1]) {
        // Match: c[i][j] = c[i-1][j-1] + 1
        curr[j] = prev[j - 1] + 1;
        bRow[j] = "diag";

      } else if (curr[j - 1] > prev[j]) {
        // Left wins: c[i][j] = c[i][j-1]
        curr[j] = curr[j - 1];
        bRow[j] = "left";

      } else {
        // Up wins (tie also goes up, following lecture convention): c[i][j] = c[i-1][j]
        curr[j] = prev[j];
        bRow[j] = "up";
      }
    }

    // Save a copy of curr[] for display (spread makes a real copy, not a reference)
    rows.push([...curr]);
    bRows.push(bRow);

    // Roll: curr becomes the new prev for the next row
    prev = curr;
  }

  // LCS length = bottom-right corner = c[m][n]
  const lcsLength = prev[n];

  // Backtrack from (m, n) to reconstruct the LCS sequence
  // 'diag' = match: include x[i-1] in the result and move diagonally
  // unshift() prepends so the sequence is in forward order
  const sequence: number[] = [];
  let bi = m;
  let bj = n;

  while (bi > 0 && bj > 0) {
    const dir = bRows[bi][bj];
    if (dir === "diag") {
      sequence.unshift(x[bi - 1]);
      bi--;
      bj--;
    } else if (dir === "up") {
      bi--;
    } else {
      bj--;
    }
  }

  return { x, y, length: lcsLength, rows, bRows, sequence };
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
