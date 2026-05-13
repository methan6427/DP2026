// ============================================================
// components/CircuitBoard.tsx
//
// PURPOSE:
//   Draws the two circuit boards (L and S) and the wires between them
//   as a scalable SVG image directly inside the browser.
//
// WHAT IS SVG?
//   SVG (Scalable Vector Graphics) is an XML-based format for drawing
//   shapes in the browser using coordinates. We use it here because:
//     • It scales perfectly at any screen size (no pixelation).
//     • We can position every element with exact coordinates.
//     • React can render SVG elements just like HTML elements.
//
// LAYOUT OVERVIEW:
//
//   |← BOARD_W →|←────── WIRE_W ──────→|← BOARD_W →|
//   ┌────────────┐                       ┌────────────┐
//   │  Board L   │ ──wire for LED 2──→   │  Board S   │
//   │  (LEDs)    │ ──wire for LED 6──→   │  (Sources) │
//   │            │ ──wire for LED 3──→   │  sorted    │
//   └────────────┘                       └────────────┘
//
// WIRE COLOURS (what they mean):
//   Gold  = wire is in the optimal (chosen) set → LED is lit
//   Red   = this wire would CROSS another wire (excluded by algorithm)
//   Grey  = wire doesn't cross, but wasn't needed for the optimal answer
// ============================================================

// ------------------------------------------------------------
// IMPORTS
//
// useMemo → A React hook for MEMOIZATION (explained in detail below).
// ------------------------------------------------------------
import React, { useMemo } from "react";
import type { LISResult } from "../types";

// ------------------------------------------------------------
// LAYOUT CONSTANTS (module-level, created once, never change)
//
// These are plain numbers defining the SVG coordinate system.
// Using named constants instead of magic numbers (like "40" or "200")
// makes the code readable — the name tells you what the number means.
// ------------------------------------------------------------
const ROW_H   = 40;   // vertical space (in SVG pixels) between two LED rows
const PAD_TOP = 30;   // space above the first row (so nodes don't clip the edge)
const PAD_SIDE = 20;  // horizontal padding on the left and right of the SVG
const BOARD_W = 100;  // width of each board's background rectangle
const WIRE_W  = 200;  // width of the gap between the two boards (where wires go)
const NODE_R  = 14;   // radius of each LED/Source circle node

// ------------------------------------------------------------
// PROPS INTERFACE
// ------------------------------------------------------------
interface Props {
  result: LISResult;
}

const CircuitBoard: React.FC<Props> = ({ result }) => {

  // Destructure only what we need from result.
  const { leds, chosenIndices } = result;
  const n = leds.length;

  // ----------------------------------------------------------
  // DISPLAY LIMIT
  //
  // For very large inputs (n > 20), the SVG would become too tall
  // to be readable on screen. We silently cap the visual at 20 rows.
  // The DP table and result panel always show ALL rows numerically.
  //
  // Math.min(a, b) returns the smaller of a and b.
  //   Math.min(6, 20) = 6    (small input → show all)
  //   Math.min(50, 20) = 20  (large input → cap at 20)
  //
  // .slice(0, displayN) returns a NEW array with only the first
  // displayN elements. The original array is unchanged.
  // ----------------------------------------------------------
  const displayN    = Math.min(n, 20);
  const displayLEDs = leds.slice(0, displayN);

  // ----------------------------------------------------------
  // new Set(chosenIndices)
  // Fast O(1) lookup: is position i in the chosen solution?
  // (See DPTable.tsx for a longer explanation of why Set > includes)
  // ----------------------------------------------------------
  const chosenSet = new Set(chosenIndices);

  // ----------------------------------------------------------
  // SVG COORDINATE CALCULATIONS
  //
  // The total SVG height depends on how many rows we draw.
  // We add PAD_TOP at the top AND bottom so nodes have breathing room.
  //
  // The total SVG width = left padding + left board + wire area + right board + right padding.
  // ----------------------------------------------------------
  const svgH = PAD_TOP * 2 + displayN * ROW_H;
  const svgW = PAD_SIDE * 2 + BOARD_W + WIRE_W + BOARD_W;

  // ----------------------------------------------------------
  // rowY — a helper function (not a component, just a utility).
  //
  // Given row index i, returns the Y coordinate of the CENTER of that row.
  // Formula: top padding + (row index × row height) + half a row height.
  //
  // Example with PAD_TOP=30, ROW_H=40:
  //   rowY(0) = 30 + 0*40 + 20 = 50
  //   rowY(1) = 30 + 1*40 + 20 = 90
  //   rowY(2) = 30 + 2*40 + 20 = 130
  // ----------------------------------------------------------
  const rowY = (i: number) => PAD_TOP + i * ROW_H + ROW_H / 2;

  // ----------------------------------------------------------
  // HORIZONTAL (X) POSITIONS for wires and nodes.
  //
  // Reading left → right:
  //   PAD_SIDE                     → left edge of L board background
  //   PAD_SIDE + BOARD_W/2         → center of L board (where LED circles sit)
  //   PAD_SIDE + BOARD_W           → right edge of L board (wire starts)
  //   PAD_SIDE + BOARD_W + WIRE_W  → left edge of S board (wire ends)
  //   PAD_SIDE + BOARD_W + WIRE_W + BOARD_W/2 → center of S board (source circles)
  // ----------------------------------------------------------
  const ledNodeX = PAD_SIDE + BOARD_W / 2;
  const ledWireX = PAD_SIDE + BOARD_W;
  const srcWireX = PAD_SIDE + BOARD_W + WIRE_W;
  const srcNodeX = PAD_SIDE + BOARD_W + WIRE_W + BOARD_W / 2;

  // ----------------------------------------------------------
  // useMemo  —  THE MEMOIZATION HOOK  (very important to understand)
  //
  // PROBLEM this solves:
  //   React re-renders a component every time its state or props change.
  //   Each re-render re-runs the ENTIRE component function from top to bottom.
  //   If we have an expensive calculation inside the function, it would
  //   repeat unnecessarily on EVERY re-render — even when the inputs
  //   to that calculation haven't changed.
  //
  // WHAT IS MEMOIZATION?
  //   Memoization means: "remember the result of a calculation, and
  //   reuse it if the inputs are the same — don't recalculate."
  //   It is a general computer science optimization technique.
  //
  // HOW useMemo WORKS:
  //   const result = useMemo(() => {
  //     return someExpensiveCalculation(a, b);
  //   }, [a, b]);   ← dependency array
  //
  //   • First render: runs the function, stores the result.
  //   • Later re-renders: checks if [a, b] have changed.
  //     - If NO change → returns the CACHED result. No recalculation.
  //     - If YES change → re-runs the function and caches the new result.
  //
  // WHY WE USE IT HERE:
  //   Finding all crossing pairs requires two nested loops → O(n²).
  //   We don't want to redo this on every render (e.g. when the user
  //   hovers over a row and React re-renders for styling reasons).
  //   As long as displayLEDs and displayN haven't changed, useMemo
  //   returns the same crossingSet without redoing the loops.
  //
  // DEPENDENCY ARRAY [displayLEDs, displayN]:
  //   Tell useMemo: "only recalculate when displayLEDs or displayN change."
  //   They change whenever the user runs a new input. So the first time
  //   after any new input, we do recalculate; subsequent renders reuse cache.
  //
  // RETURN TYPE: new Set<number>()
  //   The angle bracket <number> is TypeScript's "generic" syntax.
  //   It tells TypeScript: "this Set holds numbers, nothing else."
  //   If you tried to .add("hello") it would give a TypeScript error.
  // ----------------------------------------------------------
  const crossingSet = useMemo(() => {

    // A Set to collect the INDICES of all wires involved in at least one crossing.
    const set = new Set<number>();

    // Two wires cross if and only if their LED positions are in the OPPOSITE
    // order to their source positions. Since sources are sorted 1..n,
    // "opposite order" simply means: i < j on L but leds[i] > leds[j].
    //
    // We check every PAIR (i, j) with i < j.
    // When we find a crossing, we add BOTH i and j to the set so they
    // can each be coloured red in the SVG.
    for (let i = 0; i < displayN; i++) {
      for (let j = i + 1; j < displayN; j++) {
        if (displayLEDs[i] > displayLEDs[j]) {
          set.add(i);   // wire i crosses with wire j
          set.add(j);   // wire j crosses with wire i
        }
      }
    }

    return set;

  }, [displayLEDs, displayN]); // recalculate only when the displayed LEDs change

  // ----------------------------------------------------------
  // RETURN THE SVG-BASED VISUAL
  // ----------------------------------------------------------
  return (
    <div className="circuit-board card">
      <h2>Circuit Board Visualisation</h2>

      {/* Column header labels above the SVG */}
      <div
        className="board-headers"
        style={{ width: svgW, display: "flex", justifyContent: "space-between" }}
      >
        {/*
          Inline styles in React use a JavaScript OBJECT, not a CSS string.
          style={{ width: BOARD_W + PAD_SIDE, textAlign: "center" }}
          The outer {{ }} is JSX expression, the inner {} is a JS object.
          CSS property names use camelCase: text-align → textAlign.
        */}
        <span className="board-label" style={{ width: BOARD_W + PAD_SIDE, textAlign: "center" }}>
          Board L (LEDs)
        </span>
        <span className="board-label" style={{ width: BOARD_W, textAlign: "center" }}>
          Board S (Sources)
        </span>
      </div>

      {/*
        THE SVG ELEMENT
        width and height set the coordinate space.
        overflow: "visible" allows nodes at the edges to not get clipped.
        display: "block" + margin: "0 auto" centers it horizontally.
      */}
      <svg
        width={svgW}
        height={svgH}
        style={{ display: "block", margin: "0 auto", overflow: "visible" }}
      >

        {/* ── Board background rectangles ── */}
        {/*
          <rect> is an SVG rectangle.
          x, y → top-left corner coordinates
          width, height → dimensions
          rx → border-radius (rounds the corners)
          fill → background colour (hex string)
          opacity → 0 = invisible, 1 = fully opaque
        */}
        <rect x={PAD_SIDE} y={0} width={BOARD_W} height={svgH}
          rx={8} fill="#1e3a5f" opacity={0.9} />

        <rect x={PAD_SIDE + BOARD_W + WIRE_W} y={0} width={BOARD_W} height={svgH}
          rx={8} fill="#1e3a5f" opacity={0.9} />

        {/* ── WIRES ── */}
        {/*
          We render one wire per LED in displayLEDs.
          .map((val, i) => ...) gives us the LED value and its row index.

          The wire is an SVG <line> element:
            x1, y1 → start point (right edge of board L)
            x2, y2 → end point   (left edge of board S)
          The start Y comes from the LED's row on board L.
          The end   Y comes from the SOURCE's row on board S.
            Source with value "val" lives at row (val - 1)
            because sources are sorted: source 1 is at row 0, source 2 at row 1, etc.

          <g> is an SVG "group" — like a <div>, it just groups elements
          together. Here we use it to group the optional glow line + the
          actual wire line for each LED.
        */}
        {displayLEDs.map((val, i) => {

          const srcRow = val - 1;          // which row on board S this wire ends at
          const y1     = rowY(i);          // Y coordinate on board L side
          const y2     = rowY(srcRow);     // Y coordinate on board S side

          const isChosen   = chosenSet.has(i);
          const isCrossing = crossingSet.has(i);

          // Decide wire appearance based on its category.
          let stroke    = "#555";    // colour of the wire line
          let strokeW   = 1.5;      // thickness in SVG pixels
          let opacity   = 0.35;     // 35% visible (dim)
          let dashArray = "6 4";    // dashed pattern: 6px dash, 4px gap
          let glow      = false;    // whether to draw an outer glow

          if (isChosen) {
            stroke    = "#ffd700";  // gold = lit LED (warm, stands out)
            strokeW   = 3;
            opacity   = 1;          // fully visible
            dashArray = "";         // solid line (no dashes)
            glow      = true;
          } else if (isCrossing) {
            stroke    = "#e05555";  // red = problematic wire
            strokeW   = 1.5;
            opacity   = 0.5;
          }
          // else: grey dashed (default values above)

          return (
            <g key={i}>
              {/*
                CONDITIONAL RENDERING IN JSX:  {glow && (<element />)}
                If glow is false → the expression short-circuits → nothing rendered.
                If glow is true  → renders the outer glow line.

                The glow is just a second, thicker, semi-transparent line
                drawn behind the real wire to create a halo effect.
              */}
              {glow && (
                <line
                  x1={ledWireX} y1={y1}
                  x2={srcWireX} y2={y2}
                  stroke="#ffd700"
                  strokeWidth={8}
                  opacity={0.25}
                />
              )}

              {/* The actual wire line */}
              <line
                x1={ledWireX} y1={y1}
                x2={srcWireX} y2={y2}
                stroke={stroke}
                strokeWidth={strokeW}
                opacity={opacity}
                strokeDasharray={dashArray}
              />
            </g>
          );
        })}

        {/* ── LED NODES (board L) ── */}
        {/*
          For each LED we draw:
            • Optional outer glow ring (if chosen).
            • A main circle (the LED body).
            • A small circle + rectangle (simple bulb icon).
            • A text label showing the LED value to the right.
            • A small position index label to the left.

          transform={`translate(${ledNodeX}, ${rowY(i)})`}
          SVG's translate() shifts the coordinate origin.
          Everything inside the <g> is drawn RELATIVE to that point.
          So cx={0} cy={0} means "center of THIS node", not the SVG origin.
          This makes it easy to position all the sub-elements without
          computing absolute coordinates for each one.

          Template literal syntax:  `translate(${x}, ${y})`
          The ${} parts are replaced with the actual numbers at runtime.
        */}
        {displayLEDs.map((val, i) => {
          const isChosen = chosenSet.has(i);
          return (
            <g key={i} transform={`translate(${ledNodeX}, ${rowY(i)})`}>

              {/* Outer glow ring for chosen (lit) LEDs */}
              {isChosen && (
                <circle r={NODE_R + 5} fill="none"
                  stroke="#ffd700" strokeWidth={2} opacity={0.4} />
              )}

              {/* Main circle — the LED body */}
              <circle
                r={NODE_R}
                fill={isChosen ? "#ffd700" : "#2c5282"}
                stroke={isChosen ? "#fff"    : "#90cdf4"}
                strokeWidth={1.5}
              />

              {/* Simple bulb icon: circle (glass) + rect (stem) */}
              <circle cx={0} cy={-3} r={5}
                fill={isChosen ? "#fffacd" : "#4a90d9"} opacity={0.9} />
              <rect x={-1.5} y={2} width={3} height={4}
                fill={isChosen ? "#fffacd" : "#4a90d9"} />

              {/* LED VALUE label — shown to the right of the circle */}
              <text
                x={NODE_R + 5} y={5}
                fill={isChosen ? "#ffd700" : "#90cdf4"}
                fontSize={11} fontWeight="bold"
                textAnchor="start"  /* text starts at x (left-aligned) */
              >
                {val}
              </text>

              {/* Row INDEX label — shown to the left (small grey) */}
              <text
                x={-(NODE_R + 5)} y={5}
                fill="#718096"
                fontSize={9}
                textAnchor="end"  /* text ends at x (right-aligned) */
              >
                [{i}]
              </text>
            </g>
          );
        })}

        {/* ── SOURCE NODES (board S) ── */}
        {/*
          Array.from({ length: displayN }, (_, i) => ...)
          ────────────────────────────────────────────────
          This creates an array and maps over it in one step.

          Array.from() converts "array-like" things into real arrays.
          { length: displayN } is an object that behaves like an array
          with displayN slots but no actual values.

          The second argument is a mapping function:
            (_, i) => ...
            _  → the element value (we don't need it, "_" by convention means "ignored")
            i  → the index (0, 1, 2, ... displayN-1) — this IS what we use

          So Array.from({ length: 6 }, (_, i) => i)  →  [0, 1, 2, 3, 4, 5]
          It's a shorthand for generating a sequence without a for-loop.

          For each index i:
            Source at row i has VALUE i+1 (sources are 1-indexed: 1, 2, ..., n).
            A source is "lit" if some chosen LED connects to it.
            We check: does any chosen index have leds[idx] === srcVal?

          .some() tests whether AT LEAST ONE element in the array satisfies
          the condition. Returns true/false. Stops as soon as it finds a match.
            [0, 2, 3].some(idx => leds[idx] === 3) → true if LED 3 is chosen
        */}
        {Array.from({ length: displayN }, (_, i) => {
          const srcVal = i + 1;
          const isLit  = chosenIndices.some(
            (idx) => idx < displayN && leds[idx] === srcVal
          );

          return (
            <g key={i} transform={`translate(${srcNodeX}, ${rowY(i)})`}>

              {/* Glow ring for powered (lit) sources */}
              {isLit && (
                <circle r={NODE_R + 5} fill="none"
                  stroke="#ffd700" strokeWidth={2} opacity={0.4} />
              )}

              {/* Main source circle */}
              <circle
                r={NODE_R}
                fill={isLit ? "#276749" : "#2c5282"}
                stroke={isLit ? "#68d391" : "#90cdf4"}
                strokeWidth={1.5}
              />

              {/* Power icon: small rounded rectangle */}
              <rect x={-5} y={-5} width={10} height={10} rx={2}
                fill={isLit ? "#c6f6d5" : "#4a90d9"} opacity={0.8} />

              {/* Source value label inside the circle */}
              <text x={0} y={4}
                fill={isLit ? "#22543d" : "#1a365d"}
                fontSize={9} fontWeight="bold"
                textAnchor="middle"  /* centered at x */
              >
                {srcVal}
              </text>

              {/* "S1", "S2", ... label to the right */}
              <text x={NODE_R + 5} y={5}
                fill={isLit ? "#68d391" : "#90cdf4"}
                fontSize={11} fontWeight="bold"
                textAnchor="start"
              >
                S{srcVal}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Wire colour legend ── */}
      <div className="wire-legend">
        <span className="legend-item">
          <svg width={30} height={10}>
            <line x1={0} y1={5} x2={30} y2={5} stroke="#ffd700" strokeWidth={3} />
          </svg>
          Lit (chosen, non-crossing)
        </span>
        <span className="legend-item">
          <svg width={30} height={10}>
            <line x1={0} y1={5} x2={30} y2={5} stroke="#e05555" strokeWidth={1.5}
              opacity={0.7} strokeDasharray="4 3" />
          </svg>
          Would cause a crossing
        </span>
        <span className="legend-item">
          <svg width={30} height={10}>
            <line x1={0} y1={5} x2={30} y2={5} stroke="#555" strokeWidth={1.5}
              opacity={0.5} strokeDasharray="4 3" />
          </svg>
          Not in optimal set
        </span>
      </div>
    </div>
  );
};

export default CircuitBoard;
