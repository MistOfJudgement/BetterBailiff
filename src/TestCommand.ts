import {ApplicationCommandType, Client, ClientOptions, ContextMenuCommandBuilder, REST, Routes} from "discord.js";
import {CLIENT_ID, DISCORD_TOKEN, TEST_SERVER} from "../config";

const data = new ContextMenuCommandBuilder()
    .setType(ApplicationCommandType.User)
    .setName("Test");

const client = new Client(<ClientOptions>{
    intents: []
});
const rest = new REST().setToken(DISCORD_TOKEN);
(async () => {
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, TEST_SERVER),
        {body: [data.toJSON()]}
    )
})();