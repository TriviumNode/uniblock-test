import fs from 'fs';
import { processAddress } from "./processAddress";

const main = async () => {
    const result = await processAddress('0x2c9a43Ac885C6B5a10f9DA5e9Ad2C46311E3e027');

    fs.writeFileSync('single.json', JSON.stringify(result, undefined, 2));

    console.log('DONE!!!')
}

main().catch(e=>console.error(e.response?.data?.message || e));
