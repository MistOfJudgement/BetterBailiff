import {
    SharedNameAndDescription,
    SharedSlashCommandOptions,
    SlashCommandBuilder,
    ToAPIApplicationCommandOptions
} from "@discordjs/builders";
import {BaseInteraction, Collection, Snowflake} from "discord.js";
import {ClientEvents, Events} from "discord.js/typings";
export type SupportedEvents =
    | Events.InteractionCreate
    | Events.MessageCreate
    | Events.MessagePollVoteAdd
    | Events.MessagePollVoteRemove
export type EventExecutor = (...args: any[]) => Promise<void>
export type InteractionExecutor = (interaction: BaseInteraction) => Promise<void>
export class EventHandler extends Collection<SupportedEvents, EventExecutor>{
    // events: Collection<SupportedEvents, EventExecutor> = new Collection<SupportedEvents, EventExecutor>();
    constructor(events: {[key in SupportedEvents] +?: EventExecutor}) {
        /// @ts-ignore
        super();

        for (const _key in events) {
            const key = _key as SupportedEvents;
            this.set(key, events[key]);
        }
    }
}
export interface SlashCommand {
    data: any & {toJSON: () => string};
    execute: InteractionExecutor;
}

export interface GuildContext<ContextData>{
    name: string;
    guilds: Collection<Snowflake, ContextData>;
    commands: Collection<string, SlashCommand>;
    events: EventHandler;

}