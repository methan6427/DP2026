// ============================================================
// App.tsx  —  The ROOT component of the entire application.
//
// WHAT IS A "COMPONENT" IN REACT?
//   React builds UIs out of small, reusable pieces called components.
//   Each component is just a TypeScript function that returns HTML-like
//   markup (called JSX). React calls these functions and uses the returned
//   markup to build what you see in the browser.
//
// THIS FILE is the top-level component — it owns the shared data
// (the algorithm result) and renders all other components inside it.
//
// PAGE STRUCTURE:
//   <header>      – project title and course info
//   <InputPanel>  – user enters n and the LED permutation
//   <ResultPanel> – shows max LEDs, chosen set, step-by-step trace
//   <DPTable>     – the required DP table with per-cell explanations
//   <CircuitBoard>– SVG drawing of both boards with wires
// ============================================================

// ------------------------------------------------------------
// IMPORTS — bringing in tools we need from other files/libraries.
//
// "react"          → The React library itself. It gives us the ability
//                    to write components, manage data, and respond to events.
//
// { useState }     → A React "hook" (explained below where it is used).
// { useEffect }    → Another React hook (explained below where it is used).
//
// The rest are our own components and utilities from the project files.
// "import type"    → Imports only the TypeScript type definition, not any
//                    runtime code. This is a TypeScript-only feature; it
//                    helps the TypeScript compiler check our code but
//                    produces zero extra JavaScript in the final bundle.
// ------------------------------------------------------------
import React, { useState, useEffect } from "react";
import InputPanel   from "./components/InputPanel";
import DPTable      from "./components/DPTable";
import ResultPanel  from "./components/ResultPanel";
import CircuitBoard from "./components/CircuitBoard";
import { computeLIS } from "./utils/lis";
import type { LISResult } from "./types";
import "./App.css";   // The CSS file that styles the whole app.

// ------------------------------------------------------------
// WHAT IS "React.FC"?
//
//   FC stands for "Function Component". It is a TypeScript type
//   provided by React that tells both React and TypeScript:
//   "This variable is a React component — a function that takes
//    props (optional inputs) and returns JSX (the rendered UI)."
//
//   Writing  const App: React.FC = () => { ... }
//   is the same as writing a regular arrow function, but TypeScript
//   now KNOWS it is a component and will warn you if you accidentally
//   return something that is not valid JSX.
//
//   The angle-bracket syntax <Props> after FC would be used to
//   specify which props the component accepts. Here App has no
//   props (it is the root, nothing passes data INTO it), so we
//   write React.FC with no angle brackets.
// ------------------------------------------------------------
const App: React.FC = () => {

  // ----------------------------------------------------------
  // useState  —  HOW REACT REMEMBERS DATA BETWEEN RE-RENDERS
  //
  //   Every time the user clicks a button or types something,
  //   the component re-runs (React "re-renders" it). Normal
  //   JavaScript variables would reset to their initial values
  //   on every re-render. useState solves this by storing the
  //   value OUTSIDE the component function so it survives.
  //
  //   Syntax:
  //     const [value, setValue] = useState<Type>(initialValue);
  //
  //   • "value"    – the current data (read this to display things).
  //   • "setValue" – a function to CHANGE the data.
  //                  When you call setValue(newData), React:
  //                  1. Saves newData.
  //                  2. Re-renders the component so the UI reflects it.
  //
  //   The <Type> in angle brackets is TypeScript: we declare that
  //   "result" holds either a LISResult object or null (no result yet).
  //   The | symbol in TypeScript means "or", so LISResult | null means
  //   "either a LISResult or null".
  //
  //   WHY null as the initial value?
  //   When the page first loads the user hasn't run anything yet,
  //   so there is no result. null is the standard JavaScript way
  //   to say "no value". We check for null before showing the output
  //   panels (see the JSX below).
  // ----------------------------------------------------------
  const [result, setResult] = useState<LISResult | null>(null);

  // ----------------------------------------------------------
  // handleRun  —  called by InputPanel when the user clicks "Run".
  //
  //   InputPanel will call this function and pass in the parsed
  //   LED array. We run the DP algorithm on it and save the result
  //   into state so React re-renders and the output panels appear.
  //
  //   "leds: number[]" is TypeScript annotation saying this function
  //   expects an argument called "leds" that is an array of numbers.
  // ----------------------------------------------------------
  const handleRun = (leds: number[]) => {
    // computeLIS runs the full Longest Increasing Subsequence DP.
    // It returns a LISResult object with dp[], parent[], chosenLEDs, etc.
    // See utils/lis.ts for the detailed algorithm explanation.
    setResult(computeLIS(leds));
  };

  // ----------------------------------------------------------
  // useEffect  —  RUN CODE AFTER THE COMPONENT APPEARS ON SCREEN
  //
  //   Sometimes you need to do something AFTER React has drawn the
  //   component to the screen — this is called a "side effect".
  //   Examples: fetching data, starting a timer, reading the DOM.
  //
  //   Syntax:
  //     useEffect(() => {
  //       // code to run after render
  //     }, [dependency1, dependency2]);
  //
  //   The SECOND argument is the "dependency array":
  //   • []  (empty array) → run ONLY once, right after the first render.
  //                         Perfect for "run on page load" tasks.
  //   • [a, b] → re-run whenever variable a or b changes.
  //   • (omitted) → re-run after EVERY render (rarely what you want).
  //
  //   HERE: We pass [] so this runs exactly once when the app first
  //   loads. It pre-fills the result with the project's example input
  //   [2, 6, 3, 5, 4, 1] so the page is not blank on arrival.
  // ----------------------------------------------------------
  useEffect(() => {
    setResult(computeLIS([2, 6, 3, 5, 4, 1]));
  }, []); // <-- empty array = "run once on mount"

  // ----------------------------------------------------------
  // THE RETURN VALUE — JSX (looks like HTML, but it's JavaScript)
  //
  //   JSX lets us write HTML-like markup directly inside TypeScript.
  //   Under the hood, React converts it to regular JavaScript calls.
  //
  //   Rules to remember:
  //   • class → className  (because "class" is a reserved JS keyword)
  //   • Single-tag elements must self-close: <br /> not <br>
  //   • JavaScript expressions go inside curly braces: {someVariable}
  //   • {result && <Component />}  means: "only render <Component />
  //     if result is not null/undefined/false". This is called
  //     "short-circuit rendering" — && stops evaluating if the left
  //     side is falsy, so nothing gets rendered.
  //   • <>...</>  is a "fragment" — a wrapper that produces no real
  //     HTML element. Useful when you need to return multiple elements.
  // ----------------------------------------------------------
  return (
    <div className="app-container">

      {/* ---- Page header ---- */}
      <header className="app-header">
        <h1>Max LED Lighting</h1>
        <p className="subtitle">
          Design and Analysis of Algorithms — COM336 &nbsp;|&nbsp;
          Dynamic Programming · Longest Increasing Subsequence (LIS)
        </p>
        <p className="subtitle small">
          Sources S: sorted ‹1, 2, …, n›. &nbsp; LEDs L: arbitrary permutation.
          &nbsp; Maximum non-crossing connections = LIS(L). &nbsp;
          Time: O(n²) · Space: O(n).
        </p>
      </header>

      {/* ---- Two-column layout ---- */}
      <main className="main-grid">

        {/* Left column: input form + result summary */}
        <section className="left-col">
          {/*
            We pass "handleRun" as a prop to InputPanel.
            A prop is how a parent component gives data or functions
            to a child component — like passing arguments to a function.
            InputPanel will call onRun(ledsArray) when the user clicks Run.
          */}
          <InputPanel onRun={handleRun} />

          {/*
            {result && <ResultPanel result={result} />}
            Short-circuit: if result is null this whole expression
            evaluates to null and React renders nothing.
            Once result is set (after running the algorithm), React
            renders ResultPanel and passes the result object as a prop.
          */}
          {result && <ResultPanel result={result} />}
        </section>

        {/* Right column: DP table + circuit board drawing */}
        <section className="right-col">
          {result && (
            // The fragment <> lets us return two sibling elements
            // without adding an extra <div> to the HTML.
            <>
              <DPTable      result={result} />
              <CircuitBoard result={result} />
            </>
          )}
        </section>

      </main>

      <footer className="app-footer">
        COM336 — Project #1 — Second Semester 2025/2026 — Birzeit University
      </footer>

    </div>
  );
};

// ------------------------------------------------------------
// export default  — makes App available for import in other files.
// main.tsx imports App and mounts it into the HTML page.
// "default" means other files can import it with any name they like:
//   import App from "./App"       ← standard
//   import MyApp from "./App"     ← also valid with default export
// ------------------------------------------------------------
export default App;
