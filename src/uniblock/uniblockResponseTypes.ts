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


export type TokenMetadataResponse = {
    name: string
    symbol: string
    logo: string
    decimals: string
    rawData: {
      data: {
        address: string
        updated_at: string
        next_update_at: string
        quote_currency: string
        chain_id: number
        chain_name: string
        items: Array<{
          contract_decimals: number
          contract_name: string
          contract_ticker_symbol: string
          contract_address: string
          supports_erc?: Array<string>
          logo_url: string
          contract_display_name: string
          logo_urls: {
            token_logo_url: string
            protocol_logo_url: any
            chain_logo_url: string
          }
          last_transferred_at?: string
          native_token: boolean
          type: string
          is_spam: boolean
          balance: string
          balance_24h: string
          quote_rate?: number
          quote_rate_24h?: number
          quote?: number
          pretty_quote?: string
          quote_24h?: number
          pretty_quote_24h?: string
          protocol_metadata: any
          nft_data: any
        }>
        pagination: any
      }
      error: boolean
      error_message: any
      error_code: any
    }
}
  
