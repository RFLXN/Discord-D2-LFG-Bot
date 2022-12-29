import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    MessageContextMenuCommandInteraction
} from "discord.js";
import { registerCommands } from "./command-register";
import sqliteInit from "./db/sqlite";
import commandIndex from "./command";
import messageContextMenuIndex from "./context-menu";
import { connectDB } from "./db/typeorm";
import { loadStarters } from "./lfg/regular-lfg-starter";
import { LfgManager } from "./lfg/lfg-manager";
import { rest } from "./main";
import { loadActivityMap } from "./lfg/activity-map";
import { loadLfgLocaleMap } from "./lfg/locale-map";
import applyEventHandlers from "./lfg/event-handler";
import { LfgUserManager } from "./lfg/lfg-user-manager";
import { loadLfgServerConfigs } from "./lfg/server-config";
import LfgThreadManager from "./lfg/lfg-thread-manager";
import { LfgMessageManager } from "./lfg/lfg-message-manager";
import { handleButton } from "./lfg/handle-button";
import collectExpiredLfg from "./lfg/expired-lfg-collector";
import { alertStartSoon, clearAlertedList } from "./lfg/start-soon-alert";
import preventThreadArchive from "./lfg/prevent-thread-archive";

const onReady = async (client: Client<true>) => {
    console.log(`Bot Logged in Discord. (Tag: ${client.user.tag} / ID: ${client.user.id})`);
    await registerCommands(client, rest);
    await sqliteInit();
    await connectDB();
    await loadStarters();
    await LfgManager.instance.loadLfg();
    await LfgUserManager.instance.loadUsers();
    await LfgThreadManager.instance.loadThreads();
    await LfgMessageManager.instance.loadMessages();
    await loadActivityMap();
    await loadLfgLocaleMap();
    await loadLfgServerConfigs();
    applyEventHandlers();

    // Collect Expired LFG Every 5 Minutes
    setInterval(() => {
        try {
            collectExpiredLfg();
        } catch (e) {
            console.error(e);
        }
    }, 1000 * 60 * 10);

    // Check Start Soon LFG Every Minute
    setInterval(() => {
        try {
            alertStartSoon();
        } catch (e) {
            console.error(e);
        }
    }, 1000 * 60);

    // Clear Altered List Every Hour
    setInterval(() => {
        try {
            clearAlertedList();
        } catch (e) {
            console.error(e);
        }
    }, 1000 * 60 * 60);

    // Send Message for Prevent Thread Archiving Every Day
    setInterval(() => {
        try {
            preventThreadArchive();
        } catch (e) {
            console.error(e);
        }
    }, 1000 * 60 * 60 * 24);
};

const onInteractionCreate = async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const i = interaction as ChatInputCommandInteraction;
        const targetCmd = commandIndex.find((cmd) => cmd.data.name.toLowerCase() == i.commandName.toLowerCase());
        if (targetCmd) {
            try {
                const start = new Date();
                console.log(`Executing Command. (Name: ${targetCmd.data.name} / ID: ${interaction.id})`);
                await targetCmd.exec(i);
                const end = new Date();
                console.log(`Command Executed in ${end.valueOf() - start.valueOf()} ms. `
                    + `(Name: ${targetCmd.data.name} / ID: ${i.id})`);
            } catch (e) {
                console.error(`Failed to Execute Command (Name: ${targetCmd.data.name} / ID: ${i.id})`);
                console.error(e);
            }
        }

        return;
    }

    if (interaction.isMessageContextMenuCommand()) {
        const i = interaction as MessageContextMenuCommandInteraction;
        const targetMenu = messageContextMenuIndex
            .find((menu) => menu.data.name.toLowerCase() == i.commandName.toLowerCase());
        if (targetMenu) {
            try {
                const start = new Date();
                await targetMenu.exec(i);
                const end = new Date();
                console.log(`Message Context Menu Executed in ${end.valueOf() - start.valueOf()} ms. `
                    + `(Name: ${targetMenu.data.name} / ID: ${i.id})`);
            } catch (e) {
                console.error(`Failed to Execute Message Context Menu (Name: ${targetMenu.data.name} / ID: ${i.id})`);
                console.error(e);
            }
        }

        return;
    }

    if (interaction.isButton()) {
        const i = interaction as ButtonInteraction;

        if (i.customId.startsWith("lfgmsgbtn")) {
            try {
                const start = new Date();
                console.log(`Executing Button Interaction. (${interaction.customId} / ${interaction.id})`);
                await handleButton(i);
                const end = new Date();
                console.log(`Button Interaction Executed in ${end.valueOf() - start.valueOf()} ms. `
                    + `(${interaction.customId} / ${interaction.id})`);
            } catch (e) {
                console.error(`Failed to Execute Button Interaction (${interaction.customId} / ${interaction.id})`);
                console.error(e);
            }
        }
    }
};

export {
    onReady, onInteractionCreate
};
