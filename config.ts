import {configDotenv} from "dotenv";

configDotenv();

export const DISCORD_TOKEN : string = process.env.DISCORD_TOKEN;
export const TEST_SERVER : string = process.env.TEST_SERVER;
export const CLIENT_ID : string = process.env.CLIENT_ID;
//Servers to deploy commands to
export const ALPHA_SERVERS : string[] = process.env.ALPHA_SERVERS?.split(",") ?? [];
