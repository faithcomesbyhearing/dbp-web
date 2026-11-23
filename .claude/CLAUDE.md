@../AGENTS.md

<!--
  AGENTS.md is the shared core every agent reads; this file adds only what is specific to Claude Code. Class 2 to
  change. Personal or machine-specific notes go in CLAUDE.local.md, which git ignores.
-->

## Claude Code only

- Run inside WSL2 or Linux with the sandbox on; don't use the permission-skipping mode in this repo.
- One worktree per task, in the layout AGENTS.md gives (`../dbp-web.wt/<branch-with-dashes>`); never two agents in one
  tree.
- Set a model and effort on every subagent; reviews of your own work go to a model from another family.
- nvm's Node is missing from a non-interactive shell: `scripts/gate` and `scripts/check-test-rejects` load it
  themselves; for `npm` and `npx`, run `. ~/.nvm/nvm.sh && nvm use 22` first.
