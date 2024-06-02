import {
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    ClientOptions,
    Collection,
    Events,
    GatewayIntentBits
} from "discord.js";
import {DISCORD_TOKEN} from "../config";
import {GuildContext, SlashCommand, SupportedEvents} from "./SlashCommand";
import {ClocktowerContext, ClocktowerSetup, ClocktowerStart} from "./commands/clocktower";
import * as events from "events";

export class BailiffBot extends Client {
    contexts: GuildContext<any>[] = [ClocktowerContext]
    constructor(options: ClientOptions) {
        super(options);
    }

    setupEvents() {
        const eventsToRegister: SupportedEvents[] = [];
        for (const context of this.contexts) {
            for (const [event, _executor] of context.events) {
                eventsToRegister.push(event);
            }
        }
        for (const event of eventsToRegister) {
            this.on(event, (...args) => {
                for (const context of this.contexts) {
                    const executor = context.events.get(event);
                    if (executor) {
                        void executor(...args);
                    }
                }
            });
        }
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

void client.login(DISCORD_TOKEN);