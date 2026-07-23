# Take-Home: Conversation Inbox

A small exercise — about **1–2 hours**. Please don't spend more. If you run out of time, stop and note what you'd do next in the README. A small, finished result is better than a large, unfinished one.

## The task

Support agents handle customer messages in a shared inbox. Build a small version of it.

Messages arrive at a webhook (the included simulator plays the sender). You store them, group them into conversations per customer, sometimes reply automatically, and let an agent reply by hand.

This starter includes the project setup, sample data, and the simulator. You write the feature.

### Stubs to fill in

- `POST /api/webhook` (`server/src/index.ts`) — receives messages. Returns 501 until you implement it.
- `assistantReply()` (`server/src/assistant.ts`) — decides whether to auto-reply and what to say. Returns `null` until you implement it.
- `server/src/store.ts` — where you keep data (your choice, see below).
- `client/` — a React app; replace the placeholder page.

### Required

1. Implement `POST /api/webhook`: accept a message and store it in the right conversation (one per customer).
2. Add the API endpoints your UI needs (list conversations, get a thread, post a reply).
3. Show the conversation list (newest first, with a preview); open a thread to read it.
4. Let an agent send a reply; persist it and show it in the thread.
5. Implement `assistantReply()` so some messages get an automatic reply — e.g. a greeting, an order question, or a product question answered from the catalog. Two or three rules is enough; don't over-invest here.
6. Search conversations by customer name or message text.
7. Update this README (see "What to submit").

### One decision we leave to you

Messaging providers deliver the same message more than once (retries). The simulator can too — resend a message with the same `id`. Decide what should happen, implement it, and explain your choice in a sentence or two.

### Data store

Keep data wherever fits: an in-memory variable, a JSON file, or SQLite. No database server needed. Say what you chose and why.

## Optional (only if you have time)

None of these are required.

- Unread counts
- Optimistic UI when sending a reply
- Tests for the assistant
- Product recommendations from the catalog
- Loading / error / empty states

## Running it

Node 20+.

```bash
npm install
npm run dev     # API on :4000, app on http://localhost:5173
npm run seed    # load sample messages (run after dev is up)
```

Open http://localhost:5173. Calls to `/api/*` are proxied to the server.

Send a message:

```bash
npm run simulate -- --name "Emma Clark" --from "+15550001001" --text "do you have a desk lamp?"
```

Test a duplicate (same id twice):

```bash
npm run simulate -- --id dup-1 --text "hello"
npm run simulate -- --id dup-1 --text "hello"
```

Until you implement the webhook it returns 501 — that's expected.

## What to submit

1. A GitHub repo (fork/clone this one). Public, or private with an invite to GitHub user **@soroushahrari** (or email **soroush.ahrari@arcuscorp.it**).
2. This README, updated with:
   - How to run it, if different from above.
   - **Decisions & trade-offs** — include your duplicate-message decision, your data-store choice, and anything you left out.
   - **AI usage** — using AI tools is fine and encouraged. Briefly note what you used them for and where you changed their output.
   - **What's next** — what you'd add or improve with more time.

## What we look at

We care about how you work, not a perfect result.

- Whether it works.
- Backend: a clean, sensible data model and API.
- Frontend: a functional, easy-to-use UI.
- Readable, maintainable code.
- Clear explanations of your choices.

## Notes

- Aim for 1–2 hours.
- AI tools are allowed; just note how you used them.
- Questions are welcome — email **soroush.ahrari@arcuscorp.it**.