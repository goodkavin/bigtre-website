# Real profit per SKU and per channel

Canonical: https://bigtre.business/en/profit-per-sku  
Updated: 2026-11-18

Real profit per SKU is the price the customer paid, minus the platform's fees, the seller-paid share of vouchers, free gifts, returns, shipping the seller covered and the product's cost. Most Thai online brands see sales per SKU but not this figure, because the fees sit in settlement reports, the cost sits in a spreadsheet or ERP, and the product codes differ between them. Big Tre builds this view as part of its [data foundation](https://bigtre.business/en/data-foundation).

## What goes into it

| Item | Where it comes from |
|---|---|
| Price paid | Order lines from the OMS or marketplace |
| Commission, service, transaction and payment fees | Each platform's settlement report, per order |
| Seller-funded vouchers and discounts | Order and settlement data, split from platform-funded vouchers |
| Free gifts | Order lines at zero price, valued at cost |
| Returns and failed deliveries | Order status and return reports |
| Shipping paid by the seller | Settlement report or carrier invoice |
| Product cost | The brand's cost sheet, purchase orders or ERP |
| Ad spend (for profit after ads) | Ad accounts, when connected |

## A worked example

Illustrative figures for one unit of one SKU sold on one marketplace, not any platform's actual rates.

| Line | Baht |
|---|---|
| Price after the seller voucher | 450 |
| Commission, service, transaction and payment fees | -60 |
| Seller-paid shipping subsidy | -15 |
| Free gift, at cost | -20 |
| Product cost | -180 |
| Share of returns (5 percent of units returned, cost not recovered) | -9 |
| Profit before ads | 166 |
| Margin before ads | 37 percent of 450 |

The same SKU on another channel with higher fees and a bigger seller voucher can land at half that margin. The table makes that visible per SKU and per channel.

## Where it goes wrong

- **Fees as a flat percentage.** Fees vary by platform, category and campaign, and platforms change them. A flat rate hides which products lose money.
- **Platform vouchers counted as discounts.** Platform-funded vouchers come back in the payout. Counting them as a cost understates margin.
- **Sets counted as one product.** A set must be split into its items, both for cost and for stock.
- **Different product codes.** Without one mapping, the same product's sales on Shopee and TikTok cannot be added up.
- **Cost of goods from last year.** Margin is only as good as the cost behind it.

## What the result looks like

A table of every SKU by channel with units, sales, fees, discounts, cost and margin, refreshed daily. The same product's margin on Shopee, Lazada, TikTok Shop and the web store side by side shows where to spend and where to raise prices. Profit after ad spend is shown only once ad accounts are connected, and shown as blocked until then.

## Questions the team can then ask

Through the [AI data analyst](https://bigtre.business/en/ai-data-analyst): "which SKUs lost money last month after vouchers", "what did the 11.11 campaign earn after discounts", "if the seller voucher drops from 10 to 5 percent, where is break-even".

Start with the free [Health Check](https://bigtre.business/en/ai-readiness-health-check) or write to [hello@bigtre.business](mailto:hello@bigtre.business).
