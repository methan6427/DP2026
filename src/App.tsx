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
//   [LCS badge]   – verifies LCS length == LIS maxLEDs
//   <LCSTable>    – full LCS(L, sorted(L)) table (lecture approach)
//   [Divider]     – separates LCS formulation from direct LIS
//   <DPTable>     – direct LIS DP table with per-cell explanations
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
import LCSTable     from "./components/LCSTable";
import { computeLIS, computeLCS } from "./utils/lis";
import type { LISResult, LCSResult } from "./types";
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
  const [result,    setResult]    = useState<LISResult | null>(null);

  // ----------------------------------------------------------
  // lcsResult — stores LCS(L, sorted(L)) computed alongside LIS.
  //
  // Per COM336 Chapter 2: LIS(L) = LCS(L, sorted(L)).
  // We compute both to show the instructor both formulations
  // and visually prove they give the same answer.
  //
  // lcsResult is always set together with result — they are
  // always both null or both non-null at the same time.
  // ----------------------------------------------------------
  const [lcsResult, setLcsResult] = useState<LCSResult | null>(null);

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
    // ----------------------------------------------------------
    // Run the direct LIS DP (O(n²) time, O(n) space).
    // See utils/lis.ts — computeLIS() for the full explanation.
    // ----------------------------------------------------------
    setResult(computeLIS(leds));

    // ----------------------------------------------------------
    // LIS = LCS(L, sorted(L)) — see COM336 Chapter 2, Dynamic Programming.
    // We run LCS explicitly to show the instructor both formulations.
    // The LCS length must equal the LIS maxLEDs value. If they differ,
    // something is wrong with the algorithm.
    //
    // sorted = [...leds].sort((a, b) => a - b)
    //   [...leds]  → spread into a new array (do NOT mutate the original)
    //   .sort((a,b) => a-b) → numeric ascending sort
    //   Default JS .sort() is lexicographic (would sort [10,2] as [10,2])
    //   so we must pass the comparator (a,b) => a-b for correct numeric order.
    // ----------------------------------------------------------
    const sorted = [...leds].sort((a, b) => a - b);
    setLcsResult(computeLCS(leds, sorted));
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
    // Pre-load the project example so the page is not blank on arrival.
    // We compute both LIS and LCS together — same as handleRun does.
    const defaultLeds = [2, 6, 3, 5, 4, 1];
    setResult(computeLIS(defaultLeds));
    setLcsResult(computeLCS(defaultLeds, [...defaultLeds].sort((a, b) => a - b)));
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

      {/*
        ---- Two-column layout ----
        Left col  : InputPanel (stays fixed as the user scrolls results)
        Right col : All output in the order the instructor expects:
                    1. ResultPanel  (answer + LCS match badge)
                    2. LCSTable     (lecture LCS formulation — shown FIRST)
                    3. Section divider
                    4. DPTable      (direct LIS formulation)
                    5. CircuitBoard (SVG visualisation)
      */}
      <main className="main-grid">

        {/* Left column: input form only */}
        <section className="left-col">
          <InputPanel onRun={handleRun} />
        </section>

        {/* Right column: all output panels in lecture order */}
        <section className="right-col">
          {result && lcsResult && (
            <>
              {/* 1 — ResultPanel: answer + chosen LEDs */}
              <ResultPanel result={result} />

              {/*
                LCS match badge — visual proof that both formulations
                agree on the answer. The instructor can see immediately
                that LCS(L, sorted(L)) == LIS(L) for this input.

                Per COM336 Chapter 2: LIS(L) = LCS(L, sorted(L)).
                If these two numbers ever differ, there is a bug.
              */}
              <div className="lcs-match-badge">
                LCS(L,&nbsp;sorted(L))&nbsp;=&nbsp;
                <strong>{lcsResult.length}</strong>
                &nbsp;✓&nbsp;matches&nbsp;LIS&nbsp;=&nbsp;
                <strong>{result.maxLEDs}</strong>
                &nbsp;— both formulations give the same answer
              </div>

              {/* 2 — LCSTable: the lecture LCS approach (shown before direct LIS) */}
              <LCSTable result={lcsResult} />

              {/*
                Section divider — clearly separates the two DP formulations
                so the instructor can see both independently.
              */}
              <div className="section-divider">
                Both formulations above and below produce the same answer:&nbsp;
                <strong>{lcsResult.length}</strong> LEDs
              </div>

              {/* 3 — DPTable: the direct LIS DP (O(n²), O(n) space) */}
              <DPTable result={result} />

              {/* 4 — CircuitBoard: SVG drawing of boards and wires */}
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
