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
