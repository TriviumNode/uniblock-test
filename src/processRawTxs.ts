import fs from 'fs'
import { getTokenMetadata, getTransactions, scanAbi } from './uniblock/uniblockQueries';
import { isErc20 } from './abiUtils';
import { CovalentRawTransaction } from './uniblock/covalentTypes';
import { parseUniswapTx } from './uniswap/uniswap';
import { AddressReport, AddressTransaction, SmartContract, SwapDetails, TransferDetails } from './common/types';

const address = '0x36991b237b1a2c2eafd94274f11e589d3c041c95'
// const address = '0xf0c1e3f2c215a7ceb9e241950acc7ce1434c5b0f'

// Example of processing raw transactions (from Covalent) for a single address
const main = async () => {
    const txs = await getTransactions(address);
    fs.writeFileSync('transactionsWithCovalentRawResponse.json', JSON.stringify(txs, undefined, 2));

    const processedTxs: AddressTransaction[] = [];

    for (const tx of txs.rawData.data.items as CovalentRawTransaction[]){
        // Skip failed transactions
        if (!tx.successful) continue;

        const common = {
            hash: tx.tx_hash,
            sender: tx.from_address,
            block: {
                height: tx.block_height,
            },
            date: tx.block_signed_at,
            gas: {
                gas: tx.gas_spent,
                gasPrice: tx.gas_price,
                gasValue: tx.gas_quote,
            },
        };
        const smartContractCommon = {
            address: {
                address: tx.to_address,
                annotation: tx.to_address_label,
            },
        }

        // Parse ETH transfer between wallets
        // ETH transfers do not execute a contract and therefore have no log_events
        if (!tx.log_events) {
            const details: TransferDetails = {
                currency: {
                    address: null,
                    symbol: 'ETH',
                    tokenType: 'NATIVE'
                },
                amount: parseInt(tx.value) / 10e17,
                fromAddress: tx.from_address,
                fromLabel: tx.from_address_label,
                toAddress: tx.to_address,
                toLabel: tx.to_address_label,
                valueUsd: tx.value_quote,
            }
            processedTxs.push({
                type: 'TRANSFER',
                indicator: 'ETH',
                ...common,
                smartContract: null,
                details
            });
            continue;
        }

        // Check for ERC20/ERC721 transfers between wallets
        // A simple transfer emits only one `Transfer` event containing the amount, sender, and recipient
        if (tx.log_events.length === 1){
            const abi = await scanAbi(tx.to_address);
            if (abi){
                if (isErc20(abi) && tx.log_events[0].decoded.name === 'Transfer'){
                    const metadata = await getTokenMetadata(tx.to_address);

                    const humanAmount = parseInt(tx.log_events[0].decoded.params.find(p=>p.name === 'value')?.value || '0') / Math.pow(10, parseInt(metadata?.decimals || '0'))
                    const details: TransferDetails = {
                        currency: {
                            address: tx.to_address,
                            symbol: metadata?.symbol || null,
                            tokenType: 'ERC20'
                        },
                        amount: humanAmount,
                        fromAddress: tx.log_events[0].decoded.params.find(p=>p.name === 'from')?.value || '',
                        toAddress: tx.log_events[0].decoded.params.find(p=>p.name === 'to')?.value || '',
                        valueUsd: 0,
                    }
                    processedTxs.push({
                        type: 'TRANSFER',
                        indicator: 'TOKEN',
                        ...common,
                        smartContract: {
                            ...smartContractCommon,
                            contractType: 'ERC20',
                            name: metadata?.name || null,
                            currency: {
                                symbol: metadata?.symbol || null,
                                decimals: metadata?.decimals || null,
                            }
                        },
                        details
                    });
                    continue;
                }

            }
        }

        // Check for and parse Uniswap TX
        const uniswapData = parseUniswapTx(tx)
        if (uniswapData) {
            let details: any = null;
            if (uniswapData.type === 'Swap'){
                details = {
                    //@ts-ignore
                    sellAmount: uniswapData.inputAmount,
                    sellAmountInUsd: 0,
                    //@ts-ignore
                    sellCurrency: uniswapData.inputToken,
                    //@ts-ignore
                    buyAmount: uniswapData.outputAmount,
                    //@ts-ignore
                    buyCurrency: uniswapData.outputToken,
                    buyAmountInUsd: 0,
                    valueUsd: 0
                }
            }
            processedTxs.push({
                type: 'DEFI',
                indicator: uniswapData.type,
                ...common,
                smartContract: {
                    ...smartContractCommon,
                    contractType: "DEX",
                    name: "Uniswap",
                    currency: null
                },
                details
            });
            continue;
        }


        // Else Handle Other (Unknown) Transactions
        processedTxs.push({
            type: 'UNKNOWN',
            indicator: 'UNKNOWN',
            ...common,
            smartContract: {
                ...smartContractCommon,
                contractType: 'UNKNOWN',
                currency: null,
                name: 'Unknown',
            },
            details: null
        });
    }

    console.log(JSON.stringify(processedTxs, undefined, 2))

    const output: AddressReport = {
        wallet: address,
        transactions: processedTxs
    }
    fs.writeFileSync('processedRawTransactions.json', JSON.stringify(output, undefined, 2));
}

main().catch(e=>console.error(e.response?.data?.message || e));
