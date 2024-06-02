import {SlashCommandBuilder} from "@discordjs/builders";
import {
    BaseGuildTextChannel,
    CacheType,
    ChatInputCommandInteraction, ClientEvents,
    Collection, Events, GuildChannel, GuildMember, GuildTextBasedChannel,
    Poll, PollAnswer,
    PollData,
    RepliableInteraction,
    Snowflake
} from "discord.js";
import {EventExecutor, EventHandler, GuildContext, SlashCommand} from "../SlashCommand";
import { baseLogger, logMethodCalls } from "../logging";

const logger = baseLogger.child({context: "Clocktower"});
interface ClocktowerSession {
    guildId: Snowflake
    roleId?: Snowflake;
    gameState: "idle" | "active";
    storyteller?: Snowflake;
    players: Snowflake[];
    poll?: Poll;
}
const joinPollData : PollData = {
    allowMultiselect: false,
    answers: [{
        text: "Join Clocktower game",
        emoji: "🕰️"
    }],
    duration: 1,
    question: {text: "Join Clocktower game"}
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
            sessions.set(guildId, {gameState: "idle", players: [], guildId:guildId, roleId:roleId});
        } else {
            sessions.get(guildId)!.roleId = roleId;
        }
        logger.info(`Clocktower role set to ${roleId} in guild ${guildId}`);
        await interaction.reply({
            content: `Clocktower role set to <@&${roleId}>`
        });
    }
}

export const ClocktowerStart: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("clocktowerstart")
        .setDescription("Start a game of Clocktower")
        .setDMPermission(false),

    execute: async (interaction) => {
        if(!interaction.isChatInputCommand()) return;
        const guildId = interaction.guildId;
        if (!sessions.has(guildId)) {
            await interaction.reply({
                content: "No Clocktower role set for this server"
            });
            return;
        }
        const session = sessions.get(guildId)!;
        if (session.gameState === "active") {
            await interaction.reply({
                content: "A game of Clocktower is already active"
            });
            return;
        }
        session.gameState = "active";
        session.storyteller = interaction.user.id;
        session.players = [];
        const channel = interaction.channel as BaseGuildTextChannel;
        await channel.send({
            poll: joinPollData
        }).then(poll => {
            session.poll = poll.poll;
        }).catch(logger.error)
        await interaction.reply({
            content: "Clocktower game started",
            ephemeral: true
        });
    }
}
function isRelevantPollEvent(pollAnswer: PollAnswer, userID: Snowflake) : boolean {
    logger.info(JSON.stringify({
        guildId: pollAnswer.poll.message.guildId,
        pollId: pollAnswer.poll.message.id,
        userId: userID,
        gameState: sessions.get(pollAnswer.poll.message.guildId)?.gameState,
        savedPollId: sessions.get(pollAnswer.poll.message.guildId)?.poll?.message.id
    }))
    const guildId = pollAnswer.poll.message.guildId;
    if (!sessions.has(guildId)) return false;
    const session = sessions.get(guildId)!;
    if (session.gameState !== "active") return false;

    if(pollAnswer.poll.message.id !== session.poll?.message.id) return false;
    const user = pollAnswer.poll.message.guild.members.cache.get(userID) as GuildMember;
    logger.info(`User ${user.id} found in guild ${guildId}`)
    if (!user) {
        logger.error(`User ${userID} not found in guild ${guildId}`);
        return false;
    }
    return true;
}
export const ClocktowerContext: GuildContext<ClocktowerSession> = {
    name: "Clocktower",
    guilds: sessions,
    commands: new Collection<string, SlashCommand>([
        [ClocktowerSetup.data.name, ClocktowerSetup],
        [ClocktowerStart.data.name, ClocktowerStart]
    ]),
    events: new EventHandler({
        [Events.MessagePollVoteAdd]: async (pollAnswer: PollAnswer, userID: Snowflake)  => {
            logger.info(`Poll answer received from ${userID} in guild ${pollAnswer.poll.message.guildId}`);
            if (!isRelevantPollEvent(pollAnswer, userID)) return;
            logger.info(`Relevant answer received from ${userID} in guild ${pollAnswer.poll.message.guildId}`)
            const guildId = pollAnswer.poll.message.guildId;
            const session = sessions.get(guildId)!;
            const user = pollAnswer.poll.message.guild.members.cache.get(userID) as GuildMember;
            await user.roles.add(session.roleId!)
            logger.info(`User ${userID} joined Clocktower game in guild ${guildId}`);
            session.players.push(userID);
        },
        [Events.MessagePollVoteRemove]: async (pollAnswer: PollAnswer, userID: Snowflake)  => {
            logger.info(`Poll answer removed from ${userID} in guild ${pollAnswer.poll.message.guildId}`);
            if (!isRelevantPollEvent(pollAnswer, userID)) return;
            const guildId = pollAnswer.poll.message.guildId;
            const session = sessions.get(guildId)!;
            const user = pollAnswer.poll.message.guild.members.cache.get(userID) as GuildMember;
            await user.roles.remove(session.roleId!)
            logger.info(`User ${userID} left Clocktower game in guild ${guildId}`);
            session.players = session.players.filter(player => player !== userID);
        }
    })
}
