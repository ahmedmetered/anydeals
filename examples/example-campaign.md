# Example campaign (fictional)

Vertical: veterinary clinics. City: Lisbon. Product (fictional): "Mimo", a
booking tool for small clinics.

## Phase 1: List

Scan plan: Lisbon's 24 freguesias, queries like "veterinary clinic <parish>",
plus "animal hospital Lisbon" and "vet open sunday Lisbon". Raw results: 96.
After dedupe by place identifier: 71. After category filter (drop pet shops,
groomers, animal shelters): 44 clinics. After socials enrichment: 31 with a
public Instagram, 19 with a booking flow already on their site (these drop
the ICP - they have a solution).

Output: `prospects.md` - 44 rows, ranked by review volume and whether they
 advertise emergency services (proxy for schedule pressure).

## Phase 2: Persona

ICP: independent clinics, 2-10 staff, no online booking, active Instagram.
Voice: plain, local, zero sales vocabulary. First touch: an observation about
their after-hours handling, never the product name.

## Phase 3: Outbox (batch 1, top 8 rows)

Each draft opens with something specific and public: "Your Sunday emergency
note says call the hotline - does that route to whoever is on shift, or to
you?" Five of eight drafts approved after edits, three rewritten by the
human to sound more local. Nothing sent by the agent; the human sends from
the clinic-facing account over two mornings.

## Phase 4: Tracker

```
| Date       | Clinic          | Status    | Next action          | Due  |
|------------|-----------------|-----------|----------------------|------|
| 2027-03-02 | Clinic Amoreiras| contacted | follow-up            | 03-07|
| 2027-03-02 | VetExpo Lisboa  | replied   | draft reply: demo q. | 03-03|
| 2027-03-03 | Alvalade Vets   | drafted   | human review         |      |
```

After 30 contacted: 9 replies, 4 calls booked, 1 signed. The pattern review
notes that clinics advertising emergency services replied at 3x the rate -
the next scan weights that signal higher.
