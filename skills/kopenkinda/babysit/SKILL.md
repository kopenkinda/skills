---
name: babysit
description: Watch something until the requested finish condition holds.
argument-hint: "What should I watch, and what counts as done?"
disable-model-invocation: true
---

# Babysit

Own the item named by the user until the requested result is observably complete. `$babysit` is an explicit request for persistent monitoring. When the host has a durable goal or monitoring facility, use it for this objective. Set a token budget only when the user gives one.

## Set the contract

Identify the target, the finish condition, the health checks that must stay green, and the actions the user has authorized. Inspect the source of truth before acting. Turn words such as "done", "healthy", or "ready" into checks you can observe from the available context. Ask a question only when the missing answer would materially change the work.

Babysitting grants persistence, not extra authority. Keep all actions inside the user's request and the host's safety rules.

## Run the watch loop

Repeat this loop until the completion gate passes:

1. Read the latest state from the source of truth.
2. Compare it with every finish condition and health check.
3. If something is pending, wait with the host's monitoring or polling mechanism, then read it again.
4. If something fails, diagnose it and take the safest authorized action that moves it toward green. Handle the failure when it is in scope instead of stopping at a status report.
5. Verify the action against the latest state. Any new revision, deployment, run, or commit starts a fresh pass through the loop.

Retry transient failures with sensible spacing. Keep monitoring when progress depends on an external person or service and there is still a useful state to watch. A timeout, failed check, token limit, or ordinary turn boundary does not make the babysitting complete.

If progress requires credentials, a user decision, new authority, or an action outside the stated scope, ask for that exact item. Preserve the target, last observed state, and remaining completion checks so monitoring can resume without guesswork.

## Keep it healthy

Treat the initial state and existing required checks as the baseline. After each intervention, run or inspect the relevant checks again. Do not hide failures, cancel required checks, weaken protections, or narrow the requested finish condition to manufacture success.

For a pull request, watch the current head commit, required checks, mergeability, approvals, requested changes, and unresolved review threads. After a new commit appears, reassess all of them against the new head. "Ready" means the pull request is mergeable and every required check and review condition passes. "Merged" means the forge reports the pull request merged. Merge it yourself only when the user authorized that action.

## Completion gate

Finish only when all of these are true:

- The requested result is visible in the source of truth.
- Every required check and dependent operation has reached a successful terminal state.
- A fresh read after the last change confirms that the watched scope has no known regression.

Report the observed result and the evidence that closed the watch. A blocker is not a successful completion.
