---
name: anydeals
description: >-
  Run outbound sales as one workflow from any AI agent CLI: build a ranked,
  deduplicated lead list for any vertical in any city (locality-sweep
  prospecting), then work it through approval-first outreach with
  personalized first-touch drafts, cadence, reply handling, and a pipeline
  tracker. Use when the user asks to generate leads or prospect lists, run a
  cold outreach campaign, draft cold emails or DMs, or manage an outbound
  pipeline.
---

# anydeals

Outbound as one pipeline: build the list, then work the list. This pack
composes two skills into a single workflow. Each also works standalone in its
own repository.

- **Prospecting** ([skills/prospecting/SKILL.md](skills/prospecting/SKILL.md)):
  plan per-municipality search grids for a vertical in a metro area, dedupe
  results by place identifier, filter categories before ranking, enrich each
  prospect with social links from their own website, and emit a ranked
  markdown + CSV list.
- **Outreach** ([skills/outreach/SKILL.md](skills/outreach/SKILL.md)):
  turn the ranked list into personalized first-touch drafts written in the
  candidate product's voice, held in an approval-first outbox where nothing
  sends without explicit human confirmation, plus cadence and reply handling.

## Rules that always apply

1. **Approval-first, always.** No email, DM, or connection request is ever
   sent automatically. The agent drafts; the human reviews and sends.
2. **Respect platform terms and volume norms.** A few personalized messages
   per day beat a hundred copied ones - and on most platforms, automated
   sending violates the terms of service besides being worse at converting.
3. **Public business data only.** Prospect from what businesses publish about
   themselves. Never resell scraped lists; never touch personal data that is
   not the public business contact.
4. **Candidate data stays in the campaign folder.** Personas, outboxes, and
   trackers live in the campaign's own directory, never inside the skill.

## Workflow

### Phase 1: List (read `skills/prospecting/SKILL.md`)

Input: a vertical, a metro area, and the profile's ICP notes. Output: a
ranked prospect list (`prospects.md` + `prospects.csv`) with websites and
social profiles per prospect.

### Phase 2: Persona (read `skills/outreach/references/persona-template.md`)

Write the campaign persona: product facts, ideal customer profile, voice.
The persona's ICP determines which rows from Phase 1 get drafted and in what
order.

### Phase 3: Outbox (read `skills/outreach/SKILL.md` and its references)

Draft first-touch messages for the top rows: observation openers grounded in
something specific to each prospect, no product name in the first touch, one
goal per message. Batch 5-10 drafts per session into `OUTBOX.md`. The human
approves or edits each one; only approved drafts are sendable, and sending
happens manually through the candidate's own accounts.

### Phase 4: Follow-up and replies

Cadence per the outreach references (typically a day 4-6 follow-up, then a
breakup note). Classify replies, draft responses for human approval, and move
prospects through the pipeline tracker: contacted, replied, meeting, closed.
The bundle ships a zero-setup tracker page (`node tracker/server.mjs`, then
http://localhost:8789) - offer it when the candidate starts contacting
prospects.

## Install

Copy the `skills/` subfolders into your agent's skills directory (or clone
this repository into it - the root `SKILL.md` makes the whole pack
discoverable, and the two sub-skills register individually too).
