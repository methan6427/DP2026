// Renders the full LIS dp table — proves LIS(L) = LIS table length
import React, { useMemo } from "react";
import type { LISTableResult } from "../types";

interface Props {
  result: LISTableResult;
}

// Direction arrows matching the standard lecture notation
const ARROW: Record<string, string> = {
  diag: "↖",
  up:   "↑",
  left: "←",
  none: "",
};

const LISTable: React.FC<Props> = ({ result }) => {

  const { x, y, rows, bRows, sequence, length } = result;
  const m = x.length;
  const n = y.length;

  // Build the set of (i,j) coordinates on the backtrack path
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

  // Build the set of (i,j) coordinates where L[i-1] == sorted(L)[j-1]
  const matchSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (x[i - 1] === y[j - 1]) set.add(`${i},${j}`);
      }
    }
    return set;
  }, [x, y, m, n]);

  return (
    <div className="lis-table-card card">

      <h2>LIS DP Table</h2>

      {/* Show the two input arrays and the LIS result */}
      <div className="lis-context-box">
        <div className="lis-context-row">
          <span className="lis-context-label">L (original):</span>
          <span className="lis-context-vals">[{x.join(", ")}]</span>
        </div>
        <div className="lis-context-row">
          <span className="lis-context-label">sorted(L):</span>
          <span className="lis-context-vals">[{y.join(", ")}]</span>
        </div>
        <div className="lis-context-row lis-result-row">
          <span className="lis-context-label">LIS(L):</span>
          <span className="lis-sequence-val">
            [{sequence.join(", ")}]
            &nbsp;→ length&nbsp;<strong>{length}</strong>
          </span>
        </div>
      </div>

      {/* Three-case recurrence */}
      <div className="recurrence-box">
        <strong>Recurrence:</strong>
        <code>dp[i,j] = 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if i=0 or j=0</code>
        <code>dp[i,j] = dp[i-1,j-1] + 1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if L[i] = S[j]&nbsp;&nbsp;(↖ match)</code>
        <code>dp[i,j] = max(dp[i-1,j], dp[i,j-1]) &nbsp;if L[i] ≠ S[j]&nbsp;&nbsp;(↑ or ←)</code>
      </div>

      {/* Legend explaining the cell colours */}
      <div className="lis-legend">
        <span className="lis-legend-item lis-legend-path">Backtrack path (optimal chain)</span>
        <span className="lis-legend-item lis-legend-match">Match cell (L[i] = S[j])</span>
        <span className="lis-legend-item lis-legend-arrow">↖ ↑ ← direction arrow</span>
      </div>

      {/* The full dp[i][j] table */}
      <div className="table-wrapper">
        <table className="lis-table">

          <thead>
            <tr>
              <th className="lis-th-corner"></th>
              <th className="lis-th-y">0</th>
              {y.map((val, j) => (
                <th key={j} className="lis-th-y">{val}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <th className="lis-th-x">
                  {i === 0 ? "0" : x[i - 1]}
                </th>
                {row.map((val, j) => {
                  const onPath  = pathSet.has(`${i},${j}`);
                  const isMatch = i > 0 && j > 0 && matchSet.has(`${i},${j}`);
                  const arrow   = ARROW[bRows[i][j]] ?? "";

                  const cellClass = onPath
                    ? "lis-cell lis-cell-path"
                    : isMatch
                    ? "lis-cell lis-cell-match"
                    : "lis-cell";

                  return (
                    <td key={j} className={cellClass}>
                      <span className="lis-cell-val">{val}</span>
                      {i > 0 && j > 0 && arrow && (
                        <span className="lis-cell-arrow">{arrow}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default LISTable;
