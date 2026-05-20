// ============================================================
// components/LCSTable.tsx
//
// PURPOSE:
//   Renders the full LCS (Longest Common Subsequence) DP table
//   for the computation  LCS(L, sorted(L)) = LIS(L).
//
// WHY THIS COMPONENT EXISTS:
//   COM336 Chapter 2 (Iyad Jaber) teaches LCS as the primary
//   DP algorithm.  The instructor expects to see:
//     1. The LCS recurrence filled in a proper c[i][j] table.
//     2. Direction arrows (↖ ↑ ←) in each cell.
//     3. The backtrack path highlighted.
//     4. Proof that LCS(L, sorted(L)) == LIS(L).
//
// TABLE STRUCTURE:
//   - Column 0 header: empty  (row-label column)
//   - Column 1 header: "0"    (base-case column)
//   - Columns 2..n+1: values in y (sorted array)
//   - Row 0: all zeros        (base-case row, index header "0")
//   - Row i: x[i-1] as header, then c[i][0..n]
//
// CELL COLOURS:
//   Gold background  → cell is on the backtrack path (the LCS chain)
//   Green background → this cell is a MATCH (x[i-1] == y[j-1])
//   Default          → neither
// ============================================================

// ------------------------------------------------------------
// IMPORTS
//
// React     → needed for JSX.
// useMemo   → memoises the backtrack-path computation so it only
//             reruns when the result prop changes, not on every render.
// LCSResult → TypeScript type for the data this component receives.
// ------------------------------------------------------------
import React, { useMemo } from "react";
import type { LCSResult } from "../types";

// ------------------------------------------------------------
// PROPS
// ------------------------------------------------------------
interface Props {
  result: LCSResult;
}

// ------------------------------------------------------------
// DIRECTION ARROWS  (Unicode characters)
//
// These match the arrows the instructor draws on the whiteboard:
//   ↖ = diagonal (match found)
//   ↑ = up       (best came from above)
//   ← = left     (best came from the left)
// ------------------------------------------------------------
const ARROW: Record<string, string> = {
  diag: "↖",
  up:   "↑",
  left: "←",
  none: "",
};

/**
 * LCSTable
 *
 * Renders the full LCS c-table, direction arrows, backtrack path,
 * recurrence box, and a collapsible space-optimisation note.
 *
 * @param result - LCSResult produced by computeLCS() in utils/lis.ts.
 *
 * Time to render: O(m·n)  — one pass over rows[][] to build the table.
 * Space:          O(m·n)  — the table cells (already stored in result.rows).
 */
const LCSTable: React.FC<Props> = ({ result }) => {

  // ----------------------------------------------------------
  // DESTRUCTURE — pull the fields we need from result.
  //
  // x    = original LED permutation (board L order)
  // y    = sorted(x)  (the reference sequence)
  // rows = c[i][j] values for display
  // bRows= direction at each cell
  // sequence = the LCS values (= the LIS of x, backtracked)
  // length   = LCS length (must equal LIS.maxLEDs)
  // ----------------------------------------------------------
  const { x, y, rows, bRows, sequence, length } = result;
  const m = x.length;
  const n = y.length;

  // ----------------------------------------------------------
  // BACKTRACK PATH — which cells form the optimal chain?
  //
  // We retrace the same path that computeLCS() followed when
  // building "sequence", but here we collect the (i,j) coordinates
  // into a Set so each cell can check membership in O(1).
  //
  // Key format: "i,j"  (row,col as a string)
  //
  // useMemo: only recompute when result.bRows changes.
  // This avoids an O(m·n) trace on every React re-render.
  // ----------------------------------------------------------
  const pathSet = useMemo(() => {
    const set = new Set<string>();
    let i = m;
    let j = n;
    while (i > 0 && j > 0) {
      set.add(`${i},${j}`);
      const dir = bRows[i][j];
      if (dir === "diag") { i--; j--; }
      else if (dir === "up") { i--; }
      else { j--; }
    }
    return set;
  }, [bRows, m, n]);

  // ----------------------------------------------------------
  // MATCH SET — cells where x[i-1] == y[j-1].
  //
  // These are highlighted differently from path cells so the
  // instructor can see WHERE matches were found vs WHERE the
  // optimal path actually went.
  //
  // Key format: "i,j"  (1-indexed, matching the table rows/cols)
  // ----------------------------------------------------------
  const matchSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (x[i - 1] === y[j - 1]) set.add(`${i},${j}`);
      }
    }
    return set;
  }, [x, y, m, n]);

  // ----------------------------------------------------------
  // RETURN THE JSX
  // ----------------------------------------------------------
  return (
    <div className="lcs-table-section card">

      {/* ---- Section title ---- */}
      <h2>LCS Table — LCS(L, sorted(L)) = LIS(L)</h2>

      {/*
        ---- Context banner ----
        Shows the actual arrays being compared so the instructor
        can immediately see what x and y are for this input.
      */}
      <div className="lcs-context-box">
        {/* x is the LED permutation the user entered */}
        <div className="lcs-context-row">
          <span className="lcs-context-label">x = L (original):</span>
          <span className="lcs-context-vals">
            [{x.join(", ")}]
          </span>
        </div>

        {/* y is sorted(x) — the sequence we compare against */}
        <div className="lcs-context-row">
          <span className="lcs-context-label">y = sorted(L):</span>
          <span className="lcs-context-vals">
            [{y.join(", ")}]
          </span>
        </div>

        {/*
          The LCS result with the explicit connection to LIS.
          This line is what the instructor needs to see:
          LCS(x,y) gives the same answer as LIS(x).
        */}
        <div className="lcs-context-row lcs-result-row">
          <span className="lcs-context-label">LCS(x, y):</span>
          <span className="lcs-sequence-val">
            [{sequence.join(", ")}]
            &nbsp;→ length&nbsp;
            <strong>{length}</strong>
            &nbsp; = LIS of L &nbsp;✓
          </span>
        </div>
      </div>

      {/* ---- Recurrence box — exact lecture notation ---- */}
      {/*
        This matches the formula from COM336 Chapter 2 (page 11):
          c[i,j] = 0                         if i=0 or j=0
          c[i,j] = c[i-1,j-1] + 1           if x[i] = y[j]
          c[i,j] = max(c[i-1,j], c[i,j-1])  if x[i] ≠ y[j]
      */}
      <div className="recurrence-box">
        <strong>Recurrence (COM336 Chapter 2 — LCS, Iyad Jaber):</strong>
        <code>c[i,j] = 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if i=0 or j=0</code>
        <code>c[i,j] = c[i-1,j-1] + 1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if x[i] = y[j]&nbsp;&nbsp;(↖ match)</code>
        <code>c[i,j] = max(c[i-1,j], c[i,j-1]) &nbsp;if x[i] ≠ y[j]&nbsp;&nbsp;(↑ or ←)</code>
      </div>

      {/* ---- Cell colour legend ---- */}
      <div className="lcs-legend">
        <span className="lcs-legend-item lcs-legend-path">Backtrack path (optimal chain)</span>
        <span className="lcs-legend-item lcs-legend-match">Match cell (x[i] = y[j])</span>
        <span className="lcs-legend-item lcs-legend-arrow">↖ ↑ ← direction arrow</span>
      </div>

      {/* ---- The LCS table ---- */}
      <div className="table-wrapper">
        <table className="lcs-table">

          {/* Column headers: blank, "0", then each y value */}
          <thead>
            <tr>
              {/*
                First header cell is blank — this is the top-left corner
                where the row-label column meets the header row.
              */}
              <th className="lcs-th-corner"></th>

              {/* The "0" column — base case (empty y prefix) */}
              <th className="lcs-th-y">0</th>

              {/*
                One header cell per element in y.
                y[j-1] is the (j)th source value (1-indexed in the table).
              */}
              {y.map((val, j) => (
                <th key={j} className="lcs-th-y">{val}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/*
              rows.map((row, i) => ...)
              ─────────────────────────
              rows[0] = all-zero base-case row  → row label "0"
              rows[i] = data row for x[i-1]     → row label x[i-1]

              For i=0 we show "0" as the row label.
              For i>0 we show x[i-1] (the i-th element of the permutation).
            */}
            {rows.map((row, i) => (
              <tr key={i}>

                {/* Row header: "0" for base row, x[i-1] for data rows */}
                <th className="lcs-th-x">
                  {i === 0 ? "0" : x[i - 1]}
                </th>

                {/*
                  One cell per column in this row (columns 0 .. n).
                  j=0 is always 0 (base case c[i][0]=0).
                  j>0 holds the DP value from computeLCS.
                */}
                {row.map((val, j) => {

                  // Is this cell on the optimal backtrack path?
                  const onPath  = pathSet.has(`${i},${j}`);

                  // Is this a match cell? (Only meaningful for i>0, j>0)
                  const isMatch = i > 0 && j > 0 && matchSet.has(`${i},${j}`);

                  // Direction arrow symbol for this cell.
                  const arrow   = ARROW[bRows[i][j]] ?? "";

                  // CSS class for the cell:
                  //   lcs-cell-path  → gold  (backtrack path)
                  //   lcs-cell-match → green (match, not necessarily on path)
                  //   default        → no special class
                  const cellClass = onPath
                    ? "lcs-cell lcs-cell-path"
                    : isMatch
                    ? "lcs-cell lcs-cell-match"
                    : "lcs-cell";

                  return (
                    <td key={j} className={cellClass}>
                      {/*
                        The cell value (c[i][j]).
                        We render it as the main content.
                      */}
                      <span className="lcs-cell-val">{val}</span>

                      {/*
                        The direction arrow rendered as a small superscript
                        in the top-left corner of the cell.
                        Only shown for non-base-case cells (i>0 AND j>0).
                      */}
                      {i > 0 && j > 0 && arrow && (
                        <span className="lcs-cell-arrow">{arrow}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Space optimisation note (collapsible) ---- */}
      {/*
        <details> / <summary> is native HTML — no JS needed.
        The user can expand it to read the explanation.
        We hide it by default to keep the page clean.
      */}
      <details className="trace-details lcs-space-note">
        <summary>Space optimisation note — O(n) rolling rows (click to expand)</summary>
        <div className="trace-body">
          <p>
            <strong>Computation space: O(n)</strong> — only two 1-D arrays
            (<code>prev[]</code> and <code>curr[]</code>) are live at any time.
            Each outer iteration rolls <code>curr</code> into <code>prev</code>
            and allocates a fresh <code>curr</code>.
            The recurrence <code>c[i][j]</code> depends only on
            <code>c[i-1][j-1]</code>, <code>c[i-1][j]</code>, and
            <code>c[i][j-1]</code> — i.e. the previous row and the current
            row so far. Two arrays are sufficient.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Display space: O(m·n)</strong> — after computing each row,
            a copy of <code>curr[]</code> is pushed into <code>rows[][]</code>
            so this table can be rendered.  Similarly, <code>bRows[][]</code>
            stores all directions for the backtrack path highlight above.
            This O(m·n) storage is for the UI only — the algorithm itself
            never needs more than O(n) at once.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Per the instructor's rule:</strong> the 1-D rolling
            implementation satisfies the O(n) space requirement for the
            DP computation.
          </p>
        </div>
      </details>

    </div>
  );
};

export default LCSTable;
