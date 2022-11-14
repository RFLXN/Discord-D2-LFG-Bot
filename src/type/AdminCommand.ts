import { ChatInputCommandInteraction } from "discord.js";

interface AdminCommandExecuteResult {
    success: boolean,
    msg: string;
}

interface AdminCommand {
    name: string;
    exec: (interaction: ChatInputCommandInteraction, value?: string) =>
    AdminCommandExecuteResult | Promise<AdminCommandExecuteResult>;
}

export default AdminCommand;
