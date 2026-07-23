# Conversation Inbox

A small support-inbox app. Messages come in through a webhook, get grouped into conversations per customer, sometimes get an automatic reply, and an agent can reply by hand from a React UI.

## Running it

```bash
npm install
npm run dev     # API on :4000, app on http://localhost:5173
npm run seed    # load sample messages (run after dev is up)
```

Open http://localhost:5173.

## Decisions & trade-offs

**Duplicates:** deduped by `id` using a `Set`. A repeat id still gets a 200 back, but doesn't add a second message or trigger the assistant twice.

**Storage:** in-memory `Map`, keyed by customer phone number. Simple, fits the scope — trade-off is data doesn't survive a restart.

**Assistant rules, checked in order:** product mentioned → catalog answer; sounds like an order → honest hand-off to a human (can't actually look up orders); plain greeting → friendly ack. Order matters, or a message like "hi, do you have the water bottle?" would just get a "hi there!" and never get answered.

Skipped unread counts, optimistic UI, tests, and product recommendations — all optional, left out to keep the required parts solid.

Add unread message counts per conversation, with live polling and instant clear on open

Fix duplicate message ids creating phantom empty conversations for unrelated customers and also implemented permanent persistence using Sql Lite 

## AI usage

Used Claude as a coding companion — still learning React, and this was my first real Express + TypeScript backend.

- **Backend:** wrote it myself, had Claude review and catch bugs (a nested route, a missing bracket, a type/field mismatch, an auto-reply that overpromised).
- **Frontend:** leaned on Claude more here given time constraints — it helped build the components while making sure I understood the concepts
- **Testing:** did myself — seeded data, ran searches, sent messages, checked duplicates don't double-fire the assistant.

## What's next

optimistic UI, tests for the assistant rules, and a real error state in the UI instead of just console logs.
