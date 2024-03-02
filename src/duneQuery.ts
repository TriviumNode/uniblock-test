import { DuneCreateQueryRequest, createQuery, executeQuery, getExecutionResult } from "./dune/duneQueries";
import sleep from "./common/sleep";

const addressesWith25Txs = `
WITH filtered_transactions AS (
    SELECT
        "from",
        COUNT(*) AS tx_count
    FROM ethereum.transactions
    WHERE
        block_time BETWEEN CURRENT_DATE - INTERVAL '3' month AND CURRENT_DATE
    GROUP BY
        "from"
    HAVING
        COUNT(*) > 25
)
SELECT
    "from"
FROM filtered_transactions
ORDER BY
    RANDOM()
LIMIT 50000
`;

(async()=>{

    //Requires Premium
    // const createQueryRequest = new DuneCreateQueryRequest('TestAccounts25txs', 'Gets accounts with >25 transactions', addressesWith25Txs);
    // const createQueryResponse = await createQuery(createQueryRequest);

    const queryId = '3468840';
    const {execution_id} = await executeQuery(queryId);
    console.log(execution_id)

    let result = await getExecutionResult(execution_id);
    while (!result.is_execution_finished){
        await sleep(2_000);
        result = await getExecutionResult(execution_id);
    }
    console.log(result.result.rows)


})();