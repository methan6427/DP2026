// ============================================================
// components/InputPanel.tsx
//
// PURPOSE:
//   This component owns everything related to USER INPUT:
//     • A number field for n (how many LEDs / sources).
//     • A text area where the user types the LED permutation.
//     • Validation logic (checks the permutation is correct).
//     • Preset test cases so the instructor can verify results fast.
//     • A "Random" button that generates a shuffled permutation.
//
// WHAT IS A COMPONENT FILE?
//   Each .tsx file typically defines ONE component.
//   The component is a function that React calls to get the HTML to display.
//   We export it so App.tsx can import and use it.
// ============================================================

// ------------------------------------------------------------
// IMPORTS
//
// React     → Core library. Needed in every component file.
// useState  → The hook that lets this component remember its own data
//             (n, the text in the textarea, any error message).
//             Hooks are special React functions that start with "use".
//             They can only be called at the TOP LEVEL of a component
//             function — never inside loops or if-statements.
//
// TestCase  → A TypeScript TYPE (an interface) defined in src/types/index.ts.
//             "import type" means we only import the type blueprint,
//             not any runtime value — zero cost at runtime.
//
// generateRandomPermutation → A plain utility function from our lis.ts file.
// ------------------------------------------------------------
import React, { useState } from "react";
import type { TestCase } from "../types";
import { generateRandomPermutation } from "../utils/lis";

// ------------------------------------------------------------
// PRESET TEST CASES
//
// This is a MODULE-LEVEL constant — it lives outside the component
// function. That means it is created ONCE when the file first loads
// and never recreated. It does not need to be inside the component
// because it never changes.
//
// "const PRESETS: TestCase[]"
//   • const  → this variable cannot be reassigned.
//   • TestCase[] → TypeScript array type: each element must match
//     the TestCase interface shape (label, n, leds properties).
//   • []  → array literal containing the preset objects.
//
// Each object inside has:
//   label  → string shown on the button
//   n      → number of LEDs in this test case
//   leds   → the permutation array
// ------------------------------------------------------------
const PRESETS: TestCase[] = [
  {
    label: "Project Example (n=6)",
    n: 6,
    leds: [2, 6, 3, 5, 4, 1],
    // LIS answer = 3. Optimal chain: [2, 3, 5] or [2, 3, 4].
    // This is the exact example from the project sheet.
  },
  {
    label: "Already Sorted (n=5) — Best Case",
    n: 5,
    leds: [1, 2, 3, 4, 5],
    // When LEDs are already in order, EVERY wire is parallel (no crossings).
    // LIS = 5 → all LEDs can be lit.
  },
  {
    label: "Reverse Sorted (n=5) — Worst Case",
    n: 5,
    leds: [5, 4, 3, 2, 1],
    // When LEDs are in reverse order, EVERY pair of wires crosses.
    // LIS = 1 → only 1 LED can be lit at a time.
  },
  {
    label: "Alternating (n=8)",
    n: 8,
    leds: [2, 8, 3, 7, 4, 6, 5, 1],
    // LIS = 4. Chain: [2, 3, 4, 5] or [2, 3, 4, 6].
  },
  {
    label: "Large (n=10)",
    n: 10,
    leds: [3, 1, 4, 7, 5, 9, 2, 6, 8, 10],
    // LIS = 6. Chain: [1, 4, 5, 6, 8, 10] or similar.
  },
  {
    // Per COM336 Chapter 2 — this test case lets the instructor verify
    // that LCS(L, sorted(L)) == LIS(L) on a non-trivial permutation.
    // LIS = 4. Chain: [1, 2, 3, 5].
    // LCS([4,1,6,2,7,3,5], [1,2,3,4,5,6,7]) = 4  ✓
    label: "LCS Demo (n=7) — Ref Ch.2",
    n: 7,
    leds: [4, 1, 6, 2, 7, 3, 5],
  },
];

// ------------------------------------------------------------
// PROPS INTERFACE
//
// "Props" (short for "properties") are the inputs a component receives
// from its parent — like function arguments, but for components.
//
// "interface Props" defines the SHAPE of the props object.
// TypeScript uses this to:
//   • Auto-complete prop names in the editor.
//   • Show an error if you pass the wrong type or forget a prop.
//
// Here, InputPanel expects ONE prop:
//   onRun: (leds: number[]) => void
//     • (leds: number[]) → a function that takes an array of numbers
//     • => void           → and returns nothing (just performs an action)
//
// The parent (App.tsx) passes its "handleRun" function here.
// When InputPanel calls onRun(parsedArray), it actually calls
// App's handleRun, which runs the DP algorithm and updates the UI.
// This is how child components communicate back to their parent.
// ------------------------------------------------------------
interface Props {
  onRun: (leds: number[]) => void;
}

// ------------------------------------------------------------
// THE COMPONENT FUNCTION
//
// "const InputPanel: React.FC<Props> = ({ onRun }) => { ... }"
//
// Breaking this down:
//   const InputPanel    → we name this component "InputPanel"
//   : React.FC<Props>   → TypeScript: this is a React Function Component
//                         that expects props matching the Props interface
//   = ({ onRun }) => { → Arrow function. The argument is the props object.
//                        { onRun } is "destructuring" — instead of writing
//                        props.onRun everywhere, we pull out onRun directly.
//
// DESTRUCTURING EXPLAINED:
//   If props = { onRun: someFunction }, then
//   { onRun } = props   gives us   onRun = someFunction
//   It's just a shortcut for:  const onRun = props.onRun;
// ------------------------------------------------------------
const InputPanel: React.FC<Props> = ({ onRun }) => {

  // ----------------------------------------------------------
  // STATE VARIABLES (each useState call manages one piece of data)
  //
  // useState<number>(6)
  //   • Stores the number n (starts at 6).
  //   • "n" is the current value.
  //   • "setN" is the function to update it.
  //   • When setN is called, React re-renders this component
  //     and the input field shows the new number.
  // ----------------------------------------------------------
  const [n, setN] = useState<number>(6);

  // ----------------------------------------------------------
  // useState<string>("2 6 3 5 4 1")
  //   • Stores whatever the user has typed in the textarea.
  //   • Starts with the project example already filled in.
  //   • "permText" is the current string value.
  //   • "setPermText" updates it whenever the user types.
  // ----------------------------------------------------------
  const [permText, setPermText] = useState<string>("2 6 3 5 4 1");

  // ----------------------------------------------------------
  // useState<string>("")
  //   • Stores an error message to show the user.
  //   • Starts empty (no error).
  //   • Set to a message string when validation fails.
  //   • Reset back to "" at the start of every new run.
  // ----------------------------------------------------------
  const [error, setError] = useState<string>("");

  // ----------------------------------------------------------
  // parseAndRun  —  validates the textarea input, then runs the algorithm.
  //
  // This is a regular JavaScript function defined inside the component.
  // It "closes over" the state variables above — it can read n, permText,
  // and call setError, onRun etc. because they are in the same scope.
  // This is called a "closure" in JavaScript.
  // ----------------------------------------------------------
  const parseAndRun = () => {

    // Clear any previous error before starting fresh validation.
    setError("");

    // ----------------------------------------------------------
    // PARSING THE TEXT INPUT
    //
    // The user types something like "2 6 3 5 4 1" (or uses commas).
    // We need to turn that string into an actual array of numbers.
    //
    // Step 1: permText.trim()
    //   Removes leading/trailing spaces. "  2 6 3  " → "2 6 3"
    //
    // Step 2: .split(/[\s,]+/)
    //   Splits the string at any whitespace (\s) or comma (,),
    //   one or more times (+).
    //   "2 6  3,5" → ["2", "6", "3", "5"]
    //   The result is an ARRAY OF STRINGS.
    //
    // Step 3: .filter(Boolean)
    //   Removes any empty strings that splitting might create.
    //   Boolean("") → false, so empty strings are filtered out.
    //   Boolean("2") → true, so real values are kept.
    //
    // Step 4: .map(Number)
    //   Converts each string to a number.
    //   .map() creates a NEW array by applying a function to every element.
    //   Number("2") → 2,  Number("6") → 6,  etc.
    //   ["2", "6", "3"] → [2, 6, 3]
    // ----------------------------------------------------------
    const parts = permText
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    // ----------------------------------------------------------
    // VALIDATION 1: count check
    //   parts.length is how many numbers the user entered.
    //   It must exactly equal n (the declared number of LEDs).
    //
    //   Template literal syntax: `text ${variable} text`
    //   The ${...} part is replaced with the actual value.
    //   So `Expected ${n} numbers` becomes e.g. "Expected 6 numbers".
    // ----------------------------------------------------------
    if (parts.length !== n) {
      setError(
        `Expected ${n} numbers but got ${parts.length}. ` +
        `Enter exactly n numbers.`
      );
      return; // "return" exits the function early — skip the algorithm.
    }

    // ----------------------------------------------------------
    // VALIDATION 2: value range check
    //   Every number must be an integer between 1 and n (inclusive).
    //
    //   parts.find() searches the array and returns the FIRST element
    //   that satisfies the condition, or undefined if none does.
    //
    //   !Number.isInteger(v) → true if v is not a whole number (e.g. 3.5)
    //   v < 1                → below the valid range
    //   v > n                → above the valid range
    //
    //   "bad !== undefined" means we found a bad value.
    // ----------------------------------------------------------
    const bad = parts.find((v) => !Number.isInteger(v) || v < 1 || v > n);
    if (bad !== undefined) {
      setError(`All values must be whole numbers between 1 and ${n}.`);
      return;
    }

    // ----------------------------------------------------------
    // VALIDATION 3: permutation check (no duplicates)
    //   A permutation means each number from 1 to n appears EXACTLY once.
    //
    //   new Set(parts) creates a Set — a collection of UNIQUE values.
    //   If parts has duplicates, the Set is smaller than parts.
    //   .size gives the count of elements in the Set.
    //
    //   Example: [2, 6, 2, 5, 4, 1] → Set {2, 6, 5, 4, 1} → size 5
    //   But n = 6, so 5 !== 6 → validation fails.
    // ----------------------------------------------------------
    if (new Set(parts).size !== n) {
      setError("Values must be a permutation — no duplicates allowed.");
      return;
    }

    // All validations passed. Tell the parent to run the algorithm.
    // onRun is the function App.tsx gave us via props.
    onRun(parts);
  };

  // ----------------------------------------------------------
  // loadPreset  —  loads a preset test case and immediately runs it.
  //
  //   "tc: TestCase" → TypeScript says tc must match the TestCase interface.
  //
  //   tc.leds.join(" ") converts the array [2,6,3,5,4,1] back to the
  //   string "2 6 3 5 4 1" so it appears nicely in the textarea.
  // ----------------------------------------------------------
  const loadPreset = (tc: TestCase) => {
    setN(tc.n);
    setPermText(tc.leds.join(" "));
    setError("");
    onRun(tc.leds); // immediately run the algorithm with this preset
  };

  // ----------------------------------------------------------
  // randomCase  —  generate a random permutation and run it.
  //
  //   generateRandomPermutation(n) returns a shuffled array [1..n].
  //   We store it as text in the textarea (so the user can see it)
  //   and immediately run the algorithm.
  // ----------------------------------------------------------
  const randomCase = () => {
    const perm = generateRandomPermutation(n);
    setPermText(perm.join(" "));
    setError("");
    onRun(perm);
  };

  // ----------------------------------------------------------
  // THE RETURNED JSX (what gets drawn on screen)
  //
  // HOW EVENT HANDLERS WORK IN REACT:
  //   onChange={(e) => setPermText(e.target.value)}
  //
  //   • onChange is the React equivalent of the HTML onchange event.
  //   • (e) => ...  is an inline arrow function that React calls
  //     every time the user types a character.
  //   • "e" is the event object — it contains info about what happened.
  //   • e.target is the DOM element that fired the event (the textarea).
  //   • e.target.value is the current text inside the textarea.
  //   • setPermText(...)  updates the state → React re-renders →
  //     the textarea reflects the new text.
  //
  //   This pattern (state ↔ input in sync) is called a "controlled input".
  //   The React state IS the source of truth; the displayed text just
  //   mirrors the state.
  //
  // CONDITIONAL RENDERING:
  //   {error && <p className="error-msg">{error}</p>}
  //   If error is "" (empty string), && short-circuits and renders nothing.
  //   If error is "some message", it renders the <p> with that message.
  //
  // LIST RENDERING with .map():
  //   {PRESETS.map((tc) => (
  //     <button key={tc.label} ...>{tc.label}</button>
  //   ))}
  //   .map() returns a NEW array where each TestCase object is turned
  //   into a <button> element. React renders all of them.
  //
  //   The "key" prop is REQUIRED when rendering lists.
  //   React uses it internally to track which item is which when the
  //   list changes. It must be UNIQUE among siblings. Using the label
  //   string works fine here because all preset labels are different.
  // ----------------------------------------------------------
  return (
    <div className="input-panel card">
      <h2>Input</h2>

      {/* Number of LEDs control */}
      <div className="field-row">
        <label htmlFor="n-input">Number of LEDs (n):</label>
        <input
          id="n-input"
          type="number"
          min={1}
          max={100}
          value={n}
          onChange={(e) => {
            // parseInt converts the string "6" → number 6.
            // We pass 10 as the second argument to force base-10 parsing.
            const val = parseInt(e.target.value, 10);
            // Only update if the parsed value is a valid number in range.
            // isNaN(val) is true if parseInt failed (e.g. user typed letters).
            if (!isNaN(val) && val >= 1 && val <= 100) setN(val);
          }}
        />
      </div>

      {/* LED permutation textarea */}
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

      {/* Conditionally show error message only when there is one */}
      {error && <p className="error-msg">{error}</p>}

      {/* Action buttons */}
      <div className="btn-row">
        <button className="btn primary" onClick={parseAndRun}>
          Run Algorithm
        </button>
        {/*
          onClick={randomCase} attaches randomCase as the click handler.
          Note we write randomCase, NOT randomCase() — the parentheses
          would CALL the function immediately. Without parentheses we
          pass the function itself for React to call when clicked.
        */}
        <button className="btn secondary" onClick={randomCase}>
          Random (n={n})
        </button>
      </div>

      {/* Preset test cases */}
      <div className="presets">
        <p className="presets-label">Preset test cases:</p>
        <div className="preset-btns">
          {PRESETS.map((tc) => (
            /*
              Arrow function inside onClick:  () => loadPreset(tc)
              We need an arrow function here because we want to pass "tc"
              to loadPreset. If we wrote onClick={loadPreset(tc)}, that
              would call loadPreset immediately when the component renders,
              not when the button is clicked.
              The arrow function delays the call: "when clicked, run loadPreset(tc)".
            */
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

// Make InputPanel available for import in App.tsx.
export default InputPanel;
