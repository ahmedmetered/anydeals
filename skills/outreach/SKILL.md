---
name: cold-outreach
description: >
  Run an approval-first cold-email outreach pipeline for any product: profile prospects,
  write personalized first emails following the Harvey method (one observation, one
  question, under 75 words, no AI tells), queue them in a project-local OUTBOX for
  human approval, and draft replies when responses arrive. Use for requests like
  "write cold emails for this list", "run outreach", "draft our email campaign",
  or "handle these prospect replies". Nothing sends without explicit human approval.
license: MIT
compatibility: Works in any project. Sending requires an SMTP mailbox configured by the user; the skill itself only writes drafts.
metadata:
  author: user
  origin: Adapted from ethanplusai/harvey (MIT) — method and rules; implementation is agent-native.
---

# Cold outreach, approval-first

Turn a prospect list into personalized cold emails a human approves before anything
sends, then handle the replies. Built for B2B, small lists, high relevance.

## What lives where

Everything project-specific stays in the project, under `outreach/` (create it if missing):

- `outreach/persona.md` — sender identity, product facts (the ONLY claims allowed), ICP,
  pricing, objection answers, mailbox status. Use `references/persona-template.md` to
  create it. If it exists, read it first; never invent product claims.
- `outreach/OUTBOX.md` — the approval queue. Drafts carry `stato:`/`status:` fields the
  human flips from `draft` to `approved`. Append new batches, never overwrite history.
- prospect list — any CSV/MD in the repo with company, category/site, city; ask the user
  which list to use if not obvious.

## Workflow

1. **Load persona.** Read `outreach/persona.md`. Missing? Create it from the template by
   interviewing the user or from their marketing site. No claims outside it, ever.
2. **Segment.** Split prospects by channel fit: email works for B2B-style targets with
   info@/contact forms; relationship/DM businesses (salons, restaurants, local consumer)
   usually belong on WhatsApp/IG and should be excluded unless the user says otherwise.
3. **Profile each prospect** (3 HTTP requests max): their site + one listing. Extract ONE
   verifiable detail worth citing (a claim on their site, review count, what they sell,
   how their process works). No detail found? Use their category/city honestly or skip.
   NEVER fabricate: no invented funding, no fake mutual contacts, no made-up numbers.
4. **Write email 1** per `references/method.md` — in the prospect's language. One idea,
   one question, under 75 words, no product name in the body.
5. **Queue.** Append to `outreach/OUTBOX.md` with status `draft`, one entry per prospect,
   each with a distinct angle (see campaign-variety rule). Announce the batch size.
6. **Wait for approval.** The user edits statuses or replies with changes. Do not send,
   do not "simulate" sending, do not prepare send scripts unless the user asks.
7. **Sequence.** For non-responders draft email 2 (new angle, new subject) at day 4-6 and
   email 3 (short bump) at day 9-11, breakup at ~day 14. Queue each the same way.
8. **Replies.** When the user forwards/pastes replies, classify per
   `references/replies.md`, draft the answer, queue for approval. Opt-outs and angry
   replies: never draft a response; mark the prospect closed and say so.

## Hard gates (never cross)

- Nothing is sent, scheduled, or scripted toward sending without an explicit approved
  status from the user AND a configured mailbox in persona.md.
- Every draft must pass the self-check in `references/method.md` before queueing
  (word count, one question, subject rules, banned-pattern scan, claims traceability).
- One follow-up maximum after any "no". Opt-out is permanent, mid-conversation too.
