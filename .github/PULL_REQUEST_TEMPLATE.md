## What and why
Work item: <id or link> · Change class: 0 / 1 / 2 / 3 · Review route: <what this class needs, from AGENTS.md>
Target branch: develop (master only for a release or an agreed hotfix)

In my own words: <the author explains the change and why it is right, without pasting the agent's summary>

Before / after: <what a reader of the site saw or could do before, and what they see or can do now; "no change" for
docs, tests and tooling>

Door: one-way / two-way · What breaks if it is wrong: <...> · Who notices first: <readers, a partner, the team, nobody
until ...>

## AI involvement
None / assisted / agent-authored
Tools and models: <for example Claude Code (model, effort) and Codex (model, effort)>
Driven by: <the person accountable for this change>
Agent trail: built by <session or run ids> · reviewed by <session or run ids, one per review lane>
What the person checked: <what was run, read or tested by hand>

## Evidence
Tests added or changed: <...>; wrong-fix check: <`scripts/check-test-rejects` result, or why none>
Gates: `scripts/gate fast` <pass/fail, seconds> · `scripts/gate full` <pass/fail, seconds> · the PR's gate check
Reviews: <for each review the class needs: the model families that ran, each finding confirmed or not and how it was
  handled; the person who reviewed>
Screens (UI work): <browsers and widths checked, against which API; screenshots attached>

## Release
Release-notes line: <one line>
Rollback: <what is undone and how; time to roll back>
Docs updated: AGENTS.md / README / none
