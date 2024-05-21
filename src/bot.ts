import {Client, ClientOptions, Events, GatewayIntentBits} from "discord.js";
import {DISCORD_TOKEN} from "../config";

export class BailiffBot extends Client {
    constructor(options: ClientOptions) {
        super(options);
    }
}

const client = new BailiffBot(<ClientOptions>{
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessagePolls
    ]
});

client.on(Events.ClientReady, (readyClient)=> {
    console.log(`Logged in as ${readyClient.user?.tag}`);
});

process.on('SIGINT', async function() {
    console.log("Caught interrupt signal");
    await client.destroy();
    console.log("Shutdown complete");
    process.exit();
});

client.login(DISCORD_TOKEN);