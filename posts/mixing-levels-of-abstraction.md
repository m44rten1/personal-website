---
title: What Your Code and Kids’ Drawings Have in Common
date: 2026-02-02
description: A short essay on how mixing levels of abstraction makes code hard to read.
---

Most unreadable code isn’t broken.
It works — but it’s tiring to understand.

You start reading a function to learn _what it does_.
Halfway through, you’re reasoning about _how it does it_.
Your brain keeps switching gears.

Kids make the same mistake when they draw people.

![Kids drawing a person](kids-drawing-person.webp)

A child draws a person with an enormous head and carefully counted fingers… but the body is vague or missing.

It’s one picture built from mismatched layers:

- the idea (_a person_)
- what feels important (_face, hands_)
- execution detail (_individual fingers_)

Some parts get intense detail. Other parts are barely sketched. The drawing represents one thing, but it’s assembled from incompatible zoom levels.

Code does this constantly.

# BAD: mixed abstractions

```ts
function processOrder(order) {
  if (!order) throw new Error("Missing order");

  // business rule
  const total = order.items.reduce((sum, i) => sum + i.price, 0);

  // formatting detail
  const formattedDate = new Date().toISOString();

  // infrastructure concern
  try {
    http.post("/orders", { ...order, total, formattedDate });
  } catch {
    retryWithBackoff();
  }
}
```

This function is _about_ processing an order — but it also worries about validation, formatting, networking, and retries. Each line makes sense; together they force the reader to constantly change mental mode.

# GOOD: consistent abstraction

```ts
function processOrder(order) {
  const payload = prepareOrder(order);
  sendOrder(payload);
}

function prepareOrder(order) {
  // validation, totals, domain rules
}

function sendOrder(payload) {
  // HTTP, retries, timeouts
}
```

Now each function mostly speaks one “dialect.” You can understand the intent without being forced into the machinery.

# How to spot mixed abstraction (fast)

You’re probably mixing layers when you see any of these:

## 1) “And then suddenly…” lines

While reading, you feel a gear shift: _“Ok we’re processing an order… and then suddenly we’re constructing headers.”_
That “suddenly” is the smell.

## 2) Domain words and plumbing words in the same breath

Names from different worlds colliding:

- `order`, `invoice`, `policy`, `eligibility`
  next to
- `http`, `sql`, `json`, `headers`, `uuid`, `retry`, `timeout`

When they’re interleaved, you’re doing two jobs at once.

## 3) Uneven detail

One part is very high-level (“process”, “sync”, “handle”), but another part is meticulous (“format ISO string”, “map status codes”, “loop indices”).
That mismatch is exactly the kids-drawing problem: giant head, missing torso.

# How to avoid it without ceremony

## A) Do a “story pass” and a “mechanics pass”

Write (or refactor) in two passes:

- First pass: make the function read like a story of intent.
- Second pass: move the gritty details into helpers that have boring, specific names.

You’re not adding abstraction — you’re _relocating detail_.

## B) Create explicit boundaries

A simple, durable boundary is:

- **Orchestrator** (high-level): “what happens next”
- **Workers** (low-level): “how this specific thing is done”

No architecture astronaut badge required.

## C) Name functions by what they promise at their level

Good names act like a zoom lock:

- `prepareOrderPayload`
- `sendOrderRequest`
- `calculateTotal`

Names that mix levels (`processAndSendOrderWithRetries`) are often confessions.

Good code improves the same way kids’ drawings do —
not by adding detail, but by putting the right detail in the right place.
