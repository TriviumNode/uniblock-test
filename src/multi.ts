import fs from 'fs';
import { AddressReport, processAddress } from "./processAddress";
import { getNftOwnersByContract } from './uniblockQueries';

const main = async () => {
    const holders = await getNftOwnersByContract('0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d')
    const results: AddressReport[] = []

    for (let holder of holders) {
        const report = await processAddress(holder.ownerAddress);
        results.push(report);
    }


    fs.writeFileSync('multi.json', JSON.stringify(results, undefined, 2));
    console.log('DONE!!!')
}

main().catch(e=>console.error(e.response?.data?.message || e));