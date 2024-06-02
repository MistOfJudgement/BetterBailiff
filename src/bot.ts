import {
    BaseInteraction,
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
import { baseLogger, logMethodCalls } from "./logging";

const logger = baseLogger.child({context: "BailiffBot"});
export class BailiffBot extends Client {
    contexts: GuildContext<any>[] = [ClocktowerContext]
    constructor(options: ClientOptions) {
        super(options);
    }

    @logMethodCalls()
    setupEvents() {
        const eventsToRegister: SupportedEvents[] = [];
        for (const context of this.contexts) {
            for (const [event, _executor] of context.events) {
                eventsToRegister.push(event);
            }
        }
        for (const event of eventsToRegister) {
            this.on(event, (...args) => {
                logger.info(`Event ${event} fired`)
                for (const context of this.contexts) {
                    const executor = context.events.get(event);
                    if (executor) {
                        logger.info(`Executing event ${event} for context ${context.name}`);
                        void executor(...args);
                    }
                }
            });
        }
    }
    @logMethodCalls()
    setupCommands() {
        this.on(Events.InteractionCreate, async (interaction : BaseInteraction) => {
            if (!interaction.isCommand()) return;
            logger.info(`Command ${interaction.commandName} received`);
            for (const context of this.contexts) {
                const command = context.commands.get(interaction.commandName);
                if (command) {
                    logger.info(`Executing command ${interaction.commandName} for context ${context.name}`);
                    await command.execute(interaction);
                }
            }
        });
    }

    async login(token?: string) {
        client.on(Events.ClientReady, (readyClient)=> {
            logger.info(`Logged in as ${readyClient.user?.tag}`);
        });
        this.setupEvents();
        this.setupCommands();
        return super.login(token);
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




let shutdownLock = false;
process.on('SIGINT', async function() {
    if (shutdownLock) {
        return;
    }
    shutdownLock = true;
    logger.info("Caught interrupt signal");
    await client.destroy();
    logger.info("Shutdown complete");
    process.exit();
});

void client.login(DISCORD_TOKEN)