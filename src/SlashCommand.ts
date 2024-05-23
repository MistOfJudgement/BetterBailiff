import {
    SharedNameAndDescription,
    SharedSlashCommandOptions,
    SlashCommandBuilder,
    ToAPIApplicationCommandOptions
} from "@discordjs/builders";
import {BaseInteraction} from "discord.js";
import {ClientEvents, Events} from "discord.js/typings";
type Args = ClientEvents[Events.MessagePollVoteAdd];
export type EventExecutor<E extends keyof ClientEvents> = (...args: ClientEvents[E]) => Promise<void>
export type EventHandler = {
    [key in keyof ClientEvents] +?: EventExecutor<key>
}
export interface SlashCommand {
    data: any;
    execute: EventExecutor<Events.InteractionCreate>
}

export interface BaseContext {
    commands: SlashCommand[];
    events?: EventHandler;
}