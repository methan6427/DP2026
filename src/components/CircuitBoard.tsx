// SVG drawing of both circuit boards (L and S) and the wires between them
// Gold wire = chosen (lit LED), red dashed = crossing, grey dashed = not chosen
import React, { useMemo } from "react";
import type { LISResult } from "../types";

// SVG layout constants — these control the visual sizing of the diagram
const ROW_H   = 28;   // vertical gap between two LED rows (SVG pixels)
const PAD_TOP = 14;   // space above the first row
const PAD_SIDE = 16;  // horizontal padding on each side
const BOARD_W = 80;   // width of each board's background rectangle
const WIRE_W  = 150;  // width of the gap where wires are drawn
const NODE_R  = 10;   // radius of each LED / source circle

interface Props {
  result: LISResult;
}

const CircuitBoard: React.FC<Props> = ({ result }) => {

  const { leds, chosenIndices } = result;
  const n = leds.length;

  // Cap the display at 20 rows — larger inputs are still computed correctly
  const displayN    = Math.min(n, 20);
  const displayLEDs = leds.slice(0, displayN);

  // Use a Set for O(1) membership checks in the render loop
  const chosenSet = new Set(chosenIndices);

  // Total SVG dimensions
  const svgH = PAD_TOP * 2 + displayN * ROW_H;
  const svgW = PAD_SIDE * 2 + BOARD_W + WIRE_W + BOARD_W;

  // Y coordinate of the centre of row i
  const rowY = (i: number) => PAD_TOP + i * ROW_H + ROW_H / 2;

  // Horizontal positions of nodes and wire endpoints
  const ledNodeX = PAD_SIDE + BOARD_W / 2;
  const ledWireX = PAD_SIDE + BOARD_W;
  const srcWireX = PAD_SIDE + BOARD_W + WIRE_W;
  const srcNodeX = PAD_SIDE + BOARD_W + WIRE_W + BOARD_W / 2;

  // Find all wires involved in at least one crossing (O(n²), cached with useMemo)
  // Two wires cross when i < j on board L but leds[i] > leds[j] — values invert
  const crossingSet = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < displayN; i++) {
      for (let j = i + 1; j < displayN; j++) {
        if (displayLEDs[i] > displayLEDs[j]) {
          set.add(i);
          set.add(j);
        }
      }
    }
    return set;
  }, [displayLEDs, displayN]);

  return (
    <div className="circuit-board card">
      <h2>Circuit Board Visualisation</h2>

      {/* Column header labels above the SVG */}
      <div
        className="board-headers"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <span className="board-label" style={{ width: BOARD_W + PAD_SIDE, textAlign: "center" }}>
          Board L (LEDs)
        </span>
        <span className="board-label" style={{ width: BOARD_W, textAlign: "center" }}>
          Board S (Sources)
        </span>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >

        {/* Board background rectangles */}
        <rect x={PAD_SIDE} y={0} width={BOARD_W} height={svgH}
          rx={6} fill="#1e3a5f" opacity={0.9} />
        <rect x={PAD_SIDE + BOARD_W + WIRE_W} y={0} width={BOARD_W} height={svgH}
          rx={6} fill="#1e3a5f" opacity={0.9} />

        {/* Wires — one per LED, coloured by category */}
        {displayLEDs.map((val, i) => {

          // Source with value "val" sits at row val-1 on board S (sources are sorted 1..n)
          const srcRow = val - 1;
          const y1     = rowY(i);
          const y2     = rowY(srcRow);

          const isChosen   = chosenSet.has(i);
          const isCrossing = crossingSet.has(i);

          let stroke    = "#555";
          let strokeW   = 1.5;
          let opacity   = 0.35;
          let dashArray = "5 4";
          let glow      = false;

          if (isChosen) {
            stroke = "#ffd700"; strokeW = 3; opacity = 1; dashArray = ""; glow = true;
          } else if (isCrossing) {
            stroke = "#e05555"; opacity = 0.5;
          }

          return (
            <g key={i}>
              {/* Outer glow for chosen wires */}
              {glow && (
                <line x1={ledWireX} y1={y1} x2={srcWireX} y2={y2}
                  stroke="#ffd700" strokeWidth={7} opacity={0.2} />
              )}
              <line
                x1={ledWireX} y1={y1} x2={srcWireX} y2={y2}
                stroke={stroke} strokeWidth={strokeW}
                opacity={opacity} strokeDasharray={dashArray}
              />
            </g>
          );
        })}

        {/* LED nodes on board L */}
        {displayLEDs.map((val, i) => {
          const isChosen = chosenSet.has(i);
          return (
            <g key={i} transform={`translate(${ledNodeX}, ${rowY(i)})`}>
              {/* Glow ring for chosen LEDs */}
              {isChosen && (
                <circle r={NODE_R + 4} fill="none"
                  stroke="#ffd700" strokeWidth={1.5} opacity={0.4} />
              )}
              <circle r={NODE_R}
                fill={isChosen ? "#ffd700" : "#2c5282"}
                stroke={isChosen ? "#fff" : "#90cdf4"}
                strokeWidth={1.5}
              />
              {/* Simple bulb icon inside the circle */}
              <circle cx={0} cy={-2} r={4}
                fill={isChosen ? "#fffacd" : "#4a90d9"} opacity={0.9} />
              <rect x={-1.5} y={2} width={3} height={3}
                fill={isChosen ? "#fffacd" : "#4a90d9"} />
              {/* LED value label to the right */}
              <text x={NODE_R + 4} y={4}
                fill={isChosen ? "#ffd700" : "#90cdf4"}
                fontSize={10} fontWeight="bold" textAnchor="start">
                {val}
              </text>
              {/* Row index label to the left */}
              <text x={-(NODE_R + 4)} y={4}
                fill="#718096" fontSize={8} textAnchor="end">
                [{i}]
              </text>
            </g>
          );
        })}

        {/* Source nodes on board S — sorted 1..n top to bottom */}
        {Array.from({ length: displayN }, (_, i) => {
          const srcVal = i + 1;
          // A source is lit if a chosen LED connects to it
          const isLit = chosenIndices.some(
            (idx) => idx < displayN && leds[idx] === srcVal
          );
          return (
            <g key={i} transform={`translate(${srcNodeX}, ${rowY(i)})`}>
              {isLit && (
                <circle r={NODE_R + 4} fill="none"
                  stroke="#ffd700" strokeWidth={1.5} opacity={0.4} />
              )}
              <circle r={NODE_R}
                fill={isLit ? "#276749" : "#2c5282"}
                stroke={isLit ? "#68d391" : "#90cdf4"}
                strokeWidth={1.5}
              />
              <rect x={-4} y={-4} width={8} height={8} rx={1}
                fill={isLit ? "#c6f6d5" : "#4a90d9"} opacity={0.8} />
              <text x={0} y={3}
                fill={isLit ? "#22543d" : "#1a365d"}
                fontSize={8} fontWeight="bold" textAnchor="middle">
                {srcVal}
              </text>
              <text x={NODE_R + 4} y={4}
                fill={isLit ? "#68d391" : "#90cdf4"}
                fontSize={10} fontWeight="bold" textAnchor="start">
                S{srcVal}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Wire colour legend */}
      <div className="wire-legend">
        <span className="legend-item">
          <svg width={24} height={8}><line x1={0} y1={4} x2={24} y2={4} stroke="#ffd700" strokeWidth={2.5} /></svg>
          Lit
        </span>
        <span className="legend-item">
          <svg width={24} height={8}><line x1={0} y1={4} x2={24} y2={4} stroke="#e05555" strokeWidth={1.5} opacity={0.7} strokeDasharray="4 3" /></svg>
          Crossing
        </span>
        <span className="legend-item">
          <svg width={24} height={8}><line x1={0} y1={4} x2={24} y2={4} stroke="#555" strokeWidth={1.5} opacity={0.5} strokeDasharray="4 3" /></svg>
          Not chosen
        </span>
      </div>
    </div>
  );
};

export default CircuitBoard;
