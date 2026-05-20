// Input form — lets the user enter n and the LED permutation, then run the algorithm
import React, { useState } from "react";
import type { TestCase } from "../types";
import { generateRandomPermutation } from "../utils/lis";

// Preset test cases — defined once at module level, never recreated
const PRESETS: TestCase[] = [
  {
    label: "Project Example (n=6)",
    n: 6,
    leds: [2, 6, 3, 5, 4, 1],
    // LIS = 3: chain [2, 3, 5] or [2, 3, 4]
  },
  {
    label: "Already Sorted (n=5) — Best Case",
    n: 5,
    leds: [1, 2, 3, 4, 5],
    // LIS = 5: all wires are parallel, no crossings
  },
  {
    label: "Reverse Sorted (n=5) — Worst Case",
    n: 5,
    leds: [5, 4, 3, 2, 1],
    // LIS = 1: every pair of wires crosses
  },
  {
    label: "Alternating (n=8)",
    n: 8,
    leds: [2, 8, 3, 7, 4, 6, 5, 1],
    // LIS = 4: chain [2, 3, 4, 5] or [2, 3, 4, 6]
  },
  {
    label: "Large (n=10)",
    n: 10,
    leds: [3, 1, 4, 7, 5, 9, 2, 6, 8, 10],
    // LIS = 6
  },
  {
    label: "LCS Demo (n=7) — Ref Ch.2",
    n: 7,
    leds: [4, 1, 6, 2, 7, 3, 5],
    // LIS = 4, LCS([4,1,6,2,7,3,5], [1,2,3,4,5,6,7]) = 4 ✓
  },
];

// onRun is called with the validated LED array when the user clicks Run
interface Props {
  onRun: (leds: number[]) => void;
}

const InputPanel: React.FC<Props> = ({ onRun }) => {

  // n = number of LEDs; permText = raw text in the textarea
  const [n,        setN]        = useState<number>(6);
  const [permText, setPermText] = useState<string>("2 6 3 5 4 1");
  const [error,    setError]    = useState<string>("");

  // Validate the textarea content and call onRun if it passes
  const parseAndRun = () => {
    setError("");

    // Parse: trim → split on spaces/commas → remove empty strings → convert to numbers
    const parts = permText
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    // Validation 1: count must equal n
    if (parts.length !== n) {
      setError(`Expected ${n} numbers but got ${parts.length}. Enter exactly n numbers.`);
      return;
    }

    // Validation 2: every value must be a whole number in [1, n]
    const bad = parts.find((v) => !Number.isInteger(v) || v < 1 || v > n);
    if (bad !== undefined) {
      setError(`All values must be whole numbers between 1 and ${n}.`);
      return;
    }

    // Validation 3: no duplicates — a permutation uses each value exactly once
    if (new Set(parts).size !== n) {
      setError("Values must be a permutation — no duplicates allowed.");
      return;
    }

    onRun(parts);
  };

  // Load a preset: update both fields and immediately run
  const loadPreset = (tc: TestCase) => {
    setN(tc.n);
    setPermText(tc.leds.join(" "));
    setError("");
    onRun(tc.leds);
  };

  // Generate a random permutation of [1..n] and run it
  const randomCase = () => {
    const perm = generateRandomPermutation(n);
    setPermText(perm.join(" "));
    setError("");
    onRun(perm);
  };

  return (
    <div className="input-panel card">
      <h2>Input</h2>

      {/* Number of LEDs */}
      <div className="field-row">
        <label htmlFor="n-input">Number of LEDs (n):</label>
        <input
          id="n-input"
          type="number"
          min={1}
          max={100}
          value={n}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1 && val <= 100) setN(val);
          }}
        />
      </div>

      {/* LED permutation */}
      <div className="field-row col">
        <label htmlFor="perm-input">
          LED permutation (space-separated, values 1 to n):
        </label>
        <textarea
          id="perm-input"
          rows={3}
          value={permText}
          onChange={(e) => setPermText(e.target.value)}
          placeholder="e.g.  2 6 3 5 4 1"
        />
      </div>

      {/* Show validation error only when there is one */}
      {error && <p className="error-msg">{error}</p>}

      {/* Action buttons */}
      <div className="btn-row">
        <button className="btn primary" onClick={parseAndRun}>
          Run Algorithm
        </button>
        <button className="btn secondary" onClick={randomCase}>
          Random (n={n})
        </button>
      </div>

      {/* Preset test cases */}
      <div className="presets">
        <p className="presets-label">Preset test cases:</p>
        <div className="preset-btns">
          {PRESETS.map((tc) => (
            // Arrow function delays the call — onClick={loadPreset(tc)} would call immediately
            <button
              key={tc.label}
              className="btn preset"
              onClick={() => loadPreset(tc)}
            >
              {tc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
