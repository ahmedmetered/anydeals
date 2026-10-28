# anydeals

Lead generation and cold outreach as one pipeline, running on the AI agent
you already have.

Scan any vertical in any city into a ranked, deduplicated prospect list, then
work that list through personalized, approval-first outreach - drafts,
cadence, replies, and a pipeline tracker. Two skills, one workflow:

- **prospecting** - locality-sweep lead generation. Plans per-municipality
  search grids, dedupes by place identifier, filters categories before
  ranking (so big-box stores stop polluting the list), and enriches each
  prospect with social links from their own website.
- **outreach** - an agent-native cold-outreach pack. Turns the list into
  personalized first-touch drafts in an approval-first outbox: it drafts, you
  approve, nothing sends without you. Plain-text state, no API keys.

## Why a bundle

The two skills compose: the ranked list Phase 1 produces is exactly the
input queue Phase 3 drafts from, and the persona's ideal-customer profile is
what decides which rows get drafted first. Individually they are tools;
together they are an outbound system - "from empty map to approved first
touches" in one workflow.

This repository is a convenience bundle. The canonical, standalone skills
live in their own repos and remain the place to file issues:

- [anyoutreach](https://github.com/ahmedmetered/anyoutreach)
- [prospect-sweep](https://github.com/ahmedmetered/prospect-sweep)

## Install

Copy the `skills/` subfolders into your agent's skills directory, or clone
this repository into it - the root `SKILL.md` registers the full pipeline and
the two sub-skills register individually as well.

| Agent | Folder |
|---|---|
| ZCode | `~/.agents/skills/anydeals` or `~/.zcode/skills/anydeals` |
| Claude Code | `~/.claude/skills/anydeals` |
| Codex CLI / Cursor / others | your skills discovery path |

Then: "Build me a prospect list for <vertical> in <city>" followed by "draft
first touches for the top of the list." See
[examples/example-campaign.md](examples/example-campaign.md) for a full
fictional run.

## The tracker

The bundle ships a zero-setup pipeline tracker: `node tracker/server.mjs`,
then open http://localhost:8789. Prospects live in a JSON file on your disk,
the campaign agent can add them straight into the pipeline, and you edit
statuses (Found, Drafted, Approved, Contacted, Follow-up sent, Replied,
Meeting, Won, Lost) on the page. One-click JSON export for backups. See
[tracker/README.md](tracker/README.md).

## Ethics, briefly

Approval-first by design: the agent never sends anything - you do, from your
own accounts, within each platform's terms and volume norms. Prospect only
from what businesses publish publicly about themselves. Lists built with this
pack are for your own campaigns, not for resale.

## Credits and license

MIT. The prospecting skill builds on
[gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper)
(MIT). The outreach method is adapted from
[Harvey](https://github.com/ethanplusai/harvey) by Ethan Rogers, as packaged
in anyoutreach. Independent project; not affiliated with or endorsed by
Google, LinkedIn, or any platform.
