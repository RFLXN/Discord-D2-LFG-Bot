import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    MessageContextMenuCommandInteraction
} from "discord.js";
import { registerCommands } from "./command-register.js";
import sqliteInit from "./db/sqlite.js";
import commandIndex from "./command/index.js";
import messageContextMenuIndex from "./context-menu/index.js";
import { connectDB } from "./db/typeorm.js";
import { loadStarters } from "./lfg/regular-lfg-starter.js";
import { LfgManager } from "./lfg/lfg-manager.js";
import { rest } from "./main.js";
import { loadActivityMap } from "./lfg/activity-map.js";
import { loadLfgLocaleMap } from "./lfg/locale-map.js";
import applyEventHandlers from "./lfg/event-handler.js";
import { LfgUserManager } from "./lfg/lfg-user-manager.js";
import { loadLfgServerConfigs } from "./lfg/server-config.js";
import LfgThreadManager from "./lfg/lfg-thread-manager.js";
import { LfgMessageManager } from "./lfg/lfg-message-manager.js";
import { handleButton } from "./lfg/handle-button.js";
import collectExpiredLfg from "./lfg/expired-lfg-collector.js";
import { alertStartSoon, clearAlertedList } from "./lfg/start-soon-alert.js";
import preventThreadArchive from "./lfg/prevent-thread-archive.js";
import { doLfgAutoComplete, doLongTermLfgAutoComplete, doRegularLfgAutoComplete } from "./auto-complete/lfg.js";

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

    if (interaction.isAutocomplete()) {
        const i = interaction as AutocompleteInteraction;

        if (i.commandName == "lfg" && i.options.getSubcommand() != "create") {
            await doLfgAutoComplete(i);
        } else if (i.commandName == "regular-lfg" && i.options.getSubcommand() != "create") {
            await doRegularLfgAutoComplete(i);
        } else if (i.commandName == "long-term-lfg" && i.options.getSubcommand() != "create") {
            await doLongTermLfgAutoComplete(i);
        }
    }
};

export {
    onReady, onInteractionCreate
};
