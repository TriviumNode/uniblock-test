export type TokenBalance = {
    contractAddress: string;
    balance: string;
}

export type TokenBalanceWithMetadata = TokenBalance & {
    name: string;
    symbol: string;
    logo: string;
    decimals: number;
}

export type TokenAllowance = {
    contractAddress: string;
    name: string;
    symbol: string;
    decimals: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
}

export type BalanceResponse<T> = {
    balances: T[];
    uniblockWarning?: string;
}

export type Attribute = {
    trait_type: string;
    value: string;
}

export type NftMetadata = {
    name: null | string;
    description: null | string;
    image: null | string;
    external_url: null | string;
    attributes: Attribute[];
}

export type NftBalance =     {
    contractAddress: string;
    name: string;
    symbol: string;
    ercType: string;
    tokenId: string;
    tokenURI: string;
    metadata: NftMetadata[],
    rawMetadata: string;
}

export type NftTransfer = {
    contractAddress: string;
    tokenId: string;
    amount: string;
    blockNumber: string;
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    contractType: string;
    name: string;
    symbol: string;
}

export type Transaction = {
    blockNumber: string;
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    value: string;
    gasPrice: string;
    gasSpent: string;
    gasLimit: string;
    successful: boolean;
}

