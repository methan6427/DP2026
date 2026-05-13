// ============================================================
// components/ResultPanel.tsx
//
// PURPOSE:
//   Shows the algorithm's OUTPUT to the user:
//     1. The maximum number of LEDs that can be lit (the answer).
//     2. Which specific LEDs are in the optimal solution.
//     3. An expandable step-by-step trace — every comparison the
//        inner loop made, and the full backtracking path.
//
// This component does NO computation — it only displays data.
// All numbers come from the LISResult object passed in as a prop.
// This separation (compute in lis.ts, display here) is called the
// "separation of concerns" principle: each piece of code has one job.
// ============================================================

// ------------------------------------------------------------
// IMPORTS
//
// React → Required to write JSX. Every component file needs this.
//
// LISResult → The TypeScript type that describes what computeLIS()
//             returns. Fields used here:
//               leds         → the original permutation array
//               dp           → the DP values array
//               parent       → the predecessor index array
//               maxLEDs      → the answer (max number of lit LEDs)
//               chosenIndices→ 0-based positions in the optimal chain
//               chosenLEDs   → LED values in the optimal chain
// ------------------------------------------------------------
import React from "react";
import type { LISResult } from "../types";

// ------------------------------------------------------------
// PROPS INTERFACE
// This component expects exactly one prop: "result" of type LISResult.
// ------------------------------------------------------------
interface Props {
  result: LISResult;
}

const ResultPanel: React.FC<Props> = ({ result }) => {

  // ----------------------------------------------------------
  // DESTRUCTURING — pull out only the fields we need from result.
  //
  // "const n = leds.length" gives us the total count of LEDs.
  // .length is a built-in property of every JavaScript array.
  // ----------------------------------------------------------
  const { leds, dp, parent, maxLEDs, chosenIndices, chosenLEDs } = result;
  const n = leds.length;

  return (
    <div className="result-panel card">
      <h2>Result</h2>

      {/* ---- THE ANSWER ---- */}
      <div className="answer-box">
        <span className="answer-label">Maximum LEDs that can be lit:</span>
        {/*
          {maxLEDs} inserts the number directly into the JSX.
          React converts the number to a string automatically.
        */}
        <span className="answer-value">{maxLEDs}</span>
      </div>

      {/* ---- THE CHOSEN LEDs ---- */}
      <div className="chosen-section">
        <p>
          <strong>Optimal LED connections (board L order, top → bottom):</strong>
        </p>
        <div className="led-chips">
          {/*
            chosenLEDs.map((led, k) => (...))
            ──────────────────────────────────
            We loop over the chosen LED values array.
            For each value "led" at index "k", we render a coloured badge.

            chosenLEDs e.g. [2, 3, 5]
            chosenIndices   [0, 2, 3]   ← positions on board L

            Inside the badge we show both the LED value AND its position:
              LED 2  (row 0)
              LED 3  (row 2)
              LED 5  (row 3)

            &nbsp; is a non-breaking HTML space — prevents the text from
            wrapping between "LED" and the number.
          */}
          {chosenLEDs.map((led, k) => (
            <span key={k} className="led-chip chosen">
              LED {led}&nbsp;→ row&nbsp;{chosenIndices[k]}
            </span>
          ))}
        </div>
      </div>

      {/* ---- STEP-BY-STEP DP FILL TRACE ---- */}
      {/*
        <details> and <summary> are standard HTML5 elements.
        <details> creates a collapsible/expandable section.
        <summary> is the always-visible clickable header.
        When the user clicks the summary, the rest of <details> expands.
        No JavaScript needed — the browser handles this natively.
        This keeps the trace hidden by default (it can be very long)
        but always available for the instructor to inspect.
      */}
      <details className="trace-details">
        <summary>Step-by-step DP fill trace (click to expand)</summary>

        <div className="trace-body">
          <p>
            The DP table is filled left to right: i = 0 up to {n - 1}.
            For each i, we check every j &lt; i to see if L[j] &lt; L[i]
            (meaning those two wires would NOT cross).
          </p>

          {/*
            <ol> is an ordered list (numbered 1, 2, 3...).
            Each <li> is one step — one value of i.
          */}
          <ol>
            {leds.map((val, i) => {

              // --------------------------------------------------
              // For each position i, rebuild every comparison the
              // inner loop made. This is purely for DISPLAY —
              // the actual algorithm already ran in computeLIS().
              //
              // We loop j from 0 to i-1 and reconstruct what happened.
              // --------------------------------------------------
              const checks: string[] = [];   // will hold one string per comparison

              for (let j = 0; j < i; j++) {
                if (leds[j] < val) {
                  // This j was a VALID predecessor (no crossing).
                  // candidate = dp[j] + 1 is what dp[i] would be if we picked j.
                  const candidate = dp[j] + 1;

                  // parent[i] === j means the algorithm DID pick this j
                  // as the best predecessor for position i.
                  const wasBest = parent[i] === j;

                  checks.push(
                    `j=${j}: L[${j}]=${leds[j]} < L[${i}]=${val}` +
                    ` → no crossing → candidate = dp[${j}]+1 = ${candidate}` +
                    (wasBest ? " ← SELECTED (best)" : "")
                  );
                } else {
                  // This j was INVALID — the wire would cross.
                  checks.push(
                    `j=${j}: L[${j}]=${leds[j]} ≥ L[${i}]=${val}` +
                    ` → wires would cross → skip`
                  );
                }
              }

              return (
                <li key={i}>
                  <strong>i={i}, L[i]={val}:</strong>

                  {/*
                    checks.length === 0 means i = 0 (no j to check).
                    We use a ternary to show different content:
                      condition ? (show if true) : (show if false)
                  */}
                  {checks.length === 0 ? (
                    <span> First position — no predecessors → dp[{i}] = 1.</span>
                  ) : (
                    <ul>
                      {checks.map((line, k) => (
                        <li key={k}>{line}</li>
                      ))}
                      <li>
                        <em>
                          Result: dp[{i}] = {dp[i]},&nbsp;
                          parent[{i}] = {parent[i] === -1 ? "—" : parent[i]}
                        </em>
                      </li>
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          {/* ---- BACKTRACKING TRACE ---- */}
          <div className="backtrack-section">
            <strong>Backtracking through parent[] to find the optimal chain:</strong>
            {/*
              [...chosenIndices] creates a SHALLOW COPY of the array.
              The spread operator "..." expands the array into individual
              elements inside a new array literal [].
              We need a copy because .reverse() mutates the array IN PLACE —
              we don't want to modify the original chosenIndices.

              .reverse() flips the order: [0, 2, 3] → [3, 2, 0]
              This gives us the backtracking order (last-to-first).
            */}
            <ol>
              {[...chosenIndices].reverse().map((idx, k) => (
                <li key={k}>
                  Index {idx} (LED={leds[idx]}, dp={dp[idx]})
                  {/*
                    Ternary decides what text to show after each step:
                    If parent[idx] === -1, this is the START of the chain.
                    Otherwise show which index we came from.
                  */}
                  {parent[idx] === -1
                    ? " ← start of chain (parent = −1, no further back)"
                    : ` ← follow parent[${idx}] = ${parent[idx]}`}
                </li>
              ))}
            </ol>
            <p>
              Forward order: indices&nbsp;
              {/*
                {chosenIndices.join(", ")} converts [0, 2, 3] → "0, 2, 3"
                .join(separator) concatenates array elements with separator.
              */}
              <code>[{chosenIndices.join(", ")}]</code>
              &nbsp;→ LED values&nbsp;
              <code>[{chosenLEDs.join(", ")}]</code>
            </p>
          </div>
        </div>
      </details>
    </div>
  );
};

export default ResultPanel;
