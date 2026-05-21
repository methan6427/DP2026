// 1D LIS DP table — shows the dp[i] values and highlights the chosen chain
import React from "react";
import type { LISResult } from "../types";

interface Props {
  result: LISResult;
}

const LISTable: React.FC<Props> = ({ result }) => {
  const { leds, dp, chosenIndices, maxLEDs, chosenLEDs } = result;

  // Convert chosenIndices to a Set for O(1) lookup
  const chosenSet = new Set(chosenIndices);

  // Find the index where dp reaches its maximum
  let maxIndex = 0;
  for (let i = 0; i < dp.length; i++) {
    if (dp[i] > dp[maxIndex]) {
      maxIndex = i;
    }
  }

  return (
    <div className="lis-table-card card">
      <h2>LIS DP Table</h2>

      {/* Recurrence formula */}
      <div className="recurrence-box">
        <strong>Recurrence:</strong>
        <code>dp[i] = 1 + max{"{"}dp[j] | j &lt; i, L[j] &lt; L[i]{"}"}  &nbsp; Time: O(n²)  &nbsp; Space: O(n)</code>
        <code>Initial: dp[i] = 1</code>
      </div>

      {/* Legend */}
      <div className="lis-legend">
        <span className="lis-legend-item lis-legend-path">Chosen chain (part of LIS)</span>
        <span className="lis-legend-item lis-legend-match">Maximum dp value</span>
      </div>

      {/* The 1D DP table */}
      <div className="table-wrapper">
        <table className="lis-table-1d">
          <tbody>
            {/* Row 1: Index headers */}
            <tr>
              <th className="lis-th-label"></th>
              {leds.map((_, i) => (
                <th key={`idx-${i}`} className="lis-th-index">
                  i={i}
                </th>
              ))}
            </tr>

            {/* Row 2: LED values */}
            <tr>
              <th className="lis-th-label">LED</th>
              {leds.map((led, i) => (
                <td key={`led-${i}`} className="lis-cell lis-cell-led">
                  <span className="lis-cell-val">{led}</span>
                </td>
              ))}
            </tr>

            {/* Row 3: DP values */}
            <tr>
              <th className="lis-th-label">dp[i]</th>
              {dp.map((value, i) => {
                const isChosen = chosenSet.has(i);
                const isMax = i === maxIndex;

                let cellClass = "lis-cell";
                if (isChosen) cellClass += " lis-cell-chosen";
                if (isMax) cellClass += " lis-cell-max";

                return (
                  <td key={`dp-${i}`} className={cellClass}>
                    <span className="lis-cell-val">{value}</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Result summary */}
      <div className="lis-result-box">
        <span className="lis-result-label">Chosen LEDs (LIS chain):</span>
        <span className="lis-result-val">
          [{chosenLEDs.join(", ")}] &nbsp; → length <strong>{maxLEDs}</strong>
        </span>
      </div>
    </div>
  );
};

export default LISTable;
