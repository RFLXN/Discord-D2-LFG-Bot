import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import AdminCommand from "../type/AdminCommand.js";
import { deleteBotAdmin, insertBotAdmin, isAdmin } from "../bot-admin.js";
import { overrideActivityMap } from "../lfg/activity-map.js";

const botAdminCommands: AdminCommand[] = [
    {
        name: "Add Bot Admin",
        exec: async (interaction: ChatInputCommandInteraction, value?: string) => {
            if (!value) {
                return {
                    success: false,
                    msg: "Need Value: User ID"
                };
            }

            try {
                await insertBotAdmin(value);
                return {
                    success: true,
                    msg: `Successfully Added '${value}' to Bot Administrator.`
                };
            } catch (e) {
                return {
                    success: false,
                    msg: `Failed to Add Bot Administrator: ${(e as Error).message}`
                };
            }
        }
    },
    {
        name: "Delete Bot Admin",
        exec: async (interaction: ChatInputCommandInteraction, value?: string) => {
            if (!value) {
                return {
                    success: false,
                    msg: "Need Value: User ID"
                };
            }

            try {
                await deleteBotAdmin(value);
                return {
                    success: true,
                    msg: `Successfully Delete '${value}' from Bot Administrator.`
                };
            } catch (e) {
                return {
                    success: false,
                    msg: `Failed Delete Bot Administrator: ${(e as Error).message}`
                };
            }
        }
    },
    {
        name: "Override LFG Activity Map",
        exec: async (interaction: ChatInputCommandInteraction, value?: string) => {
            if (!value) {
                return {
                    success: false,
                    msg: "Need Value: LFG Activity Map JSON"
                };
            }

            const result = await overrideActivityMap(value);
            if (!result) {
                return {
                    success: false,
                    msg: "Failed to Override LFG Activity Map."
                };
            }
            return {
                success: true,
                msg: "Successfully Override LFG Activity Map."
            };
        }
    }
];

const createChoices = () => Array.from(
    botAdminCommands.map((cmd, idx) => ({
        name: cmd.name,
        value: idx.toString()
    }))
);

const botAdmin: ChatInputApplicationCommandData = {
    name: "bot-admin",
    description: "Bot Admin Commands",
    options: [
        {
            name: "command",
            description: "Bot Admin Command",
            type: ApplicationCommandOptionType.String,
            choices: createChoices(),
            required: true
        },
        {
            name: "value",
            description: "Bot Admin Command Value",
            type: ApplicationCommandOptionType.String
        }
    ]
};

const doBotAdmin = async (interaction: ChatInputCommandInteraction) => {
    if (!(await isAdmin(interaction.user.id))) {
        return interaction.reply({
            content: "This Command is Bot Administrator Only."
        });
    }

    const cmdName = interaction.options.getString("command", true);
    const cmd = botAdminCommands.find((c) => c.name == cmdName);

    if (!cmd) return interaction.reply({ content: `Invalid Command: ${cmdName}` });
    const result = await cmd.exec(interaction, interaction.options.getString("value", false));
    await interaction.reply({
        content: result.msg,
        ephemeral: true
    });
};

export { botAdmin, doBotAdmin };
