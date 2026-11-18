# AI data analyst for e-commerce brands

Canonical: https://bigtre.business/en/ai-data-analyst  
Updated: 2026-11-18

Big Tre's AI data analyst is a chat assistant that sits in the team's work chat and answers questions about the business in Thai or English, from the brand's own sales, stock and profit data. It reads the [data foundation](https://bigtre.business/en/data-foundation) Big Tre builds and the written rules behind it, so its answers match the dashboards and reports. It runs on Anthropic's Claude model and has read-only access to that one client's data.

## What the team asks it

| Question | What it does |
|---|---|
| "ยอดขายเมื่อวานแต่ละช่องทางเท่าไหร่" (yesterday's sales by channel) | Reads the day's figures under the agreed definition of a sale |
| "SKU ไหนขาดทุนเดือนที่แล้วหลังหักโวเชอร์" (which SKUs lost money last month after vouchers) | Computes margin per SKU after fees and seller-paid vouchers |
| "Why did the Shopee payout drop this week?" | Breaks the payout into orders, fees and returns and names the change |
| "How did the 11.11 campaign do on margin, not just sales?" | Compares the campaign window with the weeks around it, after discounts |
| "Which items run out of stock in the next two weeks?" | Divides stock on hand by recent daily sales per SKU |

Each answer states the period, the definition used and where the number came from. When a figure cannot be computed, for example profit after ad spend before the ad account is connected, it says so instead of estimating.

## What it sends without being asked

- A morning summary of the previous day.
- A weekly summary.
- Alerts when something moves outside its normal range, such as a sudden drop in a channel's sales or stock about to run out.

## What it needs first

A data foundation with written rules. An AI assistant on top of unreconciled exports gives answers that sound sure and are wrong. That is why Big Tre builds the foundation first and the analyst second.

## Where it runs

In the team's work chat. Today it runs in Telegram, as it does for both current clients. It does not run in LINE yet; a team that works mainly in LINE should raise it on the first call. Each client's analyst runs separately and can read only that client's data.

## Limits

- It answers from the data it is connected to. It does not see systems that are not connected.
- It does not change orders, stock or accounts.
- It does not replace an accountant or a decision. It gives the number and how it was made.

## Price

Set up as part of the setup fee, then included in the monthly fee once the data foundation is live. See [pricing](https://bigtre.business/en/pricing).

Contact: [hello@bigtre.business](mailto:hello@bigtre.business), +66 82-925-6365.
