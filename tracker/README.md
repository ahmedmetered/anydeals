# anydeals tracker

The outbound pipeline tracker that runs on your machine: one small Node
server (no npm install - built-in modules only), one JSON file as the
database, one page served on localhost. The agent that runs your campaign can
add prospects straight into the pipeline; you edit outcomes on the page.

## Run

```
node tracker/server.mjs
```

Open http://localhost:8789. Options: `--port 8789` and `--data
prospects-data.json` (the JSON database; defaults to your current folder).

## Pipeline

Found → Drafted → Approved → Contacted → Follow-up sent → Replied → Meeting →
Won / Lost

## Feeding it from the campaign

The agent that runs prospecting and outreach can push prospects straight in:

```
curl -X POST http://localhost:8789/api/prospects/bulk -H "content-type: application/json" -d "{\"prospects\":[{\"name\":\"ClinicExample\",\"channel\":\"Instagram\",\"handle\":\"@clinic.example\",\"status\":\"Found\"}]}"
```

Bulk imports dedupe on name + handle. Or use "Add prospect" on the page.

## Data

Everything lives in `prospects-data.json` - human-readable, easy to back up,
never sent anywhere. The page also has a one-click JSON export.
