# Uniblock Query Testing

Scipts for generating address reports using uniblock unified queries.

## Usage

Install dependencies (requires node.js)

`yarn` OR `npm i`

Set environment variables

```bash
cp .env.sample .env
```

Replace the sample API key in `.env` with a valid key

### Generate Report for Single Address

This will generate a report `single.json` for a single address

```bash
npm run single
```

Each report  will contain the user's address, date the report was generated, and several chain reports.
Each chain report contains the following fields.

```ts
export type ChainReport = {
    chain: string;
    tokenBalances: TokenBalanceWithMetadata[];
    tokenAllowances: TokenAllowance[];
    nftBalances: NftBalance[];
    nftTransfers: NftTransfer[];
    transactions: Transaction[];
}
```

See `src/uniblockResponseTypes.ts` for more information on these fields.

## Querying Data from Uniblock

All queries are located in `src/uniblockQueries.ts`

Each query is a GET request to a uniblock endpoint (e.g. `https://api.uniblock.dev/uni/v1/token/balance`).

Most endpoints require at least two params, `chainId` and `walletAddress`.

Requests must be authenticated by an API key in the `X-API-KEY` header.

A full list of available endpoints is available at <https://docs.uniblock.dev/reference>
