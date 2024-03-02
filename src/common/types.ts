export type AddressReport = {
    wallet: string
    transactions: Array<AddressTransaction>
}

export type AddressTransaction = {
    gas: {
        gasValue: number
        gas: number
        gasPrice: number
    }
    type: string
    indicator: string
    smartContract: SmartContract | null
    date: string
    hash: string
    block: {
        height: number
    }
    details: SwapDetails | TransferDetails | null;
    // buyAmount: number
    // buyAmountInUsd: number
    // buyCurrency: {
    //     symbol: string
    //     address: string
    //     name: string
    // }
    // sellAmount: number
    // sellAmountInUsd: number
    // sellCurrency: {
    //     symbol: string
    //     address: string
    //     tokenType: string
    // }
    // valueUsd: number
}
  

export type SmartContract = {
    address: {
        address: string
        annotation: any
    }
    contractType: string
    name: string | null
    currency: {
        symbol: string | null,
        decimals: string | null,
    } | null
}

export type SwapDetails = {
    buyAmount: number
    buyAmountInUsd: number
    buyCurrency: {
      symbol: string
      address: string
      name: string
    }
    sellAmount: number
    sellAmountInUsd: number
    sellCurrency: {
      symbol: string
      address: string
      tokenType: string
    }
    valueUsd: number
}

export type TransferDetails = {
    fromAddress: string;
    fromLabel?: string;
    toAddress: string;
    toLabel?: string;
    amount: number;
    currency: {
        symbol: string | null;
        address: string | null;
        tokenType: string;
    },
    valueUsd: number;
}

export type UnknownDetails = {

}