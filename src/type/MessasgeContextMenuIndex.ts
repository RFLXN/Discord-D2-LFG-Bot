import { ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from "discord.js";

interface MessageContextMenuIndex {
    data: ContextMenuCommandBuilder,
    exec: (interaction: MessageContextMenuCommandInteraction) => Promise<unknown> | unknown;
}

export default MessageContextMenuIndex;
