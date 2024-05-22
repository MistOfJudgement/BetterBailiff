import {
    SharedNameAndDescription,
    SharedSlashCommandOptions,
    SlashCommandBuilder,
    ToAPIApplicationCommandOptions
} from "@discordjs/builders";
import {BaseInteraction} from "discord.js";

export interface SlashCommand {
    data: any;
    execute: (interaction: any) => Promise<void>;
}