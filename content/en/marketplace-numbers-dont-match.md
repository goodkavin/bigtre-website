---
title: Shopee, Lazada and TikTok Shop payouts don't match sales or the bank, how to reconcile them
description: Why marketplace sales reports, payouts and bank deposits never agree for Thai online sellers, the usual causes (dates, statuses, returns, vouchers, fees, sets, SKU codes), a fix in five steps and who can help.
schema: article
updated: 2026-11-18
order: 7
nav: Numbers don't match
---

# Shopee, Lazada and TikTok Shop payouts don't match sales or the bank

Sales on Shopee, Lazada, TikTok Shop, Shopify and the order management system rarely match each other, the payouts or the bank, because each counts a sale differently: on a different date, at a different order status, before or after vouchers, returns and fees. The gap closes when every channel's orders and settlements go into one database and one written definition is applied to all of them. Big Tre, a company in {{city_en}}, does this for Thai e-commerce brands.

## Three numbers that are never equal

| Number | Where it comes from | Why it differs |
|---|---|---|
| Sales | Seller Center reports, the OMS | Counts orders placed or paid, at list price or after discount |
| Payout | The platform's settlement report | Sales minus commission, service, transaction and payment fees, minus returns, on the payout date |
| Bank deposit | The bank statement | Payouts grouped by transfer date, sometimes several periods in one transfer |

Matching sales to the bank means walking through all three, not comparing the first and last.

## The usual causes

- **Date.** Order date, payment date, shipped date or completed date. An order on the last night of the month lands in either month.
- **Order status.** Placed, paid, shipped, completed, cancelled, failed delivery. Reports include different sets.
- **Returns and refunds.** Deducted in the month of sale, the month of return, or not at all.
- **Vouchers.** Platform-funded vouchers are paid back to the seller; seller-funded ones are a cost. Reports show price before or after either.
- **Free gifts.** A gift with purchase looks like a sale at zero, or vanishes, depending on the report.
- **Sets and bundles.** A set counts as one item in one place and as its parts in another, which also breaks stock.
- **Product codes.** The same product has a different SKU on each marketplace and in the OMS, so totals per product cannot be added up.
- **Fees.** Commission, service, transaction and payment fees differ per platform and per category, and change during the year.
- **Duplicates.** The same order arrives from the OMS and from a manual upload.

## How to fix it

1. **Write one definition** of a sale, a return and a cost, agreed by sales and accounting.
2. **Map product codes** from every channel to one product list.
3. **Load every order and settlement** into one database every day.
4. **Reconcile one closed month** against each platform's report and the bank until every gap has a reason.
5. **Point every report at that database**, so the dashboard, the weekly report and the [AI data analyst](/en/ai-data-analyst) read the same figure.

## A worked example

Illustrative figures for one order, not any platform's actual rates.

| Line | Baht |
|---|---|
| Product price | 500 |
| Seller voucher (the shop pays) | -50 |
| Platform voucher of 30 (the platform pays it back to the shop) | 0 to the shop |
| Customer pays | 420 (500, minus 50 seller voucher, minus 30 platform voucher) |
| Sales in the OMS report | 450 or 420, depending on whether it shows price after the seller voucher only, or after both |
| Commission, service, transaction and payment fees | -60 |
| Payout for this order | 390 (450 minus 60) |
| Bank deposit | 390, grouped with every other order paid out the same day |

The same order shows 500, 450, 420 and 390 in four places. All four are correct. Reconciling means knowing which one each report shows.

## What a brand can do on its own first

Take one closed month. Export each platform's sales report and settlement report. For each, write down which date and which statuses it uses and whether vouchers and returns are deducted. Most of the gap is explained by date, status and returns.

## Who can help

| Option | What it does | What it leaves open |
|---|---|---|
| Order management system (Zort, Shipnity, BigSeller) | Collects orders and syncs stock across channels | Reports follow the tool's rules; fees, bank and cost of goods stay outside |
| Accountant | Reconciles payouts to the books each month | After the fact and monthly, no daily view per SKU |
| Data partner such as Big Tre | One database, written rules, daily refresh, reconciled to platforms and bank, profit per SKU and channel | A setup project of a few weeks |

See [the data foundation](/en/data-foundation) and [pricing](/en/pricing), or start with the free [Health Check](/en/ai-readiness-health-check).
