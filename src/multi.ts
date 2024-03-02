import fs from 'fs';
import { AddressReport, processAddress } from "./processAddress";
import { getNftOwnersByContract } from './uniblock/uniblockQueries';

// Generate a report for multiple addresses
const main = async () => {
    // For example, generate a report for 100 holders of BAYC NFT's
    const addresses = await getNftOwnersByContract('0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d')
    const results: AddressReport[] = []

    for (const address of addresses) {
        const report = await processAddress(address.ownerAddress);
        results.push(report);
    }


    fs.writeFileSync('multi.json', JSON.stringify(results, undefined, 2));
    console.log('DONE!!!')
}

main().catch(e=>console.error(e.response?.data?.message || e));