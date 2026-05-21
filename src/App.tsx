// Root component — owns all shared state and renders the full page layout
import React, { useState, useEffect } from "react";
import InputPanel   from "./components/InputPanel";
import ResultPanel  from "./components/ResultPanel";
import CircuitBoard from "./components/CircuitBoard";
import LISTable     from "./components/LISTable";
import { computeLIS } from "./utils/lis";
import type { LISResult } from "./types";
import "./App.css";

const App: React.FC = () => {

  const [lisResult, setLisResult] = useState<LISResult | null>(null);

  // Switch to stacked layout when n > 10 (table becomes too wide for 3 columns)
  const isLarge = lisResult !== null && lisResult.leds.length > 10;

  // Add/remove body class so CSS can unlock vertical scroll in large mode
  useEffect(() => {
    if (isLarge) {
      document.body.classList.add("large-mode");
    } else {
      document.body.classList.remove("large-mode");
    }
    return () => document.body.classList.remove("large-mode");
  }, [isLarge]);

  // Run the LIS algorithm when the user submits a valid LED array
  const handleRun = (leds: number[]) => {
    setLisResult(computeLIS(leds));
  };

  // Pre-load the project example so the page is not blank on arrival
  useEffect(() => {
    const defaultLeds = [2, 6, 3, 5, 4, 1];
    setLisResult(computeLIS(defaultLeds));
  }, []);

  return (
    <div className="app-container">

      <header className="page-header">
        <span className="page-title">Max LED Lighting</span>
        <span className="page-subtitle">
          Dynamic Programming — LIS | O(n²) time · O(n) space
        </span>
      </header>

      {/* Three-column grid (small) or stacked (large) */}
      <div className={`main-layout${isLarge ? " large" : ""}`}>

        {/* Left column: input form + result summary */}
        <div className="left-col">
          <InputPanel onRun={handleRun} />
          {lisResult && <ResultPanel result={lisResult} />}
        </div>

        {/* Centre column: LIS DP table */}
        <div className="lis-table-section">
          {lisResult && <LISTable result={lisResult} />}
        </div>

        {/* Right column: circuit board */}
        <div className="circuit-wrapper">
          {lisResult && <CircuitBoard result={lisResult} />}
        </div>

      </div>
    </div>
  );
};

export default App;
