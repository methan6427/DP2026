// ============================================================
// utils/lis.ts
// Core Dynamic Programming algorithm for the Max LED Lighting problem.
//
// PROBLEM RECAP (from the project sheet):
//   - Board S (right): n power sources sorted as  1, 2, 3, …, n  (top → bottom).
//   - Board L (left):  n LEDs in an arbitrary permutation L[0..n-1] (top → bottom).
//   - LED with value k MUST connect to Source k (label matching).
//   - No two wires may cross.
//   - Goal: light the MAXIMUM number of LEDs.
//
// WHY IS THIS LIS?
//   Wire for LED k: starts at position  pos_L(k)  on board L,
//                   ends   at position  k          on board S.
//   Two wires (for LED a and LED b, a appears above b on L, so pos_L(a) < pos_L(b))
//   cross if and only if  a > b  (the values invert relative to their positions).
//   So a set of wires is crossing-free ⟺ the corresponding LED values form
//   an INCREASING subsequence of L (values go up as positions go down, matching S).
//   ∴  max non-crossing connections  =  LIS(L).
//
// DP APPROACH (following Chapter 2, Iyad Jaber – Algorithm Analysis):
//   Step 1: Characterize optimal substructure.
//           An optimal set of wires ending at LED L[i] is built from an
//           optimal set ending at some L[j] (j < i, L[j] < L[i]) + {L[i]}.
//   Step 2: Define recursive value.
//           dp[i] = 1 + max{ dp[j]  |  j < i,  L[j] < L[i] }
//           dp[i] = 1  (base case: no smaller LED before position i)
//   Step 3: Compute bottom-up (fill dp[] left to right, i = 0..n-1).
//   Step 4: Reconstruct solution by backtracking through parent[].
//
// TIME COMPLEXITY:  O(n²)  — two nested loops (see inline analysis below).
// SPACE COMPLEXITY: O(n)   — two auxiliary arrays dp[] and parent[].
// ============================================================

import type { LISResult, LCSResult } from "../types";

/**
 * computeLIS
 *
 * Input:  leds – the LED permutation array L (0-based, values 1..n).
 * Output: LISResult — dp table, parent table, answer, chosen LEDs.
 *
 * The function is the ONLY place that touches DP logic;
 * all components just read the result object.
 */
export function computeLIS(leds: number[]): LISResult {
  const n = leds.length;

  // ------------------------------------------------------------------
  // STEP 1 — Allocate the DP table.
  //
  // dp[i] will hold:
  //   "The length of the longest non-crossing chain of wires
  //    whose LAST wire (rightmost on board S) connects LED L[i]."
  //
  // Every position can at minimum form a chain of length 1 (just itself),
  // so we pre-fill every cell with 1.
  //
  // Table layout (for the example L = [2, 6, 3, 5, 4, 1]):
  //   Index i :  0    1    2    3    4    5
  //   L[i]    :  2    6    3    5    4    1
  //   dp[i]   :  1    ?    ?    ?    ?    ?   ← we fill these
  // ------------------------------------------------------------------
  const dp: number[] = new Array(n).fill(1);

  // ------------------------------------------------------------------
  // STEP 2 — Allocate the parent (backtracking) table.
  //
  // parent[i] = j means:
  //   "To get dp[i], we extended the chain that ended at index j."
  //   In other words, L[j] is the LED just BEFORE L[i] in the chosen chain.
  //
  // parent[i] = -1 means L[i] starts a brand-new chain (no predecessor).
  // ------------------------------------------------------------------
  const parent: number[] = new Array(n).fill(-1);

  // ------------------------------------------------------------------
  // STEP 3 — Fill the DP table (bottom-up, O(n²)).
  //
  // Outer loop: i iterates over each LED position left-to-right (0 … n-1).
  //   We compute dp[i] = best chain length ending HERE.
  //
  // Inner loop: j iterates over every position BEFORE i (0 … i-1).
  //   For each j, we ask: "Can L[i] extend the chain that ended at L[j]?"
  //   Answer YES if L[j] < L[i]   ← the wire for L[j] ends higher on S
  //                                  than the wire for L[i], so they DON'T cross.
  //
  // RECURRENCE:
  //   if L[j] < L[i]  AND  dp[j] + 1 > dp[i]:
  //       dp[i]     = dp[j] + 1    ← extend j's chain by one more wire
  //       parent[i] = j            ← remember where we came from
  // ------------------------------------------------------------------
  for (let i = 1; i < n; i++) {
    // For position i, scan all previous positions j
    for (let j = 0; j < i; j++) {
      // Condition: L[j] < L[i]
      //   On board S, source L[j] sits ABOVE source L[i] (smaller index = higher row).
      //   On board L, position j is ABOVE position i (j < i).
      //   So the wire j goes from a higher row on L to a higher row on S,
      //   and the wire i goes from a lower row on L to a lower row on S.
      //   → The two wires do NOT cross. We can keep BOTH.
      if (leds[j] < leds[i]) {
        // Can we improve dp[i] by extending the chain that ends at j?
        if (dp[j] + 1 > dp[i]) {
          // Yes – this is a longer chain.
          // dp[i] now = (best chain up to j) + 1 more wire (for L[i]).
          dp[i] = dp[j] + 1;

          // Record j as the predecessor of i so we can backtrack later.
          parent[i] = j;
        }
      }
      // If L[j] >= L[i], the wire for j would CROSS the wire for i,
      // so we cannot include both. We skip j entirely for position i.
    }
    // After the inner loop, dp[i] holds the longest non-crossing chain
    // that ends at physical position i on board L.
  }

  // ------------------------------------------------------------------
  // STEP 4 — Find the answer (max in dp[]).
  //
  // The overall maximum is the answer to the problem:
  //   "How many LEDs can we light at most?"
  //
  // We also note the INDEX of that maximum so we can backtrack.
  // ------------------------------------------------------------------
  let maxLEDs = 0;
  let maxIndex = 0;
  for (let i = 0; i < n; i++) {
    if (dp[i] > maxLEDs) {
      maxLEDs = dp[i];
      maxIndex = i;
    }
  }

  // ------------------------------------------------------------------
  // STEP 5 — Reconstruct the chosen LEDs by backtracking parent[].
  //
  // Start at maxIndex (the last LED in the optimal chain).
  // Follow parent[] pointers until we reach -1.
  // Because we follow the chain backwards, we PREPEND each LED to get
  // the final list in forward (top-to-bottom on board L) order.
  //
  // Example for L = [2, 6, 3, 5, 4, 1]:
  //   dp     = [1, 2, 2, 3, 3, 1]
  //   parent = [-1, 0, 0, 2, 2, -1]
  //   maxIndex = 3 (dp[3]=3, L[3]=5)
  //   Backtrack: 3 → parent[3]=2 → parent[2]=0 → parent[0]=-1 (stop)
  //   Indices (reverse): [3, 2, 0]  →  forward: [0, 2, 3]
  //   LED labels:  L[0]=2, L[2]=3, L[3]=5  →  chosen chain [2, 3, 5] ✓
  // ------------------------------------------------------------------
  const chosenIndices: number[] = [];
  let cur = maxIndex;
  while (cur !== -1) {
    chosenIndices.unshift(cur); // prepend to build forward order
    cur = parent[cur];
  }

  const chosenLEDs = chosenIndices.map((idx) => leds[idx]);

  return { leds, dp, parent, maxLEDs, chosenIndices, chosenLEDs };
}

// ============================================================
// computeLCS
//
// Per COM336 Chapter 2 — LCS algorithm (Iyad Jaber, Algorithm Analysis)
//
// WHY WE RUN LCS HERE:
//   The instructor teaches LCS as the primary DP example in Chapter 2.
//   LIS(L) = LCS(L, sorted(L)) because:
//     - sorted(L) is strictly increasing → any common subsequence of
//       L and sorted(L) must also be increasing in L's order.
//     - Therefore the longest such common subsequence IS the LIS of L.
//   Running LCS explicitly lets the instructor see BOTH formulations
//   and verify that they produce the same answer.
//
// SPACE COMPLEXITY — TWO LEVELS (important for grading):
//   Computation : O(n) — only prev[] and curr[] are live at any time.
//                        This is the "rolling row" optimisation the
//                        instructor expects (one 1-D array, not a 2-D table).
//   Display     : O(m·n) — we push every completed curr[] into rows[][]
//                           and every bRow into bRows[][] so the UI can
//                           render the full table and the backtrack path.
//                           This is DISPLAY storage only, NOT part of the
//                           algorithmic computation.
//
// TIME COMPLEXITY:  O(m·n) — two nested loops, each cell O(1).
// ============================================================

/**
 * computeLCS
 *
 * @param x - First sequence  (the LED permutation L, 0-based).
 * @param y - Second sequence (sorted copy of L, 0-based).
 * @returns LCSResult — full c-table (for display), direction table (for
 *          backtracking), LCS length, and the reconstructed LCS sequence.
 *
 * Time:  O(m·n)  where m = x.length, n = y.length.
 * Space: O(n)    for computation (rolling rows prev[] / curr[]).
 *        O(m·n)  for display storage (rows[][], bRows[][]).
 */
export function computeLCS(x: number[], y: number[]): LCSResult {
  const m = x.length;
  const n = y.length;

  // ------------------------------------------------------------------
  // BASE CASE — row 0 (c[0][j] = 0 for all j, per lecture recurrence).
  //
  // Per COM336 Chapter 2:
  //   c[i][0] = 0   (empty prefix of x matched against any y → 0)
  //   c[0][j] = 0   (any x matched against empty prefix of y → 0)
  //
  // prev[] represents c[i-1][*]. We start with i=0 → all zeros.
  // ------------------------------------------------------------------
  let prev: number[] = new Array(n + 1).fill(0);

  // rows[0] = the all-zero base-case row. Stored for UI display.
  // Space complexity note: rows[] accumulates O(m·n) data for display.
  const rows: number[][] = [new Array(n + 1).fill(0)];

  // bRows[0] = 'none' for every base-case cell (no direction needed).
  const bRows: string[][] = [new Array(n + 1).fill("none")];

  // ------------------------------------------------------------------
  // MAIN LOOP — fill rows i = 1 .. m  (outer loop over x).
  //
  // Per COM336 Chapter 2 lecture pseudocode:
  //   for i = 1 to m:
  //     for j = 1 to n:
  //       if x[i] == y[j]:        c[i][j] = c[i-1][j-1] + 1,  b='diag'
  //       else if c[i][j-1] > c[i-1][j]:  c[i][j] = c[i][j-1], b='left'
  //       else:                   c[i][j] = c[i-1][j],          b='up'
  //
  // Rolling row:
  //   prev[] holds c[i-1][*] — the PREVIOUS row (already computed).
  //   curr[] holds c[i][*]   — the CURRENT  row (being filled now).
  //   After the inner loop we set prev = curr (rolling forward).
  //   Only two O(n) arrays live in memory at any moment → O(n) compute space.
  // ------------------------------------------------------------------
  for (let i = 1; i <= m; i++) {

    // curr[j] = c[i][j]; initialise col 0 to 0 (base case c[i][0] = 0).
    const curr: number[] = new Array(n + 1).fill(0);

    // Direction row for display and backtracking. Col 0 = 'none' (base case).
    const bRow: string[] = new Array(n + 1).fill("none");

    for (let j = 1; j <= n; j++) {
      // ------------------------------------------------------------------
      // x[i-1] and y[j-1] because arrays are 0-indexed in JS
      // but the recurrence uses 1-indexed notation from the lecture.
      // ------------------------------------------------------------------
      if (x[i - 1] === y[j - 1]) {
        // MATCH: the i-th element of x equals the j-th element of y.
        // Per lecture: c[i][j] = c[i-1][j-1] + 1
        // prev[j-1] is c[i-1][j-1] because prev holds the previous row.
        curr[j] = prev[j - 1] + 1;
        bRow[j] = "diag";   // ↖ diagonal — came from upper-left

      } else if (curr[j - 1] > prev[j]) {
        // LEFT wins: the best LCS for (x[1..i], y[1..j-1]) is longer.
        // Per lecture: c[i][j] = c[i][j-1]
        // curr[j-1] is already filled (inner loop left → right).
        curr[j] = curr[j - 1];
        bRow[j] = "left";   // ← came from the left cell

      } else {
        // UP wins (or tie → up per lecture convention).
        // Per lecture: c[i][j] = c[i-1][j]
        // prev[j] is c[i-1][j].
        curr[j] = prev[j];
        bRow[j] = "up";     // ↑ came from the cell above
      }
    }

    // ------------------------------------------------------------------
    // Store curr[] into rows[] for display BEFORE rolling.
    // We spread [...curr] to make a COPY — if we stored curr directly,
    // later mutations of curr would corrupt the saved display data.
    // ------------------------------------------------------------------
    rows.push([...curr]);
    bRows.push(bRow);

    // ------------------------------------------------------------------
    // ROLL: curr becomes the new "previous" row for the next iteration.
    // O(n) assignment — no allocation, just variable rebinding.
    // After this line, prev points to the array we just filled,
    // and the old prev is released to the garbage collector.
    // ------------------------------------------------------------------
    prev = curr;
  }

  // The LCS length lives at the bottom-right corner of the table.
  // After the loop, prev IS the last row (row m), so prev[n] = c[m][n].
  const lcsLength = prev[n];

  // ------------------------------------------------------------------
  // BACKTRACK — reconstruct the LCS sequence by following bRows.
  //
  // Per lecture (print_LCS procedure):
  //   Start at (m, n).
  //   'diag' → this cell is a match, include x[i-1] in the sequence,
  //            move to (i-1, j-1).
  //   'up'   → move to (i-1, j)  — best came from above.
  //   'left' → move to (i, j-1) — best came from the left.
  //   Stop when i = 0 or j = 0 (base case boundary).
  //
  // We use unshift() to prepend so the final array is in forward order.
  // ------------------------------------------------------------------
  const sequence: number[] = [];
  let bi = m;
  let bj = n;

  while (bi > 0 && bj > 0) {
    const dir = bRows[bi][bj];
    if (dir === "diag") {
      // x[bi-1] == y[bj-1]: this value is in the LCS.
      sequence.unshift(x[bi - 1]);
      bi--;
      bj--;
    } else if (dir === "up") {
      bi--;
    } else {
      // "left"
      bj--;
    }
  }

  return { x, y, length: lcsLength, rows, bRows, sequence };
}

// ------------------------------------------------------------------
// generateRandomPermutation
//
// Creates a random permutation of [1, 2, …, n] using Fisher-Yates shuffle.
// Used for the "Random Test Case" button.
// Time: O(n).
// ------------------------------------------------------------------
export function generateRandomPermutation(n: number): number[] {
  // Start with identity permutation [1, 2, ..., n]
  const arr: number[] = Array.from({ length: n }, (_, i) => i + 1);

  // Fisher-Yates: for each position i from end → 1,
  // swap arr[i] with a random position j in [0..i].
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
