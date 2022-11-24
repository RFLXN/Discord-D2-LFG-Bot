import { ButtonInteraction, ChatInputCommandInteraction, ThreadChannel } from "discord.js";
import { ComponentType } from "discord-api-types/v10";
import moment from "moment/moment";
import { LfgSubCommandExecutor, LfgSubCommandExecutors, LfgSubCommandIdExecutor } from "../lfg";
import {
    createActivitySelectActionRow,
    createActivitySelectEmbed,
    createDeleteCheckButton,
    createLfgDataModal,
    flattenModalResponseComponent,
    getLocale,
    hasDeletePermission
} from "./share";
import { getLocalizedString } from "../../lfg/locale-map";
import { LfgManager } from "../../lfg/lfg-manager";
import { LongTermLfgThread } from "../../db/entity/lfg-thread";
import { LfgUserManager } from "../../lfg/lfg-user-manager";
import { LfgMessageManager } from "../../lfg/lfg-message-manager";
import LfgThreadManager from "../../lfg/lfg-thread-manager";

const doCreate: LfgSubCommandExecutor = async (interaction: ChatInputCommandInteraction) => {
    const locale = getLocale(interaction.locale);

    const activitySelectMessage = await interaction.reply({
        embeds: [createActivitySelectEmbed(locale, "create")],
        components: [createActivitySelectActionRow(locale, interaction.id)],
        fetchReply: true
    });

    const activityAwaited = await activitySelectMessage.awaitMessageComponent<ComponentType.SelectMenu>({
        filter: (collected) => collected.customId == `activity-select-${interaction.id}`
            && collected.user.id == interaction.user.id,
        time: 1000 * 60 * 3,
        dispose: true
    });

    await activitySelectMessage.delete();

    await activityAwaited.showModal(createLfgDataModal(locale, interaction.id, "create"));

    const modalAwaited = await activityAwaited.awaitModalSubmit({
        time: 1000 * 60 * 3,
        dispose: true
    });

    const flatModalComponents = flattenModalResponseComponent(modalAwaited.components);
    const description = flatModalComponents.find((component) =>
        component.customId == `lfg-modal-description-${interaction.id}`).value;
    const lfgDateString = flatModalComponents.find((component) =>
        component.customId == `lfg-modal-date-${interaction.id}`).value;
    let date;

    if (lfgDateString.replaceAll("\n", "")
        .toLowerCase() == "now") {
        date = new Date();
    } else {
        try {
            date = moment(lfgDateString, "YYYY-MM-DD HH:mm")
                .toDate();
        } catch (e) {
            await modalAwaited.reply({
                content: `Error: '${lfgDateString.replaceAll("\n", "")}' is Invalid Format.`
            });
            return;
        }
    }

    const modalMessage = await modalAwaited.reply({
        content: getLocalizedString(locale, "waitingLfgCreationMessage"),
        fetchReply: true
    });

    const createdLfg = await LfgManager.instance.createLongTermLfg({
        guildID: interaction.guild.id,
        userID: interaction.user.id,
        userName: interaction.user.username,
        userTag: interaction.user.tag
    }, {
        activityName: activityAwaited.values[0],
        date,
        description,
        guildID: interaction.guild.id
    });

    modalMessage.edit({
        content: `${getLocalizedString(locale, "lfgCreationCompleteMessage")} (ID: ${createdLfg.id})`
    });

    const messageCreatingMessage = modalMessage.channel.send({
        content: "Creating Info Message... Please Wait."
    });

    const afterCreatedListener = async (thread: LongTermLfgThread, real: ThreadChannel) => {
        console.log(thread);
        console.log(createdLfg);
        if (thread.lfg.id != createdLfg.id) return;

        const users = LfgUserManager.instance.getLongTermUsers(createdLfg.id);
        const embed = LfgMessageManager.instance.createMessageEmbed({
            type: "LONG-TERM",
            lfg: createdLfg,
            users,
            thread,
            locale
        });
        const buttons = LfgMessageManager.instance.createMessageButton("LONG-TERM", createdLfg.id, locale);

        console.log(messageCreatingMessage);

        await (await messageCreatingMessage).delete();
        const lfgMessage = await (await messageCreatingMessage).channel.send({
            embeds: [embed],
            components: [buttons]
        });

        await LfgMessageManager.instance.createLongTermMessage({
            type: "NORMAL",
            guildID: lfgMessage.guild.id,
            channelID: lfgMessage.channel.isThread()
                ? lfgMessage.channel.parent.id : lfgMessage.channel.id,
            messageID: lfgMessage.id,
            lfgID: createdLfg.id,
            threadID: lfgMessage.channel.isThread()
                ? lfgMessage.channel.id : undefined
        });

        LfgThreadManager.instance.typedRemoveListener("newLongTermThread", afterCreatedListener);
    };

    LfgThreadManager.instance.typedOn("newLongTermThread", afterCreatedListener);
};

const doGetInfo: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgID: number) => {
    const locale = getLocale(interaction.locale);
    const lfg = LfgManager.instance.getLongTermLfg(lfgID);

    if (!lfg) {
        await interaction.reply({
            content: getLocalizedString(locale, "invalidLfg"),
            ephemeral: true
        });
    }

    const messageManager = LfgMessageManager.instance;
    const users = LfgUserManager.instance.getLongTermUsers(lfgID);
    const thread = LfgThreadManager.instance.getLongTermThread(lfgID);

    const embed = messageManager.createMessageEmbed({
        lfg,
        locale,
        users,
        thread,
        type: "LONG-TERM"
    });
    const button = messageManager.createMessageButton("LONG-TERM", lfgID, locale);

    const message = await interaction.reply({
        embeds: [embed],
        components: [button],
        fetchReply: true
    });

    await messageManager.createLongTermMessage({
        type: "NORMAL",
        guildID: message.guild.id,
        channelID: message.channel.isThread()
            ? message.channel.parent.id : message.channel.id,
        messageID: message.id,
        lfgID,
        threadID: message.channel.isThread()
            ? message.channel.id : undefined
    });
};

const doDelete: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgID: number) => {
    const locale = getLocale(interaction.locale);
    const lfg = LfgManager.instance.getLongTermLfg(lfgID);

    if (!lfg) {
        await interaction.reply({
            content: getLocalizedString(locale, "invalidLfg"),
            ephemeral: true
        });
        return;
    }

    const creator = LfgUserManager.instance.getLongTermUsers(lfgID)
        .find((user) => user.state == "CREATOR");

    const permission = await hasDeletePermission(interaction, creator);

    if (!permission) {
        await interaction.reply({
            content: getLocalizedString(locale, "needPermissionToDeleteLfg"),
            ephemeral: true
        });
        return;
    }

    const checkMessage = await interaction.reply({
        content: `${getLocalizedString(locale, "checkDeletion")} (ID: ${lfgID})`,
        fetchReply: true,
        components: [createDeleteCheckButton(interaction.id)]
    });

    const clickedButton = await checkMessage.awaitMessageComponent<ComponentType.Button>({
        filter: (i: ButtonInteraction) => i.user.id == interaction.user.id
            && i.customId.startsWith(`lfg-delete-check-${interaction.id}-`),
        time: 1000 * 60 * 3
    });

    await checkMessage.delete();

    if (clickedButton.customId.endsWith("no")) {
        await clickedButton.reply({
            content: `${getLocalizedString(locale, "cancelDeletion")}`
        });
        return;
    }

    const result = LfgManager.instance.deleteLongTermLfg(lfgID);

    if (result) {
        await clickedButton.reply({
            content: `${getLocalizedString(locale, "lfgDeleted")} (ID: ${lfgID})`
        });
    } else {
        await clickedButton.reply({
            content: `${getLocalizedString(locale, "failedToDeleteLfg")} (ID: ${lfgID})`
        });
    }
};

const doEdit: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const longTermLfgExecutors: LfgSubCommandExecutors = {
    create: doCreate,
    getInfo: doGetInfo,
    delete: doDelete,
    edit: doEdit
};

export default longTermLfgExecutors;
