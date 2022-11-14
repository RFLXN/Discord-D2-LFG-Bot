import { ChatInputCommandInteraction, Client, Interaction } from "discord.js";
import { registerCommands } from "./command-register";
import sqliteInit from "./db/sqlite";
import index from "./command";
import { connectDB } from "./db/typeorm";
import { loadStarters } from "./lfg/regular-lfg-starter";
import { LfgManager } from "./lfg/lfg-manager";
import { rest } from "./main";
import { loadActivityMap } from "./lfg/activity-map";
import { loadLfgLocaleMap } from "./lfg/locale-map";
import appleLfgEventHandlers from "./lfg/event-handler";
import { LfgUserManager } from "./lfg/lfg-user-manager";

const onReady = async (client: Client<true>) => {
    console.log(`Bot Logged in Discord. (Tag: ${client.user.tag} / ID: ${client.user.id})`);
    await registerCommands(client, rest);
    await sqliteInit();
    await connectDB();
    await loadStarters();
    await LfgManager.instance.loadLfg();
    await LfgUserManager.instance.loadUsers();
    await loadActivityMap();
    await loadLfgLocaleMap();
    appleLfgEventHandlers();
};

const onInteractionCreate = async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const i = interaction as ChatInputCommandInteraction;
        const targetCmd = index.find((cmd) => cmd.data.name.toLowerCase() == i.commandName.toLowerCase());
        if (targetCmd) {
            try {
                const start = new Date();
                console.log(`Executing Command. (Name: ${targetCmd.data.name} / ID: ${interaction.id})`);
                await targetCmd.exec(i);
                const end = new Date();
                console.log(`Command Executed in ${end.valueOf() - start.valueOf()} ms. `
                    + `(Name: ${targetCmd.data.name} / ID: ${interaction.id})`);
            } catch (e) {
                console.error(`Failed to Execute Command (Name: ${targetCmd.data.name} / ID: ${interaction.id})`);
                console.error(e);
            }
        }
    }
};

export {
    onReady, onInteractionCreate
};
