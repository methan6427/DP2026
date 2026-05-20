// Shows the algorithm answer: max LEDs count and the chosen LED chain
import React from "react";
import type { LISResult } from "../types";

interface Props {
  result: LISResult;
}

const ResultPanel: React.FC<Props> = ({ result }) => {

  // Pull out only the fields needed for display
  const { chosenIndices, chosenLEDs, maxLEDs } = result;

  return (
    <div className="result-panel card">
      <h2>Result</h2>

      {/* The answer — shown large so it is easy to read */}
      <div className="answer-box">
        <span className="answer-label">Maximum LEDs lit:</span>
        <span className="answer-value">{maxLEDs}</span>
      </div>

      {/* Green badges — one per LED in the optimal chain */}
      <div className="chosen-section">
        <p><strong>Optimal connections (board L order, top → bottom):</strong></p>
        <div className="led-chips">
          {chosenLEDs.map((led, k) => (
            <span key={k} className="led-chip chosen">
              LED {led}&nbsp;→ row&nbsp;{chosenIndices[k]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;
