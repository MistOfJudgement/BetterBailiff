import {configDotenv} from "dotenv";

configDotenv();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const TEST_SERVER = process.env.TEST_SERVER;
export const CLIENT_ID = process.env.CLIENT_ID;
