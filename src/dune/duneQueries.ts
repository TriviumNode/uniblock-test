import { axiosDune } from "../common/axiosInstance"

export class DuneCreateQueryRequest {
    name: string;
    description: string;
    is_private: boolean;
    query_sql: string;

    constructor(name: string, description: string, query_sql: string, is_private = true) {
        this.name = name;
        this.description = description;
        this.query_sql = query_sql;
        this.is_private = is_private;
    }
}

export const createQuery = async (request: DuneCreateQueryRequest) => {
    return await axiosDune.post(
        `v1/query`,
        request,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
}

type DuneExecuteQueryResponse = {
    execution_id: string;
    state: string;
}
export const executeQuery = async (queryId: string) => {
    const result = await axiosDune.post(
        `v1/query/${queryId}/execute`,
        undefined,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return result.data as DuneExecuteQueryResponse;
}

type DuneGetExecutionResultResponse = {
    execution_id: string;
    query_id: number;
    is_execution_finished: false;
    state: 'QUERY_STATE_PENDING';
    submitted_at: string;
} | {
    execution_id: string;
    query_id: number;
    is_execution_finished: true;
    state: 'QUERY_STATE_COMPLETED';
    submitted_at: string;
    expires_at: string;
    execution_started_at: string;
    execution_ended_at: string;
    result: {
        rows: Object[],
        metadata: {
            column_names: string[],
            row_count: number;
            result_set_bytes: number;
            total_row_count: number;
            total_result_set_bytes: number;
            datapoint_count: number;
            pending_time_millis: number;
            execution_time_millis: number;
        }
    }
}
export const getExecutionResult = async (executionId: string): Promise<DuneGetExecutionResultResponse> => {
    const result = await axiosDune.get(
        `v1/execution/${executionId}/results`,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return result.data;
}