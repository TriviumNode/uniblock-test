import { EvmAbi } from "../abiUtils";
import axios from "../common/axiosInstance";
import { BalanceResponse, NftBalance, NftTransfer, TokenAllowance, TokenBalance, TokenBalanceWithMetadata, TokenMetadataResponse, Transaction } from "./uniblockResponseTypes";

const tokenMetadataMap = new Map<String, TokenMetadataResponse>()

export const getTokenMetadata = async (tokenAddress: string, chainId = '1'): Promise<TokenMetadataResponse | void> => {
    try {
        const cacheKey = `${tokenAddress}-${chainId}`
        const cache = tokenMetadataMap.get(cacheKey);
        if (cache) return cache;

        const {data}: {data: TokenMetadataResponse} = await axios.get(
            `token/metadata`,
            {
                params: {
                    chainId,
                    tokenAddress,
                    includeRaw: 'true',
                    provider: 'Covalent'
                }
            }
        );
        tokenMetadataMap.set(cacheKey, data);
        return data;
    } catch(err: any) {
        console.error('Failed to get Token Balances:', err.toString());
    }
}

export const getTokenBalances = async (walletAddress: string, chainId = '1') => {
    try {
        console.log('Getting Token Balances...')
        const {data}: {data: BalanceResponse<TokenBalanceWithMetadata>} = await axios.get(
            `token/balance`,
            {
                params: {
                    chainId,
                    walletAddress,
                    includeMetadata: true,
                    includeRaw: 'true',
                    provider: 'Covalent'
                }
            }
        );
        return data as any;
    } catch(err: any) {
        console.error('Failed to get Token Balances:', err.toString());
        return []
    }
}

export const getTokenTransfers = async (walletAddress: string, chainId = '1') => {
    console.log('Getting Token Transfers...')
    const {data}: {data: any} = await axios.get(
        `token/transfers`,
        {
            params: {
                chainId,
                walletAddress,
            }
        }
    );
    console.log('Transfers', data)
}

export const getTokenAllowances = async (walletAddress: string, chainId = '1') => {
    try {
        console.log('Getting Token Allowances...')
        const {data}: {data: {allowances: TokenAllowance[]}} = await axios.get(
            `token/allowances`,
            {
                params: {
                    chainId,
                    walletAddress,
                }
            }
        );
        return data.allowances;
    } catch(err: any) {
        console.error('Failed to get Token Allowances:', err.toString());
        return []
    }
}

// Returns a list of networks and the data activity was last seen?
export const getTokenActivity = async (walletAddress: string, chainId = '1') => {
    const {data}: {data: any} = await axios.get(
        `token/activity`,
        {
            params: {
                chainId,
                walletAddress,
            }
        }
    );
    return data.tokens;
}

// Get the NFT balances of an address.
export const getNftBalance = async (walletAddress: string, chainId = '1') => {
    console.log('Getting NFT Balances...')
    try {
        const {data}: {data: {balances: NftBalance[]}} = await axios.get(
            `nft/balance`,
            {
                params: {
                    chainId,
                    walletAddress,
                }
            }
        );
        return data.balances;
    } catch(err: any) {
        console.error('Failed to get NFT Balances:', err.toString());
        return []
    }
}

// Get the NFT transfers of a wallet.
export const getNftTransfers = async (walletAddress: string, chainId = '1') => {
    try {
        console.log('Getting NFT Transfers...')
        const {data}: {data: {transfers: NftTransfer[]}} = await axios.get(
            `nft/transfers`,
            {
                params: {
                    chainId,
                    walletAddress,
                }
            }
        );
        return data.transfers;
    } catch(err: any) {
        console.error('Failed to get NFT Transfers:', err.toString());
        return []
    }
}

// Gets all NFT contracts held by an owner address.
export const getNftOwnedCollections = async (walletAddress: string, chainId = '1') => {
    const {data}: {data: any} = await axios.get(
        `nft/owned-collections`,
        {
            params: {
                chainId,
                walletAddress,
            }
        }
    );
    console.log(data)
}

// Get list of wallet addresses owning one or more of the contract's nfts.
export const getNftOwnersByContract = async (contractAddress: string, chainId = '1') => {
    const {data}: {data: {owners: {ownerAddress: string, acquiredDate: string}[]}} = await axios.get(
        `nft/owners/contract`,
        {
            params: {
                chainId,
                contractAddress,
            }
        }
    );
    return data.owners;
}

// Get the transactions of an address.
export const getTransactions = async (walletAddress: string, chainId = '1'): Promise<any> => {
    try {
        console.log('Getting Transactions...')
        const {data}: {data: {transactions: Transaction[]}} = await axios.get(
            `transactions`,
            {
                params: {
                    chainId,
                    walletAddress,
                    includeRaw: 'true',
                    provider: 'Covalent'
                },
                timeout: 60_000
            }
        );
        return data;
    } catch(err: any) {
        console.error('Failed to get Transactions:', err.toString());
        return []
    }
}

type ScanAbiResponse = {
    // JSON String
    abi: string;
}
export const scanAbi = async (address: string, chainId = '1'): Promise<EvmAbi | undefined> => {
    try {
        const {data}: {data: ScanAbiResponse} = await axios.get(
            `scan/contract-abi`,
            {
                params: {
                    chainId,
                    address,
                    // includeRaw: 'true',
                    // provider: 'Covalent'
                },
                timeout: 15_000
            }
        );
        const abi: EvmAbi = JSON.parse(data.abi)
        return abi;
    } catch(err: any) {
        if (!err.toString().includes('Request failed with status code 503')) console.error('Failed to get ABI:', err.toString());
        return undefined;
    }
}

// Transactions from EtherScan
export const scanTransactions = async (walletAddress: string, chainId = '1'): Promise<any> => {
    try {
        const {data}: {data: {transactions: Transaction[]}} = await axios.get(
            `scan/account-normal-transactions`,
            {
                params: {
                    chainId,
                    walletAddress,
                },
                timeout: 60_000
            }
        );
        return data;
    } catch(err: any) {
        console.error('Failed to scan Transactions:', err.toString());
        return []
    }
}