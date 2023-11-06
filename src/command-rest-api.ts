import { REST, Routes } from "discord.js";
import CommandBuilder from "./type/CommandBuilder.js";

const registerGuildCommands = async (
    rest: REST,
    clientId: string,
    guildId: string,
    commands: CommandBuilder[]
) => rest.post(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
);

const registerGlobalCommands = async (
    rest: REST,
    clientId: string,
    commands: CommandBuilder[]
) => rest.post(
    Routes.applicationCommands(clientId),
    { body: commands }
);

const overrideGuildCommands = async (
    rest: REST,
    clientId: string,
    guildId: string,
    commands: CommandBuilder[]
) => rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
);

const overrideGlobalCommands = async (
    rest: REST,
    clientId: string,
    commands: CommandBuilder[]
) => rest.put(
    Routes.applicationCommands(clientId),
    { body: commands }
);

const deleteGuildCommand = async (
    rest: REST,
    clientId: string,
    guildId: string,
    commandId: string
) => rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId));

const deleteGlobalCommand = async (
    rest: REST,
    clientId: string,
    commandId: string
) => rest.delete(Routes.applicationCommand(clientId, commandId));

const resetGuildCommands = async (
    rest: REST,
    clientId: string,
    guildId: string
) => rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });

const restGlobalCommands = async (
    rest: REST,
    clientId: string
) => rest.put(Routes.applicationCommands(clientId), { body: [] });

const getGuildCommands = async (
    rest: REST,
    clientId: string,
    guildId: string
) => rest.get(Routes.applicationGuildCommands(clientId, guildId));

const getGlobalCommands = async (
    rest: REST,
    clientId: string
) => rest.get(Routes.applicationCommands(clientId));

export {
    registerGuildCommands,
    registerGlobalCommands,
    overrideGuildCommands,
    overrideGlobalCommands,
    deleteGuildCommand,
    deleteGlobalCommand,
    resetGuildCommands,
    restGlobalCommands,
    getGuildCommands,
    getGlobalCommands
};
