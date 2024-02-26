import axios from "./axiosInstance";
import { NftBalance, NftTransfer, TokenAllowance, TokenBalanceWithMetadata, Transaction } from "./uniblockResponseTypes";
import fs from 'fs';
import { sleep } from "./utils";
import { getNftBalance, getNftTransfers, getTokenAllowances, getTokenBalances, getTransactions } from "./uniblockQueries";

export type ChainReport = {
    chain: string;
    tokenBalances: TokenBalanceWithMetadata[];
    tokenAllowances: TokenAllowance[];
    // tokenTransfers: any[];
    nftBalances: NftBalance[];
    nftTransfers: NftTransfer[];
    transactions: Transaction[];
}

export type AddressReport = {
    walletAddress: string;
    reportDate: Date;
    chainReports: ChainReport[];
}

const ChainMap = new Map([
    ['1', 'Ethereum'],
    ['56', 'Binance Smart Chain'],
    ['137', 'Polygon'],
    // ['250', 'Fantom Opera'],
    // ['42220', 'Cleo'],
    // ['43114', 'Avalanche'],
    // ['42161', 'Arbitrum One'],
    // ['solana', 'Solana'],
    // ['5', 'Goerli Testnet'],
    // ['11155111', 'Sepolia Testnet'],
    // ['97', 'Binance Smart Chain Testnet'],
    // ['80001', 'Mumbai Testnet'],
])

export const processAddress = async (walletAddress = '0xf0c1E3f2c215a7CEb9E241950AcC7cE1434c5B0F'): Promise<AddressReport> => {
    const reportDate = new Date();

    const report: AddressReport = {
        walletAddress,
        reportDate,
        chainReports: []
    }

    for (const [chainId, chainName] of ChainMap.entries()){
        console.log(`Processing address ${walletAddress} for chain ${chainName}.`)

        const tokenBalances = await getTokenBalances(walletAddress, chainId);
        await sleep(500);

        const tokenAllowances = await getTokenAllowances(walletAddress, chainId);
        await sleep(500);

        // const tokenTransfers = await getTokenTransfers(walletAddress, chainId); //Doesn't work

        const nftBalances = await getNftBalance(walletAddress, chainId);
        await sleep(500);

        const nftTransfers = await getNftTransfers(walletAddress, chainId);
        await sleep(500);

        const transactions = await getTransactions(walletAddress, chainId); //SLOW AF
        await sleep(500);
        // const transactions: any[] = [];

        const chainReport: ChainReport = {
            chain: chainName,
            tokenBalances,
            tokenAllowances,
            nftBalances,
            nftTransfers,
            transactions,
        }
        report.chainReports.push(chainReport);
    }

    return report;
}