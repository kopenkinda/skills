---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user to resolve decisions that change the outcome or create meaningful risk. Map these as a **design tree**: each decision branches into the decisions that depend on it. Use reasonable defaults for routine details and state assumptions that affect the plan.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask now without guessing at answers you haven't heard yet. Ask a manageable group of related questions per round. Number each question and explain your recommended answer and its tradeoff. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding facts is your job. Inspect the environment and available sources yourself. Use subagents only when the user explicitly asks for them. Investigate independent facts while waiting for decisions; keep dependent work pending until the answer arrives.

Challenge proposals when evidence suggests a concrete problem. Explain the consequence and recommend a simpler approach when it provides the same behavior. Judge the plan by the user's workflow as well as its implementation. Once the user understands a tradeoff and decides, proceed with that decision unless new evidence changes it.

The session is done when decisions that affect the outcome or create meaningful risk are settled. Summarize the agreed plan and relevant assumptions. A request for an interview authorizes the interview; a clear implementation request authorizes implementation. Continue already authorized work without requiring a separate confirmation of shared understanding.
