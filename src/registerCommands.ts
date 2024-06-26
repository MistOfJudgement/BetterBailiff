import {ClocktowerContext, ClocktowerSetup, ClocktowerStart} from "./commands/clocktower";
import {REST, Routes} from "discord.js";
import {ALPHA_SERVERS, CLIENT_ID, DISCORD_TOKEN} from "../config";
import {SlashCommand} from "./SlashCommand";
import { baseLogger, logMethodCalls } from "./logging";
const logger = baseLogger.child({context: "CommandDeployer"});
const commands = [
    ...ClocktowerContext.commands.values(),
];

//TODO auto generate commands to deploy

const rest = new REST().setToken(DISCORD_TOKEN);
async function deployCommands(commands: SlashCommand[], guildID: string) {
    try {
        logger.info(`Started refreshing ${commands.length} commands for guild ${guildID}`);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, guildID),
            {body: commands.map(command => command.data.toJSON())}
        );
        logger.info(`Successfully reloaded ${commands.length} commands for guild ${guildID}`);
    } catch (error) {
        logger.error(error);
    }
}
logger.info("Deploying commands");
Promise.all(ALPHA_SERVERS.map(server => deployCommands(commands, server))).then(() => {
    logger.info("All commands deployed");
});