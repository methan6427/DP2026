## Project: COMP336 Algorithm Course — Survival Study Tool

### Course Info
- Course: COMP336 — Algorithms
- Instructor: Iyad Jaber (very harsh, strict grader, low class averages)
- Student needs to PASS. Formal, complete answers are critical — vague justifications get deducted.

### 4 Chapters (PDFs in /mnt/project/)
1. Comp336_Chapter1_Introduction — Problem solving, complexity, Big-O, algorithm strategies
2. Comp336_chapter2_DynamicProgramming1 — DP, 0/1 Knapsack, LCS, memoization, recurrence relations
3. Comp336_Chapter3_Huffmancoding — Huffman tree construction, code tables, compression cost = Σ(freq × code_length)
4. Comp336_Chapter4_StringMatching — Naive, KMP (failure function), Rabin-Karp, Boyer-Moore

### Past Exam Files (PDFs in /mnt/project/)
- midterm_form_NYxw50b_CslpxBO_UfYRgoe_avbJq1T.pdf
- midterm_form_PZsnyCY_c8rFFnL.pdf
- Different_Forms_mFcRTXO_isj9F8y.pdf
- Different_Forms_2_OSSkmPD_nIXf1i7.pdf
- FormatBank_watermarksafe_removed2.pdf
- Chapter2_question_with_sol_9lJ2jkx.pdf  ← DP questions + solutions
- Chapter3_question_with_sol_1x5qMeL_bgapUjE.pdf  ← Huffman questions + solutions

### What We Know About Iyad Jaber's Exam Style
- Multi-part questions (Q1, Q2, Q3...), each 15–20 marks
- Deducts heavily for: vague justifications, missing steps, informal language
- Expects: formal recurrence notation, full tree drawings, complete tables, arithmetic shown
- Common question types seen in past exams:
  * Huffman: given freq table → build tree → build code table → calculate total bits
  * DP Knapsack: given items with weights/profits → fill DP table → find optimal solution + trace back
  * String Matching: run KMP/Naive on given text+pattern → show all steps
  * Complexity: analyze algorithm → give tight Big-O with justification

### Key Concepts Already Studied
- Huffman cost formula: total bits = Σ(frequency × code_length)
- Uniform distribution → balanced tree → all symbols get log2(n) bits
- Knapsack recurrence: v[i][w] = max(v[i-1][w], v[i-1][w-w[i]] + p[i]) if w[i] <= w
- Common mistake: using v[i] instead of v[i-1] on the right-hand side
- DP "reduce n to 1": dp[n] = 1 + min(dp[n-1], dp[n/2] if div by 2, dp[n/3] if div by 3)

### Goal
Build a study/exam-prep tool that:
1. Reads the chapter PDFs and past exam PDFs
2. Generates practice questions in Iyad Jaber's exact style
3. Accepts student answers and grades them strictly (like the instructor would)
4. Shows full step-by-step model answers
5. Tracks weak areas and focuses practice there