import axios1 from "axios";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.UNIBLOCK_API_KEY) throw `Environment variable UNIBLOCK_API_KEY is undefined`
if (!process.env.UNIBLOCK_ENDPOINT) throw `Environment variable UNIBLOCK_ENDPOINT is undefined`

const axios = axios1.create({
    baseURL: process.env.UNIBLOCK_ENDPOINT,
    timeout: 15_000,
    headers: {'X-API-KEY': process.env.UNIBLOCK_API_KEY}
});

export default axios;