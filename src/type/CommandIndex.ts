import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

interface ChatInputCommandIndex {
    data: SlashCommandBuilder,
    exec: (interaction: ChatInputCommandInteraction) => Promise<unknown> | unknown;
}

export default ChatInputCommandIndex;
