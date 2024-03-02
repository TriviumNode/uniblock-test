import { ethers } from "ethers";
import { CovalentRawTransaction } from "../uniblock/covalentTypes";
import { UniswapPairs } from "./uniswapPairs";
import { getBurnEventSignature, getMintEventSignature, getSwapEventSignature, getTransferEventSignature } from "./uniswapUtils";

const transferSig = getTransferEventSignature();
const swapSig = getSwapEventSignature();
const burnSig = getBurnEventSignature();
const mintSig = getMintEventSignature();

// Number of blocks to queue before we process block.
//  TX events are async and we might still get events after the next
//  block has started, so we queue up blocks and only process block
//  when they queue is full.
const MAX_BLOCK_QUEUE = 3;

// Frontrunning transactions are in front of block. This limits
//   the analysis to those transactions that are less than this position.
const MAX_POSITION_IN_BLOCK = 15;

// Number of Uniswap V2 trading pairs to include. Max is 5000.
const NUM_TRADING_PAIRS = 5000;

// Print debug to console. This can be pasted into spreadsheet for testing.
const PRINT_CSV_ALL = false; // All blocks together
const PRINT_CSV_PER_BLOCK = false; // Each block with its own header

// Limit number of trading pairs
let uniswapPairs: string[] = [];
for(let i=0; i<NUM_TRADING_PAIRS; i++) {
  let p = UniswapPairs[i];
  uniswapPairs.push(p.id)
}

// create map of token symbols keyed by pair address
let pair_token_dict: {[key: string] : any } = {}
for(let i=0; i<NUM_TRADING_PAIRS; i++) {
  let p = UniswapPairs[i];
  pair_token_dict[p.id] = {
    'token0' : p.token0.symbol,
    'token0Decimals': p.token0.decimals,
    'token1' : p.token1.symbol,
    'token1Decimals': p.token1.decimals,
  }
}

export function parseUniswapTx(rawTx: CovalentRawTransaction) {
  let hasAddress: boolean = false;
  let pairAddress: string = '';
  for(const log of rawTx.log_events) {
    if( uniswapPairs.includes(log.sender_address)) {
      hasAddress = true;
      pairAddress = log.sender_address;
    }
  }

  if (!hasAddress) return;

  const data = parseUniswapSwap(rawTx) || parseUniswapWithdraw(rawTx) || parseUniswapProvide(rawTx)

  if (data) return data;
}

export function parseUniswapSwap(rawTx: CovalentRawTransaction) {
  var inputAmount = 0;
  var inputDecimals = 0;
  var outputAmount = 0;
  var outputDecimals = 0;
  var tokens: string[] = [];
  var tokenAmmounts: any[] = [];

  let hasAddress: boolean = false;
  let pairAddress: string = '';
  for(const log of rawTx.log_events) {
    if( uniswapPairs.includes(log.sender_address)) {
      hasAddress = true;
      pairAddress = log.sender_address;
    }
  }

  if(hasAddress) {
    let inputToken = '';
    let outputToken = '';
    let tradeSummary = [];
    let tradeSummaryReverse = [];

    // Util.printSignature(receipt.logs); // debug

    let skip = true;
    for(const log of rawTx.log_events) {
      for(let topic of log.raw_log_topics) {

        if(topic === transferSig) { // Transfer()
          // Transfer has a single ammount
          // const decoded_data = ethers.utils.defaultAbiCoder.decode(['uint256'], Buffer.from(log.raw_log_data as string, 'hex'))[0].toString();
          tokens.push(log.sender_address);
          tokenAmmounts.push(log.decoded);
        }

        if(topic === swapSig) { // Swap()
          skip = false;

          // Get values from data (non-indexed values)
          // const decoded_data = ethers.utils.defaultAbiCoder.decode(['uint256','uint256','uint256','uint256'], Buffer.from(log.raw_log_data as string, 'hex'));

          const amount0In = parseInt(log.decoded.params.find(p=>p.name === 'amount0In')?.value || '0')
          const amount1In = parseInt(log.decoded.params.find(p=>p.name === 'amount1In')?.value || '0')
          const amount0Out = parseInt(log.decoded.params.find(p=>p.name === 'amount0Out')?.value || '0')
          const amount1Out = parseInt(log.decoded.params.find(p=>p.name === 'amount1Out')?.value || '0')

          if (!(log.sender_address in pair_token_dict)) {
            tradeSummary.push('NOPAIR');
            tradeSummaryReverse.unshift('NOPAIR');
            continue;
          }


          if(amount0In.toString() === '0') {
            inputToken = pair_token_dict[log.sender_address].token1 // get address from log, in multi-token transfers each swap will have it's own
            inputDecimals = pair_token_dict[log.sender_address].token1Decimals
          }
          else {
            inputToken = pair_token_dict[log.sender_address].token0
            inputDecimals = pair_token_dict[log.sender_address].token0Decimals
          }
          if(amount0Out.toString() === '0') {
            outputToken = pair_token_dict[log.sender_address].token1
            outputDecimals = pair_token_dict[log.sender_address].token1Decimals
          }
          else {
            outputToken = pair_token_dict[log.sender_address].token0
            outputDecimals = pair_token_dict[log.sender_address].token0Decimals
          }
          // A trading pair can trade in either direction, so save the direction
          tradeSummary.push(inputToken + ' for ' + outputToken);

          // Also save reverse direction as that identifies the backrun sandwich trade
          tradeSummaryReverse.unshift(outputToken + ' for ' + inputToken);

          inputAmount = Math.max(amount0In, amount1In);
          outputAmount = Math.max(amount0Out, amount1Out);
          // const addr1 = ethers.utils.defaultAbiCoder.decode(['address'], log.topics[1])[0]
          // const addr2 = ethers.utils.defaultAbiCoder.decode(['address'], log.topics[2])[0]
        }
      }
    }
    // Skip if not a swap TX
    if (skip) {
      return;
    }

    // Gas
    //let gasUsed = Web3.utils.toBN(receipt.gasUsed).toString();
    //let cumulativeGasUsed = Web3.utils.toBN(receipt.cumulativeGasUsed).toString();
    // let gasPriceGwei = Web3.utils.fromWei(Web3.utils.toBN(tx.transaction.gasPrice), 'Gwei');
    //let transactionValue = web3.utils.fromWei(Web3.utils.toBN(tx.transaction.value));

    // Use any input/output that is weth to get trade amount
    // let wethPosition = '';
    // let ethEquivAmount: any = 0;
    // const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    // for(let i in tokens) {
    //   if(tokens[i] === wethAddress) {
    //     wethPosition = i;
    //     ethEquivAmount = tokenAmmounts[i];
    //     ethEquivAmount = ethers.utils.formatEther(ethEquivAmount);
    //     break;
    //   }
    // }

    const data = {
      type: 'Swap',
      inputToken,
      inputAmount: inputAmount / Math.pow(10, inputDecimals),
      outputToken,
      outputAmount: outputAmount / Math.pow(10, outputDecimals),
      pairAddress
    }
    return data;


  }

};

export function parseUniswapWithdraw(rawTx: CovalentRawTransaction) {
  var outputAmount0 = 0;
  var outputAmount1 = 0;
  var tokens: string[] = [];
  var tokenAmmounts: any[] = [];

  let hasAddress: boolean = false;
  let pairAddress: string = '';
  for(const log of rawTx.log_events) {
    if( uniswapPairs.includes(log.sender_address)) {
      hasAddress = true;
      pairAddress = log.sender_address;
    }
  }

  if(hasAddress) {
    let outputToken0 = '';
    let outputToken0Decimals = 0;
    let outputToken1 = '';
    let outputToken1Decimals = 0;
    let tradeSummary = [];
    let tradeSummaryReverse = [];

    // Util.printSignature(receipt.logs); // debug

    let skip = true;
    for(const log of rawTx.log_events) {
      for(let topic of log.raw_log_topics) {

        if(topic === transferSig) { // Transfer()
          // Transfer has a single ammount
          // const decoded_data = ethers.utils.defaultAbiCoder.decode(['uint256'], Buffer.from(log.raw_log_data as string, 'hex'))[0].toString();
          tokens.push(log.sender_address);
          tokenAmmounts.push(log.decoded);
        }

        if(topic === burnSig) { // Burn()
          skip = false;

          // Get values from data (non-indexed values)
          // const decoded_data = ethers.utils.defaultAbiCoder.decode(['uint256','uint256','uint256','uint256'], Buffer.from(log.raw_log_data as string, 'hex'));

          const amount0 = parseInt(log.decoded.params.find(p=>p.name === 'amount0')?.value || '0')
          const amount1 = parseInt(log.decoded.params.find(p=>p.name === 'amount1')?.value || '0')

          if (!(log.sender_address in pair_token_dict)) {
            tradeSummary.push('NOPAIR');
            tradeSummaryReverse.unshift('NOPAIR');
            continue;
          }

          outputToken0 = pair_token_dict[log.sender_address].token0
          outputToken1 = pair_token_dict[log.sender_address].token1
          outputToken0Decimals = pair_token_dict[log.sender_address].token0Decimals
          outputToken1Decimals = pair_token_dict[log.sender_address].token1Decimals
          outputAmount0 = amount0
          outputAmount1 = amount1
        }
      }
    }
    // Skip if not a swap TX
    if (skip) {
      return;
    }

    const data = {
      type: 'Withdraw Liquidity',
      outputToken0,
      outputAmount0: outputAmount0 / Math.pow(10, outputToken0Decimals),
      outputToken1,
      outputAmount1: outputAmount1 / Math.pow(10, outputToken1Decimals),
      pairAddress
    }
    return data;


  }

};

export function parseUniswapProvide(rawTx: CovalentRawTransaction) {
  var inputAmount0 = 0;
  var inputAmount1 = 0;
  var tokens: string[] = [];
  var tokenAmmounts: any[] = [];

  let hasAddress: boolean = false;
  let pairAddress: string = '';
  for(const log of rawTx.log_events) {
    if( uniswapPairs.includes(log.sender_address)) {
      hasAddress = true;
      pairAddress = log.sender_address;
    }
  }

  if(hasAddress) {
    let inputToken0 = '';
    let inputToken0Decimals = 0;
    let inputToken1 = '';
    let inputToken1Decimals = 0;
    let tradeSummary = [];
    let tradeSummaryReverse = [];

    // Util.printSignature(receipt.logs); // debug

    let skip = true;
    for(const log of rawTx.log_events) {
      for(let topic of log.raw_log_topics) {

        if(topic === transferSig) { // Transfer()
          // Transfer has a single ammount
          // const decoded_data = ethers.utils.defaultAbiCoder.decode(['uint256'], Buffer.from(log.raw_log_data as string, 'hex'))[0].toString();
          tokens.push(log.sender_address);
          tokenAmmounts.push(log.decoded);
        }

        if(topic === mintSig) { // Mint()
          skip = false;

          // Get values from data (non-indexed values)
          // const decoded_data = ethers.utils.defaultAbiCoder.decode(['uint256','uint256','uint256','uint256'], Buffer.from(log.raw_log_data as string, 'hex'));

          const amount0 = parseInt(log.decoded.params.find(p=>p.name === 'amount0')?.value || '0')
          const amount1 = parseInt(log.decoded.params.find(p=>p.name === 'amount1')?.value || '0')

          if (!(log.sender_address in pair_token_dict)) {
            tradeSummary.push('NOPAIR');
            tradeSummaryReverse.unshift('NOPAIR');
            continue;
          }

          inputToken0 = pair_token_dict[log.sender_address].token0
          inputToken1 = pair_token_dict[log.sender_address].token1
          inputAmount0 = amount0
          inputAmount1 = amount1
          inputToken0Decimals = pair_token_dict[log.sender_address].token0Decimals
          inputToken1Decimals = pair_token_dict[log.sender_address].token1Decimals
        }
      }
    }
    // Skip if not a swap TX
    if (skip) {
      return;
    }

    const data = {
      type: 'Provide Liquidity',
      inputToken0,
      inputAmount0: inputAmount0 / Math.pow(10, inputToken0Decimals),
      inputToken1,
      inputAmount1: inputAmount1 / Math.pow(10, inputToken1Decimals),
      pairAddress
    }
    return data;

  }

};