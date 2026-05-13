// ============================================================
// types/index.ts
// Shared TypeScript types for the Max LED Lighting DP project.
// ============================================================

/**
 * Holds the complete output of the LIS dynamic-programming algorithm.
 *
 * The algorithm works on array L (the LED permutation).
 * L[i] = the label of the LED sitting at physical position i on board L.
 * Source i on board S always has label i  (sources are sorted 1..n).
 *
 * A wire for LED-k goes from physical position pos(k) on L
 * to physical position k on S.
 * Two wires cross iff their L-positions are in the OPPOSITE order
 * to their S-positions — exactly the definition of an inversion.
 * Therefore: max non-crossing connections = LIS length of L.
 */
export interface LISResult {
  /** The LED permutation array entered by the user (1-indexed values). */
  leds: number[];

  /**
   * dp[i] = length of the Longest Increasing Subsequence of L
   *         that ENDS at index i (0-based).
   *
   * This is the core 1-D DP table the instructor asked for.
   *
   * Recurrence (from Chapter 2, DP approach):
   *   dp[i] = 1 + max{ dp[j]  |  0 <= j < i  AND  L[j] < L[i] }
   *   dp[i] = 1   if no such j exists (L[i] starts a new subsequence of length 1)
   *
   * Reading the table row by row tells you:
   *   "The best non-crossing chain that can END at LED L[i] has dp[i] connections."
   */
  dp: number[];

  /**
   * parent[i] = the index j that gave dp[i] its value
   *             (i.e., the previous element in the optimal sub-chain ending at i).
   * parent[i] = -1 when dp[i] = 1 (L[i] is the first element of its chain).
   *
   * Used during backtracking to reconstruct WHICH LEDs are in the solution.
   */
  parent: number[];

  /** The maximum value in dp[]. This is the answer: max LEDs that can be lit. */
  maxLEDs: number;

  /**
   * The 0-based indices (in L) of the LEDs that form one optimal solution.
   * Computed by backtracking through parent[] from the index that holds maxLEDs.
   */
  chosenIndices: number[];

  /**
   * The LED labels (values from L) in the chosen solution, in the order
   * they appear on board L (physical top-to-bottom order).
   * These are the actual LED numbers you would connect.
   */
  chosenLEDs: number[];
}

/** One test case stored in the preset list. */
export interface TestCase {
  label: string;
  n: number;
  leds: number[];
}
