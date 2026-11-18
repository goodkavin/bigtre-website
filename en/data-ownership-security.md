# Data ownership, security and leaving Big Tre

Canonical: https://bigtre.business/en/data-ownership-security  
Updated: 2026-11-18

The client owns its data and everything built specifically for it: reports, business rules, SOPs and the setup of its own accounts. Big Tre connects with read-only access the client can revoke, keeps each client's data separate, and on termination hands over the client's data, documents and rules in a reusable form within 30 days. These are the terms in Big Tre's current client contracts.

## Who owns what

| Item | Owner |
|---|---|
| The client's data | The client |
| Reports, dashboards, business rules, SOPs and playbooks built for the client | The client |
| Configuration of the client's own systems and accounts | The client |
| Big Tre's own tools, code, methods and infrastructure shared across clients | Big Tre. The client may use them for as long as the agreement runs |

A client's data and business rules are never shared with other clients.

## Access

- Read-only. Big Tre does not change orders, stock, prices or accounts in the client's systems.
- Through API keys or exports the client issues, and can revoke at any time.
- Confidentiality is covered by a non-disclosure agreement signed before any access is granted.

## Where the data is kept

In Google Cloud (BigQuery), Singapore region, in a separate dataset for each client. Each client's AI data analyst runs separately and can read only that client's data.

## The AI data analyst

- It runs on Anthropic's Claude model. A question and the figures needed to answer it are processed by that model.
- Its answers and automated reports are decision aids built on the client's own data. Big Tre checks them with reasonable professional care; they are not guaranteed to be free of error, and business decisions stay with the client.

## Term and leaving

- Current contracts start with a pilot of about three months. Either side can stop by written notice before the next service month starts, with no penalty.
- After the pilot, the parties agree a longer term.
- When the contract ends, Big Tre hands over the client's data, documents and the rules and definitions in a reusable form within 30 days.
- The rulebook is written in plain language, so it remains usable without Big Tre.

## What Big Tre does not have

No third-party security certification such as ISO 27001. Buyers who need one should raise it on the first call.

Questions: [hello@bigtre.business](mailto:hello@bigtre.business), +66 82-925-6365.
