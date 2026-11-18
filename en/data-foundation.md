# Data foundation for multi-channel e-commerce brands

Canonical: https://bigtre.business/en/data-foundation  
Updated: 2026-11-18

A data foundation is one database that holds every order, settlement and stock movement from every sales channel, under rules the business has agreed, so that every report gives the same number. Big Tre builds it for Thai e-commerce brands that sell on Shopee, Lazada, TikTok Shop, Shopify, LINE and in stores. It connects read-only to the systems the brand already uses and refreshes every day.

## What it includes

| Part | What the brand gets |
|---|---|
| Written rules | A rulebook of how the business counts: which order statuses are sales, how cancelled and returned orders are treated, how sets and bundles split into items, which discounts the seller pays and which the platform pays. Each rule is confirmed with the team on real orders |
| Sales | Orders from every channel, de-duplicated, one row per item, daily |
| Settlements and fees | What each platform paid out, with commission, service, transaction and payment fees itemised, matched to the bank |
| Stock | One stock figure per SKU across channels, with returns, transfers, free gifts and set deductions handled the same way every time |
| Profit | Margin per SKU and per channel after fees, vouchers and returns. Cost of goods comes from the brand's own cost sheet or ERP |
| Dashboards | Sales, margin, stock cover and campaign results by channel |
| Reports | The weekly and monthly reports the team builds by hand, produced in the Google Sheets layout the team already uses |
| Alerts | Low stock before an oversell, counts that drift between channels, platform fee changes |

## Why the rules come first

Most reporting projects fail on definitions, not software. When one report counts paid orders and another counts placed orders, both are correct and neither agrees. Big Tre writes each definition down once and applies it to every channel. A number that looks wrong can be traced to the rule that produced it.

## How long it takes

| Phase | What is done | Typical timing |
|---|---|---|
| Rules and foundation | Systems connected, rules written and confirmed, first month reconciled | Weeks 1 to 6 |
| Dashboards and reports | Dashboards and the team's recurring reports, first produced by Big Tre | Weeks 1 to 6 |
| Automation | Alerts, reports sent on a schedule, every new payout matched automatically | Months 2 to 4 |

Each phase ends with something the team uses. The [AI data analyst](https://bigtre.business/en/ai-data-analyst) reads from the same foundation.

## What it connects to

Order management systems (Zort and Shipnity today, BigSeller on request), marketplace settlement reports, Shopify, Google Sheets and Drive, and store POS. ERPs (Odoo, ERPNext, SAP Business One), accounting software (Express, PEAK, FlowAccount), ad accounts and carriers are connected when needed. Status of each is on [integrations](https://bigtre.business/en/integrations).

## Where the data is kept

In Google Cloud (BigQuery) in the Singapore region, in a separate dataset per client. Big Tre reads from the client's systems and never writes to them.

## Price

Setup from about 60,000 baht, then from about 14,000 baht a month to run it. See [pricing](https://bigtre.business/en/pricing).

Start with the free [AI Readiness Health Check](https://bigtre.business/en/ai-readiness-health-check) or write to [hello@bigtre.business](mailto:hello@bigtre.business).
