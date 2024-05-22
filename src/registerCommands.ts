import {ClocktowerSetup, ClocktowerStart} from "./commands/clocktower";
import {REST, Routes} from "discord.js";
import {ALPHA_SERVERS, CLIENT_ID, DISCORD_TOKEN} from "../config";
import {SlashCommand} from "./SlashCommand";

const commands = [
    ClocktowerSetup,
    ClocktowerStart
];

//TODO auto generate commands to deploy

const rest = new REST().setToken(DISCORD_TOKEN);

async function deployCommands(commands: SlashCommand[], guildID: string) {
    try {
        console.log(`Started refreshing ${commands.length} commands for guild ${guildID}`);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, guildID),
            {body: commands.map(command => command.data.toJSON())}
        );
        console.log(`Successfully reloaded ${commands.length} commands for guild ${guildID}`);
    } catch (error) {
        console.error(error);
    }
}
console.log("Deploying commands");
Promise.all(ALPHA_SERVERS.map(server => deployCommands(commands, server))).then(() => {
    console.log("All commands deployed");
});