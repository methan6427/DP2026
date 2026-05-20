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

// ============================================================
// LCSResult — output of computeLCS() in utils/lis.ts
//
// Per COM336 Chapter 2 — LCS algorithm (Iyad Jaber)
// We compute LCS(L, sorted(L)) to prove that LIS(L) = LCS(L, sorted(L)).
// The instructor expects to see the LCS formulation explicitly.
// ============================================================
export interface LCSResult {
  /** x = the original LED permutation array (board L order). */
  x: number[];

  /** y = sorted(x) — the reference array (every element in increasing order). */
  y: number[];

  /**
   * length = LCS(x, y) = LIS(x).
   * Must equal LISResult.maxLEDs for every valid input.
   * If they differ, the algorithm has a bug.
   */
  length: number;

  /**
   * rows[i][j] = c[i][j] from the LCS recurrence.
   *
   * rows has (m+1) entries (rows[0] is the base-case all-zero row).
   * Each rows[i] has (n+1) entries (col 0 is always 0).
   *
   * NOTE — space for DISPLAY only (O(mn)).
   * The actual computation uses rolling 1-D arrays prev[] / curr[]
   * which are O(n) space. See computeLCS() comments for details.
   */
  rows: number[][];

  /**
   * bRows[i][j] = direction taken when filling c[i][j].
   *   'diag' → x[i-1] == y[j-1], matched  (↖)
   *   'up'   → c[i-1][j] >= c[i][j-1]     (↑)
   *   'left' → c[i][j-1] >  c[i-1][j]     (←)
   *   'none' → base-case cell (i=0 or j=0)
   *
   * Stored in full for backtracking and display.
   */
  bRows: string[][];

  /**
   * sequence = the actual LCS values, backtracked from bRows.
   * For LIS-as-LCS this equals the chosen LED labels in sorted order.
   */
  sequence: number[];
}
