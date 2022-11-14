import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField
} from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import AdminCommand from "../type/AdminCommand";
import { addStarter, deleteStarter } from "../lfg/regular-lfg-starter";
import { overrideGuildCommands } from "../command-rest-api";
import client, { rest } from "../main";

const serverAdminCommands: AdminCommand[] = [
    {
        name: "Add Regular LFG Starter",
        exec: async (interaction: ChatInputCommandInteraction, value?: string) => {
            if (!value) {
                return {
                    success: false,
                    msg: "Need Value: User ID"
                };
            }
            const result = await addStarter(value, interaction.guild.id);

            if (!result) {
                return {
                    success: false,
                    msg: `ID '${value}' is Already Regular LFG Starter.`
                };
            }

            return {
                success: true,
                msg: `ID '${value}' is Added to Regular LFG Starter.`
            };
        }
    },
    {
        name: "Delete Regular LFG Starter",
        exec: async (interaction: ChatInputCommandInteraction, value?: string) => {
            if (!value) {
                return {
                    success: false,
                    msg: "Need Value: User ID"
                };
            }

            const result = deleteStarter(value, interaction.guild.id);

            if (!result) {
                return {
                    success: false,
                    msg: `ID '${value}' is Not a Regular LFG Starter.`
                };
            }
            return {
                success: true,
                msg: `ID '${value}' is Deleted from Regular LFG Starter.`
            };
        }
    },
    {
        name: "Clear Server Slash Command",
        exec: (interaction: ChatInputCommandInteraction, value?: string) => {
            overrideGuildCommands(rest, client.application.id, interaction.guild.id, []);
            return {
                success: true,
                msg: "Clearing Guild Commands..."
            };
        }
    }
];

const createChoices = () => Array.from(
    serverAdminCommands.map((cmd) => ({
        name: cmd.name,
        value: cmd.name
    }))
);

const serverAdmin: ChatInputApplicationCommandData = {
    name: "server-admin",
    description: "Server Admin Commands",
    options: [
        {
            name: "command",
            description: "Server Admin Command",
            type: ApplicationCommandOptionType.String,
            choices: createChoices(),
            required: true
        },
        {
            name: "value",
            description: "Server Admin Command Value",
            type: ApplicationCommandOptionType.String
        }
    ]
};

const isServerAdmin = (member: GuildMember) => member.permissions.has(PermissionsBitField.Flags.Administrator);

const doServerAdmin = async (interaction: ChatInputCommandInteraction) => {
    if (!isServerAdmin(interaction.member as GuildMember)) {
        return interaction.reply({
            content: "This Command is Server Administrator Only."
        });
    }

    const cmdName = interaction.options.getString("command", true);
    const cmd = serverAdminCommands.find((c) => c.name == cmdName);

    if (!cmd) return interaction.reply({ content: `Invalid Command: ${cmdName}` });
    const result = await cmd.exec(interaction, interaction.options.getString("value", false));
    await interaction.reply({
        content: result.msg
    });
};

export { serverAdmin, doServerAdmin };