# GitHub Pages URL

## What cannot change from here

- The hostname segment **osobennyj** in `https://osobennyj.github.io/...` is fixed to the GitHub user (or org) that owns the site. Renaming it requires a GitHub account or org literally named `thingsibuilt`, or a **custom domain** you control.
- Cloud agents cannot create new repositories under `osobennyj/` (`createRepository` returns *Resource not accessible by integration*).

## Shorter path without a new account

If **you** create a public repo `osobennyj/thingsibuilt` and enable Pages from `master` (same workflow as this monorepo), the site can be published at:

`https://osobennyj.github.io/thingsibuilt/`

That replaces `warehouse-of-sites` in the path only. You would:

1. Create `osobennyj/thingsibuilt` (empty or mirror this repo).
2. Change `BASE_URL_PATH` in `.github/scripts/assemble-pages.sh` and matching `NEXT_PUBLIC_BASE_PATH` / portfolio home URLs from `/warehouse-of-sites` to `/thingsibuilt`.
3. Deploy; optionally leave a redirect in `warehouse-of-sites` at the old path.

## Current live URL

`https://osobennyj.github.io/warehouse-of-sites/`