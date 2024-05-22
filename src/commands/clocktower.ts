import {SlashCommandBuilder} from "@discordjs/builders";
import {CacheType, ChatInputCommandInteraction, Collection, RepliableInteraction} from "discord.js";
import {SlashCommand} from "../SlashCommand";

interface ClocktowerSession {
    guildId: string;
    roleId?: string;
}
const sessions: Collection<string, ClocktowerSession> = new Collection<string, ClocktowerSession>();
export const ClocktowerSetup: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("clocktowerrole")
        .setDescription("Set the role to be pinged for Clocktower")
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("The role to be pinged for Clocktower")
                .setRequired(true)
        )
        .setDMPermission(false),

    execute: async (interaction) => {
        //i dont know how to type it to get the right methods exposed
        if(!interaction.isChatInputCommand()) return;

        const guildId = interaction.guildId;
        const roleId = interaction.options.getRole("role")?.id;
        if (!sessions.has(guildId)) {
            sessions.set(guildId, {guildId, roleId});
        } else {
            sessions.get(guildId)!.roleId = roleId;
        }
        console.log(`Clocktower role set to ${roleId} in guild ${guildId}`);
        await interaction.reply({
            content: `Clocktower role set to <@&${roleId}>`
        });
    }
}