// Shared TypeScript types for the Max LED Lighting DP project

// Full output of computeLIS() — the DP table, parent table, and chosen chain
export interface LISResult {
  // The LED permutation entered by the user (1-indexed values, 0-indexed positions)
  leds: number[];

  // dp[i] = length of the longest increasing subsequence ending at index i
  // Recurrence: dp[i] = 1 + max{ dp[j] | j < i, leds[j] < leds[i] }
  dp: number[];

  // parent[i] = the index j used to compute dp[i]; -1 means no predecessor
  parent: number[];

  // Maximum value in dp[] — the answer (max LEDs that can be lit)
  maxLEDs: number;

  // 0-based indices in leds[] that form one optimal solution
  chosenIndices: number[];

  // LED values from the chosen solution, in board-L top-to-bottom order
  chosenLEDs: number[];
}

// One test case stored in the preset list
export interface TestCase {
  label: string;
  n: number;
  leds: number[];
}

// Full output of computeLCS() — the c-table, direction table, and result sequence
export interface LCSResult {
  // x = the original LED permutation (board L order)
  x: number[];

  // y = sorted(x) — the reference sequence for LCS
  y: number[];

  // LCS length = LIS(x); must equal LISResult.maxLEDs for every valid input
  length: number;

  // rows[i][j] = c[i][j] from the recurrence — stored for display (O(m·n))
  // The algorithm itself only uses two 1-D arrays (O(n) space)
  rows: number[][];

  // bRows[i][j] = direction taken at cell (i,j)
  // 'diag' = match (↖), 'up' = came from above (↑), 'left' = came from left (←), 'none' = base
  bRows: string[][];

  // The actual LCS values, backtracked from bRows — equals the LIS chain in sorted order
  sequence: number[];
}
