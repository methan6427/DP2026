# Max LED Lighting — COM336 Dynamic Programming Visualizer

## Project Overview

A React + Vite + TypeScript web app that visualizes the **LIS (Longest Increasing Subsequence)** dynamic programming algorithm applied to the LED lighting problem from COM336 (Design and Analysis of Algorithms), Birzeit University.

---

## The Problem

- **Board S (right):** n power sources sorted as 1, 2, 3, …, n (top → bottom).
- **Board L (left):** n LEDs in an arbitrary permutation L[0..n-1] (top → bottom).
- LED with value k **must** connect to Source k (label matching).
- **No two wires may cross.**
- **Goal:** light the maximum number of LEDs.

### Why Is This LIS?

Wire for LED k: starts at position `pos_L(k)` on board L, ends at position `k` on board S.

Two wires (for LED a and LED b, where a appears above b on L, so `pos_L(a) < pos_L(b)`) cross **if and only if** `a > b` (the values invert relative to their positions).

So a set of wires is crossing-free ⟺ the corresponding LED values form an **increasing subsequence** of L.

∴ max non-crossing connections = LIS(L).

---

## Algorithm — `src/utils/lis.ts`

**DP Approach** (following Chapter 2, Iyad Jaber – Algorithm Analysis):

| Step | Description |
|------|-------------|
| 1 | Characterize optimal substructure: an optimal set ending at LED L[i] is built from an optimal set ending at some L[j] (j < i, L[j] < L[i]) plus L[i]. |
| 2 | Define recurrence: `dp[i] = 1 + max{ dp[j] | j < i, L[j] < L[i] }`, base case `dp[i] = 1` |
| 3 | Compute bottom-up (fill dp[] left to right, i = 0..n-1). |
| 4 | Reconstruct solution by backtracking through `parent[]`. |

**Time:** O(n²) — two nested loops  
**Space:** O(n) — two auxiliary arrays `dp[]` and `parent[]`

### Example: L = [2, 6, 3, 5, 4, 1]

| Index i | 0 | 1 | 2 | 3 | 4 | 5 |
|---------|---|---|---|---|---|---|
| L[i]    | 2 | 6 | 3 | 5 | 4 | 1 |
| dp[i]   | 1 | 2 | 2 | 3 | 3 | 1 |
| parent[i] | -1 | 0 | 0 | 2 | 2 | -1 |

**Backtrack from maxIndex=3:** 3 → 2 → 0 → stop  
**Chosen LEDs:** L[0]=2, L[2]=3, L[3]=5 → **[2, 3, 5]** ✓  
**Max LEDs lit:** 3

### Key Arrays

- **`dp[i]`** — length of the longest non-crossing chain whose last wire connects LED L[i]. Pre-filled with 1 (every LED can form a chain of length 1 by itself).
- **`parent[i]`** — index j that gave `dp[i]` its value. `-1` means L[i] starts a new chain. Used to reconstruct which LEDs were chosen.

### Recurrence (inline)

```
if L[j] < L[i]  AND  dp[j] + 1 > dp[i]:
    dp[i]     = dp[j] + 1   // extend j's chain by one more wire
    parent[i] = j            // remember predecessor
```

If `L[j] >= L[i]`, the wire for j would cross the wire for i — skip it.

---

## Types — `src/types/index.ts`

### `LISResult`

Holds the complete output of the DP algorithm:

| Field | Type | Meaning |
|-------|------|---------|
| `leds` | `number[]` | The LED permutation array entered by the user (1-indexed values) |
| `dp` | `number[]` | `dp[i]` = LIS length ending at index i |
| `parent` | `number[]` | `parent[i]` = predecessor index for backtracking; -1 if none |
| `maxLEDs` | `number` | The answer: max LEDs that can be lit |
| `chosenIndices` | `number[]` | 0-based indices in L of the chosen optimal LEDs |
| `chosenLEDs` | `number[]` | LED labels in the chosen solution (forward order on board L) |

### `TestCase`

Stores a preset test case: `{ label: string, n: number, leds: number[] }`.

---

## Component Architecture — `src/App.tsx`

App is the root component. It owns the shared state and renders all children.

```
App
├── <header>          — project title and course info
├── <main className="main-grid">
│   ├── <section className="left-col">
│   │   ├── <InputPanel onRun={handleRun} />   — user enters n and the permutation
│   │   └── <ResultPanel result={result} />    — max LEDs, chosen set, step-by-step trace
│   └── <section className="right-col">
│       ├── <DPTable result={result} />         — the DP table with per-cell explanations
│       └── <CircuitBoard result={result} />    — SVG drawing of both boards with wires
└── <footer>
```

### State

```ts
const [result, setResult] = useState<LISResult | null>(null);
```

`null` on initial load. Set to the algorithm output when the user clicks **Run** (or on mount via `useEffect` with the example input `[2, 6, 3, 5, 4, 1]`).

### Data Flow

1. `InputPanel` parses user input and calls `onRun(ledsArray)`.
2. `App.handleRun` calls `computeLIS(leds)` and saves result to state.
3. React re-renders; `ResultPanel`, `DPTable`, and `CircuitBoard` all receive the result as a prop.

### React Concepts Used

| Concept | Usage |
|---------|-------|
| `useState` | Stores the algorithm result between re-renders |
| `useEffect(fn, [])` | Pre-fills the example input once on page load |
| Short-circuit rendering `{result && <Component />}` | Hides output panels until a result exists |
| Props | Parent passes data/callbacks down to child components |
| JSX fragments `<>...</>` | Return two siblings without an extra DOM element |

---

## Running the App

```bash
npm install
npm run dev
```

Scripts defined in `package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start the dev server |
| `build` | `tsc -b && vite build` | Type-check then bundle for production |
| `preview` | `vite preview` | Preview the production build locally |
| `lint` | `eslint .` | Run ESLint |

**Stack:** React 19, TypeScript 6, Vite 8, ESLint 10.

---

## Q&A — Exam Prep (Iyad Jaber Style)

---

### Q1 — What exactly is the project about?

You have two boards:
- **Board S (right):** power sources sorted 1, 2, 3, …, n (top → bottom)
- **Board L (left):** n LEDs in an arbitrary permutation

LED k **must** connect to Source k. Two wires that cross cannot both be lit. **Goal:** light the maximum number of LEDs = find the **Longest Increasing Subsequence (LIS)** of L. The project visualizes this DP algorithm as a React web app.

---

### Q2 — What is the dynamic relation (recurrence)?

```
dp[i] = 1 + max{ dp[j] | 0 <= j < i  AND  L[j] < L[i] }
dp[i] = 1     if no such j exists  (base case)
```

`dp[i]` = length of the longest non-crossing chain of wires whose **last** wire connects LED L[i].

---

### Q3 — What is the dynamic function in code?

`computeLIS(leds: number[])` in `src/utils/lis.ts`.

It takes the LED array L, fills `dp[]` and `parent[]` bottom-up, finds the max, then backtracks through `parent[]` to reconstruct the chosen LEDs. Returns a `LISResult` object consumed by all components.

---

### Q4 — Time complexity, space complexity, and how to check

**Time: O(n²)**
- Outer loop: `i` from 1 to n−1 → runs n−1 times
- Inner loop: `j` from 0 to i−1 → runs i times
- Total iterations: 1 + 2 + … + (n−1) = n(n−1)/2 = **O(n²)**

**Space: O(n)**
- `dp[]` — size n
- `parent[]` — size n
- No 2D table. Everything else is constant.
- Total: **O(n)**

**How to verify:** Count how many times the innermost comparison `L[j] < L[i]` executes for input size n — it is always exactly n(n−1)/2 regardless of input values.

---

### Q6 — Best time and space complexity taught in the course

From Iyad Jaber's Chapter 2 PDF:

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| **LIS (this project)** | **O(n²)** | **O(n)** | Only DP approach taught. |
| LCS | O(m × n) | O(m × n) | 2D table |
| Knapsack 2D | O(n × m) | O(n × m) | Standard |
| Knapsack 1D (p.22) | O(n × m) | **O(m)** | Space-optimized version shown in notes |
| Matrix Chain | O(n³) | O(n²) | |

**For this project specifically:** O(n²) time and O(n) space **is** the best DP approach taught in the course. The O(n log n) LIS using binary search is **not in Jaber's notes** — do not claim the DP achieves it. See Q — Binary Search below.

---

### Q7 — Why is the code over-commented?

Iyad Jaber deducts heavily for:
- Missing recurrence definition
- Incomplete table fills
- Informal justifications
- Skipping backtracking explanation

The heavy comments exist so every part of the algorithm is understood at the level of detail the instructor expects in exam answers.

---

### Q8 — DP function in Iyad Jaber's pseudocode style

```
LIS (L, n)
    // Input:  L[1..n] → LED permutation array
    //         n       → number of LEDs
    // Output: dp[1..n], parent[1..n], maxLEDs

    for ( i = 1; i <= n; i++ )
        dp[ i ]     = 1;
        parent[ i ] = -1;
    end for

    for ( i = 2; i <= n; i++ )
        for ( j = 1; j <= i-1; j++ )
            if ( L[ j ] < L[ i ] )
                if ( dp[ j ] + 1 > dp[ i ] )
                    dp[ i ]     = dp[ j ] + 1;
                    parent[ i ] = j;
                end if
            end if
        end for
    end for

    maxLEDs  = dp[ 1 ];
    maxIndex = 1;
    for ( i = 2; i <= n; i++ )
        if ( dp[ i ] > maxLEDs )
            maxLEDs  = dp[ i ];
            maxIndex = i;
        end if
    end for

end.
```

---

### Q9 — Table fill step by step using the DP formula

**Input:** L = [2, 6, 3, 5, 4, 1] (1-indexed: L[1]=2, L[2]=6, L[3]=3, L[4]=5, L[5]=4, L[6]=1)

**Initialize:** dp = [1, 1, 1, 1, 1, 1], parent = [−1, −1, −1, −1, −1, −1]

**i = 2, L[2] = 6:**
- j=1: L[1]=2 < 6 → dp[1]+1=2 > dp[2]=1 → **dp[2]=2**, parent[2]=1

**i = 3, L[3] = 3:**
- j=1: L[1]=2 < 3 → dp[1]+1=2 > dp[3]=1 → **dp[3]=2**, parent[3]=1
- j=2: L[2]=6 ≥ 3 → skip (wire would cross)

**i = 4, L[4] = 5:**
- j=1: L[1]=2 < 5 → dp[1]+1=2 > dp[4]=1 → dp[4]=2, parent[4]=1
- j=2: L[2]=6 ≥ 5 → skip
- j=3: L[3]=3 < 5 → dp[3]+1=3 > dp[4]=2 → **dp[4]=3**, parent[4]=3

**i = 5, L[5] = 4:**
- j=1: L[1]=2 < 4 → dp[1]+1=2 > dp[5]=1 → dp[5]=2, parent[5]=1
- j=2: L[2]=6 ≥ 4 → skip
- j=3: L[3]=3 < 4 → dp[3]+1=3 > dp[5]=2 → **dp[5]=3**, parent[5]=3
- j=4: L[4]=5 ≥ 4 → skip

**i = 6, L[6] = 1:**
- j=1..5: all L[j] ≥ 1 → all skip. dp[6] stays 1.

**Final DP Table:**

| i | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| L[i] | 2 | 6 | 3 | 5 | 4 | 1 |
| dp[i] | 1 | 2 | 2 | 3 | 3 | 1 |
| parent[i] | −1 | 1 | 1 | 3 | 3 | −1 |

**maxLEDs = 3** (found at index 4)

**Backtrack:** index 4 → parent[4]=3 → parent[3]=1 → parent[1]=−1 → stop
**Chosen LED values:** L[1]=2, L[3]=3, L[4]=5 → **{2, 3, 5}** ✓

---

### Q — Why can we use binary search to improve LIS? (Bonus knowledge from DS)

Binary search is already known from Data Structures, which is a prerequisite to this course. This is why O(n log n) LIS is **achievable with known tools** — but it is a completely **different algorithm**, not the DP recurrence.

**The O(n log n) approach (Patience Sorting):**

Maintain a `tails[]` array where `tails[k]` = the smallest tail element of all increasing subsequences of length k+1 seen so far.

For each element L[i]:
- Use **binary search** to find the leftmost position in `tails[]` where `tails[pos] >= L[i]`
- Replace `tails[pos]` with `L[i]` (or append if L[i] is larger than all)

The length of `tails[]` at the end = LIS length.

**Why it is O(n log n):**
- Outer loop: n iterations
- Each iteration: binary search on `tails[]` → O(log n)
- Total: **O(n log n)**

**Critical distinction for the exam:**

| | DP approach (course) | Binary Search approach |
|---|---|---|
| Method | Recurrence + 2D comparison | Greedy + binary search on tails |
| Time | O(n²) | O(n log n) |
| Space | O(n) | O(n) |
| Taught by Jaber | **Yes** | No |
| Correct answer for "complexity of your solution" | **O(n²)** | — |

**Rule:** If Jaber asks *"what is the complexity of the DP solution?"* → answer **O(n²)**.  
You may mention O(n log n) only if he asks *"can LIS be solved faster?"* — and you must clarify it requires abandoning the DP recurrence entirely in favour of a greedy + binary search strategy.
