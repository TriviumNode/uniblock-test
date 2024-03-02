

export type EvmAbi = Array<{
    constant?: boolean
    inputs: Array<{
        name: string
        type: string
        indexed?: boolean
    }>
    name: string
    outputs?: Array<{
        name: string
        type: string
    }>
    payable?: boolean
    type: string
    anonymous?: boolean
}>

const erc20Functions = ['totalSupply', 'balanceOf', 'transfer', 'allowance', 'approve', 'transferFrom']
const erc721Functions = ['balanceOf', 'ownerOf', 'safeTransferFrom', 'transferFrom', 'approve', 'getApproved', 'setApprovalForAll', 'isApprovedForAll']

export const isErc20 = (abi: EvmAbi) => {
    const functions = abi.filter((i: any)=>i.type==='function');
    const functionNames: string[] = functions.map(f=>f.name);

    for (const requiredFunction of erc20Functions){
        if (!functionNames.includes(requiredFunction)) return false;
    }
    return true;
}

export const isErc721 = (abi: EvmAbi) => {
    const functions = abi.filter((i: any)=>i.type==='function');
    const functionNames: string[] = functions.map(f=>f.name);

    for (const requiredFunction of erc721Functions){
        if (!functionNames.includes(requiredFunction)) return false;
    }
    return true;
}


type ContractType = 'ERC-20' | 'ERC-721' | 'Other'
type ClassifyContractResponse = {
    functionsList: string[];
    contractType: ContractType;
}
// Determine contract type and available functions given an ABI object from scanAbi()
export const classifyContract = (abi: EvmAbi): ClassifyContractResponse => {
    let contractType: ContractType = 'Other'
    if (isErc20(abi)) contractType = 'ERC-20'
    if (isErc721(abi)) contractType = 'ERC-721'
    const functions = abi.filter((i: any)=>i.type==='function');
    const functionsList = functions.map(f=>f.name);
    return {contractType, functionsList}
}