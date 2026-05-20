// ============================================================
// components/DPTable.tsx
//
// PURPOSE:
//   Renders the Dynamic Programming table that the project sheet
//   explicitly requires. Each row of the table corresponds to one
//   physical position on board L (one LED) and shows:
//
//   ┌────────┬──────────────┬───────┬────────────┬──────────────────────────┐
//   │ Index i│ LED value L[i]│ dp[i] │ parent[i]  │ How dp[i] was computed   │
//   └────────┴──────────────┴───────┴────────────┴──────────────────────────┘
//
// HOW TO READ EACH COLUMN:
//
//   Index i
//     The 0-based physical position (row) on board L.
//     Position 0 = topmost LED on board L.
//
//   LED value L[i]
//     The LABEL of the LED at position i.
//     This is directly from the input permutation.
//     LED with label k must connect to Source k on board S.
//
//   dp[i]  ← THE CORE DP VALUE
//     The length of the longest non-crossing chain of wire
//     connections whose LAST wire ends at position i.
//
//     Recurrence:
//       dp[i] = 1 + max{ dp[j]  |  j < i  AND  L[j] < L[i] }
//       dp[i] = 1   if no such j exists (fresh chain of length 1)
//
//     Why L[j] < L[i]?
//       Source j on S is physically ABOVE source i on S (since sources
//       are sorted). If L[j] < L[i], both the LED-side AND the source-side
//       of wire j sit ABOVE the corresponding sides of wire i.
//       → The two wires are parallel. They do NOT cross.
//       → We can keep both in our solution.
//
//   parent[i]
//     The index j that was used to compute dp[i].
//     Meaning: "L[j] is the LED just BEFORE L[i] in the optimal chain."
//     We follow parent[] pointers backwards to reconstruct the solution.
//     -1 means L[i] starts a brand-new chain (no predecessor found).
//
//   Highlighted rows (green)
//     The indices that belong to the optimal solution,
//     found by backtracking through parent[] from the index with max dp.
// ============================================================

// ------------------------------------------------------------
// IMPORTS
//
// React   → Needed to write JSX (the HTML-like syntax inside return()).
//           Even though "React" isn't explicitly called anywhere in this
//           file, it must be in scope for JSX to work. Modern React (17+)
//           can auto-import it, but being explicit is clearer.
//
// LISResult → The TypeScript type (interface) that describes the shape of
//              the result object produced by computeLIS() in utils/lis.ts.
//              Importing only the TYPE means zero impact on bundle size.
// ------------------------------------------------------------
import React from "react";
import type { LISResult } from "../types";

// ------------------------------------------------------------
// PROPS INTERFACE
//
// This component needs the full algorithm result to build the table.
// We declare a Props interface with a single property: "result".
//
// "result: LISResult" means the parent must pass an object that has
// all the fields defined in the LISResult interface (leds, dp, parent,
// maxLEDs, chosenIndices, chosenLEDs).
//
// TypeScript will show a compile error if the parent passes the wrong
// thing or forgets to pass result at all. That is the purpose of types.
// ------------------------------------------------------------
interface Props {
  result: LISResult;
}

// ------------------------------------------------------------
// THE COMPONENT
//
// We use DESTRUCTURING in the parameter list: ({ result })
// This is equivalent to:
//   const props = { result: someValue };
//   const result = props.result;
// but written in one step directly in the function signature.
// ------------------------------------------------------------
const DPTable: React.FC<Props> = ({ result }) => {

  // ----------------------------------------------------------
  // FURTHER DESTRUCTURING FROM result
  //
  // "const { leds, dp, parent, chosenIndices } = result;"
  //
  // The LISResult object has many fields. We only need four of them
  // here, so we destructure just those four.
  //
  // This is equivalent to:
  //   const leds          = result.leds;
  //   const dp            = result.dp;
  //   const parent        = result.parent;
  //   const chosenIndices = result.chosenIndices;
  // ----------------------------------------------------------
  const { leds, dp, parent, chosenIndices } = result;

  // ----------------------------------------------------------
  // new Set(chosenIndices)
  //
  // "chosenIndices" is an array like [0, 2, 3] — the positions that
  // form the optimal LIS.
  //
  // A JavaScript Set is a collection of UNIQUE values. Its .has(x)
  // method answers "is x in this set?" in O(1) constant time.
  //
  // WHY not use chosenIndices.includes(i) instead?
  //   .includes() loops through the array — O(n) time.
  //   .has() on a Set is O(1) — much faster when we check membership
  //   for every single row in the table (n times total → O(n) with Set
  //   vs O(n²) with includes). For large n this matters.
  // ----------------------------------------------------------
  const chosenSet = new Set(chosenIndices);

  // ----------------------------------------------------------
  // RETURN THE JSX — the actual rendered HTML table
  // ----------------------------------------------------------
  return (
    <div className="dp-table-section card">
      <h2>DP Table — Direct LIS Formulation</h2>

      {/*
        ---- Header note ----
        This banner explains the relationship between the LCS table above
        and this direct LIS table, so the instructor sees both formulations
        are equivalent.

        Per COM336 Chapter 2: the DP approach for LIS follows the same
        four steps as the general DP strategy (Characterize, Recurrence,
        Compute, Find optimal) — applied directly to the LED permutation
        without going through LCS.
      */}
      <div className="dp-lis-note">
        <strong>Direct LIS formulation</strong> — mathematically equivalent
        to LCS(L, sorted(L)) shown above.
        &nbsp;dp[i] = length of longest non-crossing chain ending at position i.
        &nbsp;Both tables must produce the same answer.
      </div>

      {/* ---- Recurrence formula box ---- */}
      <div className="recurrence-box">
        <strong>Recurrence relation (from Chapter 2 — Dynamic Programming):</strong>
        {/*
          We display curly braces { } as HTML entities &#123; and &#125;
          because JSX treats { } as "JavaScript expression start/end".
          To show a literal brace character we must escape it.
          &lt; is the HTML entity for the less-than sign <.
          &nbsp; is a non-breaking space (keeps text from wrapping oddly).
        */}
        <code>
          dp[i] = 1 + max&#123; dp[j] | j &lt; i, L[j] &lt; L[i] &#125;
          &nbsp;&nbsp;(or 1 if no such j exists)
        </code>
      </div>

      {/* ---- The DP table ---- */}
      <div className="table-wrapper">
        <table className="dp-table">
          <thead>
            <tr>
              <th>Index&nbsp;i</th>
              <th>LED value&nbsp;L[i]</th>
              {/*
                Board S source column — reinforces the physical meaning:
                LED with label L[i] MUST connect to Source L[i] on board S.
                So "Board S source" is always the same value as "LED value L[i]".
                Showing it explicitly makes the wire-matching constraint visible.
              */}
              <th>Board&nbsp;S&nbsp;source</th>
              <th>dp[i]</th>
              <th>parent[i]</th>
              <th>How dp[i] was computed</th>
            </tr>
          </thead>
          <tbody>
            {/*
              leds.map((val, i) => (...))
              ─────────────────────────────
              .map() is called on the "leds" array.
              It loops over every element and calls the callback function
              for each one, collecting the return values into a new array.

              The callback receives TWO arguments:
                val → the LED value at this position (e.g. 2, 6, 3, 5...)
                i   → the index / position (0, 1, 2, 3...)

              For each (val, i) pair we return a <tr> (table row).
              React renders all the returned <tr> elements inside <tbody>.
            */}
            {leds.map((val, i) => {

              // Is this index part of the optimal chosen set?
              // chosenSet.has(i) returns true or false.
              const isChosen = chosenSet.has(i);

              // Retrieve the predecessor index for this position.
              // parent[i] = -1 means "no predecessor" (dp[i] = 1).
              const par = parent[i];

              // --------------------------------------------------
              // Build a human-readable explanation string for the
              // last column — "How dp[i] was computed".
              //
              // "let" (not "const") because we assign it in an if/else.
              // With "const" you cannot reassign after declaration.
              // With "let" you can assign it once inside each branch.
              //
              // Template literals:  `text ${expression} text`
              // The ${} part is evaluated and inserted into the string.
              // --------------------------------------------------
              let explanation: string;

              if (i === 0) {
                // Position 0 is always the base case.
                // There are no positions before 0, so no j < 0 exists.
                // The chain can only contain this one element → dp[0] = 1.
                explanation =
                  `Base case: position 0 has no predecessor. ` +
                  `dp[0] = 1 (a chain containing only LED ${val}).`;

              } else if (par === -1) {
                // dp[i] = 1, but this is NOT position 0.
                // It means we scanned all j < i and NONE had L[j] < L[i].
                // So no existing chain can be extended — start fresh.
                explanation =
                  `No LED before position ${i} has a value smaller than L[${i}]=${val}. ` +
                  `No chain can be extended → dp[${i}] = 1 (new chain starts here).`;

              } else {
                // dp[i] = dp[par] + 1.
                // "par" is the index j that gave the best extension.
                // L[par] < L[i], so the wire at par doesn't cross the wire at i.
                // We extend par's chain by adding position i → length goes up by 1.
                explanation =
                  `Best predecessor found at j=${par}: ` +
                  `L[${par}]=${leds[par]} < L[${i}]=${val} (no crossing). ` +
                  `Extend chain of length ${dp[par]} by 1 → ` +
                  `dp[${i}] = ${dp[par]} + 1 = ${dp[i]}.`;
              }

              return (
                /*
                  key={i}
                  React requires a "key" prop on every element inside a
                  .map(). The key helps React identify which row is which
                  when the table is updated. Using the index i is fine here
                  because the table rows never reorder — they always appear
                  in order 0, 1, 2, ...

                  className={isChosen ? "row-chosen" : ""}
                  ─────────────────────────────────────────
                  This is a TERNARY OPERATOR:   condition ? valueIfTrue : valueIfFalse
                  If isChosen is true  → className = "row-chosen"  (green highlight)
                  If isChosen is false → className = ""            (normal style)

                  title={explanation}
                  The HTML "title" attribute shows a tooltip when you hover
                  the mouse over the row. We put the explanation there as a
                  bonus, in addition to showing it in the last cell.
                */
                <tr
                  key={i}
                  className={isChosen ? "row-chosen" : ""}
                  title={explanation}
                >
                  {/* 0-based position on board L */}
                  <td>{i}</td>

                  {/* The LED label (its value from the input permutation) */}
                  <td className="led-val">{val}</td>

                  {/*
                    Board S source — the source this LED's wire ends at.
                    LED label = source label (by problem definition),
                    so this column is always equal to the LED value.
                    Shown separately to make the physical connection explicit.
                  */}
                  <td className="src-val">S{val}</td>

                  {/* The DP value — the core result of the algorithm */}
                  <td className="dp-val">{dp[i]}</td>

                  {/*
                    The predecessor index.
                    par === -1 ? "—" : par
                    Another ternary: show a dash when there is no predecessor,
                    show the actual index number otherwise.
                  */}
                  <td className="parent-val">
                    {par === -1 ? "—" : par}
                  </td>

                  {/* Full sentence explanation of how this cell was filled */}
                  <td className="explanation">{explanation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DPTable;
