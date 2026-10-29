# DESIGN.md — anydeals outbound tracker

The committed visual world of `tracker/index.html`. This tracker is a
sibling tool to the anyjobsearch tracker and **inherits its world** — full
token system, type scale, spacing, and component conventions are documented
in [anyjobsearch/tracker/DESIGN.md](../../../../../../projects/anyjobsearch/tracker/DESIGN.md)
(repo: ahmedmetered/anyjobsearch). This file records the adaptations.

## Appearance (amended 2026-10-30)
Light default + designed dark, user-toggleable — identical tokens and
toggle mechanics as the anyjobsearch tracker (see its DESIGN.md).

## What carries over unchanged
Apple light appearance, `#F5F5F7` ground + white surfaces separated by
contrast alone (no card borders/shadows), ink `#1D1D1F`/`#6E6E73`, single
accent `#0071E3`, system type stack, pill controls + 8px fields, tabular
numerals, one declared elevation (the add sheet), themed browser surfaces
(selection, focus rings, scrollbar, caret), the staggered-rise motion with
`prefers-reduced-motion` off-switch, and minimum 11px functional text.

## Signature (adapted)
**The pipeline bar is the status filter** over the outbound stages:
All · Found · Drafted · Approved · Contacted · Follow-up sent · Replied ·
Meeting · Won · Lost — same pill grammar (bold tabular counts, active
filled ink, zero-count stages dashed).

## Truth chips (adapted)
The headline separates the outbound truth: **Contacted** (Contacted → Won +
Lost, inverted chip) · **Awaiting contact** (Found/Drafted/Approved) · All.
"Total" alone was a lie by aggregation — the operator reads campaign
progress, not just volume.

## Adaptation: the draft block
Drafts are the operable deliverable (agent writes, human approves). On
Drafted cards the draft textarea sits in a soft accent-tinted panel
(`.draft`, `rgba(0,113,227,.09)`, 10px radius) with an accent label
"DRAFT — EDIT FREELY, THEN APPROVE", followed by the filled blue
**Approve — ready to send** action. The tint marks the deliverable; no
colored borders.

## Field set (outbound, not job-search)
Status · Channel · Handle/address · Contacted date per card; channel also
filters in the toolbar. Channel selects carry an empty option — an unset
channel renders as unset, never fabricated. Notes and next-action remain
free text; next-action surfaces as a tag in the card meta line.
