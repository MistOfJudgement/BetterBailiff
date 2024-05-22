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
import {SlashCommand} from "./SlashCommand";
import {ClocktowerEvents, ClocktowerSetup, ClocktowerStart} from "./commands/clocktower";
import * as events from "events";

export class BailiffBot extends Client {
    commands: Collection<string, SlashCommand> = new Collection<string, SlashCommand>();
    constructor(options: ClientOptions) {
        super(options);
    }

    addCommand(command: SlashCommand) {
        this.commands.set(command.data.name, command);
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

client.addCommand(ClocktowerSetup)
client.addCommand(ClocktowerStart)
client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;
    interaction = interaction as ChatInputCommandInteraction;
    console.log(`Received command ${interaction.commandName}`);
    const command = client.commands.get(interaction.commandName);
    if(!command) {
        console.error(`Command ${interaction.commandName} not found`);
        return;
    }
    try {
        console.log(`Executing command ${interaction.commandName}`);
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
})
const handlers = ClocktowerEvents;
for(const event in handlers) {
    client.on(event as keyof ClientEvents, handlers[event] as (...args: any[]) => void);
}
client.on(Events.ClientReady, (readyClient)=> {
    console.log(`Logged in as ${readyClient.user?.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

})

process.on('SIGINT', async function() {
    console.log("Caught interrupt signal");
    await client.destroy();
    console.log("Shutdown complete");
    process.exit();
});

client.login(DISCORD_TOKEN);