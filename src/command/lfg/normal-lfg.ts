import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    GuildMember,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    ThreadChannel
} from "discord.js";
import { ComponentType } from "discord-api-types/v10";
import moment from "moment";
import { LfgSubCommandExecutor, LfgSubCommandExecutors, LfgSubCommandIdExecutor } from "../lfg";
import {
    createActivitySelectActionRow,
    createActivitySelectEmbed,
    createDeleteCheckButton,
    createLfgDataModal,
    flattenModalResponseComponent,
    getLocale,
    hasDeletePermission,
    parseDate
} from "./share";
import { LfgManager } from "../../lfg/lfg-manager";
import { getLocalizedString } from "../../lfg/locale-map";
import LfgThreadManager from "../../lfg/lfg-thread-manager";
import { LfgUserManager } from "../../lfg/lfg-user-manager";
import { LfgMessageManager } from "../../lfg/lfg-message-manager";
import { NormalLfgThread } from "../../db/entity/lfg-thread";

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
            if (lfgDateString.length <= 5) {
                const raw = moment(lfgDateString, "HH:mm");
                if (!raw.isValid()) throw new Error();

                const now = new Date();
                date = raw.toDate();

                if (now.valueOf() > date.valueOf()) {
                    date = new Date(date.valueOf() + (1000 * 60 * 60 * 24));
                }
            } else {
                const raw = moment(lfgDateString, "YYYY-MM-DD HH:mm");
                if (!raw.isValid()) throw new Error();
                date = raw.toDate();
            }
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

    const createdLfg = await LfgManager.instance.createNormalLfg({
        guildID: interaction.guild.id,
        userID: interaction.user.id,
        userName: (interaction.member as GuildMember).displayName,
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

    const afterCreatedListener = async (thread: NormalLfgThread, real: ThreadChannel) => {
        if (thread.lfg.id != createdLfg.id) return;

        const users = LfgUserManager.instance.getNormalUsers(createdLfg.id);
        const embed = LfgMessageManager.instance.createMessageEmbed({
            type: "NORMAL",
            lfg: createdLfg,
            users,
            thread,
            locale
        });
        const buttons = LfgMessageManager.instance.createMessageButton("NORMAL", createdLfg.id, locale);

        await (await messageCreatingMessage).delete();
        const lfgMessage = await (await messageCreatingMessage).channel.send({
            embeds: [embed],
            components: [buttons]
        });

        await LfgMessageManager.instance.createNormalMessage({
            type: "NORMAL",
            guildID: lfgMessage.guild.id,
            channelID: lfgMessage.channel.isThread()
                ? lfgMessage.channel.parent.id : lfgMessage.channel.id,
            messageID: lfgMessage.id,
            lfgID: createdLfg.id,
            threadID: lfgMessage.channel.isThread()
                ? lfgMessage.channel.id : undefined
        });

        LfgThreadManager.instance.typedRemoveListener("newNormalThread", afterCreatedListener);
    };

    LfgThreadManager.instance.typedOn("newNormalThread", afterCreatedListener);
};

const doGetInfo: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgID: number) => {
    const locale = getLocale(interaction.locale);
    const lfg = LfgManager.instance.getNormalLfg(lfgID);

    if (!lfg) {
        await interaction.reply({
            content: getLocalizedString(locale, "invalidLfg"),
            ephemeral: true
        });
    }

    const messageManager = LfgMessageManager.instance;
    const users = LfgUserManager.instance.getNormalUsers(lfgID);
    const thread = LfgThreadManager.instance.getNormalThread(lfgID);

    const embed = messageManager.createMessageEmbed({
        lfg,
        locale,
        users,
        thread,
        type: "NORMAL"
    });
    const button = messageManager.createMessageButton("NORMAL", lfgID, locale);

    const message = await interaction.reply({
        embeds: [embed],
        components: [button],
        fetchReply: true
    });

    await messageManager.createNormalMessage({
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
    const lfg = LfgManager.instance.getNormalLfg(lfgID);

    if (!lfg) {
        await interaction.reply({
            content: getLocalizedString(locale, "invalidLfg"),
            ephemeral: true
        });
        return;
    }

    const creator = LfgUserManager.instance.getNormalUsers(lfgID)
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

    const result = LfgManager.instance.deleteNormalLfg(lfgID);

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

const doEdit: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgID: number) => {
    const locale = getLocale(interaction.locale);
    const lfg = LfgManager.instance.getNormalLfg(lfgID);

    if (!lfg) {
        await interaction.reply({
            content: getLocalizedString(locale, "invalidLfg")
        });
        return;
    }

    const activitySelectMessage = await interaction.reply({
        fetchReply: true,
        embeds: [createActivitySelectEmbed(locale, "edit")],
        components: [createActivitySelectActionRow(locale, interaction.id)]
    });

    const activityAwaited = await activitySelectMessage.awaitMessageComponent<ComponentType.SelectMenu>({
        filter: (i: SelectMenuInteraction) =>
            i.user.id == interaction.user.id
            && i.customId == `activity-select-${interaction.id}`,
        time: 1000 * 60 * 3,
        dispose: true
    });

    await activitySelectMessage.delete();

    const activity = activityAwaited.values[0];

    const modal = await activityAwaited.showModal(createLfgDataModal(locale, interaction.id, "edit"));

    const modalAwaited = await activityAwaited.awaitModalSubmit({
        filter: (i: ModalSubmitInteraction) =>
            i.user.id == interaction.user.id
            && i.customId == `lfg-modal-${interaction.id}`,
        time: 1000 * 60 * 3,
        dispose: true
    });

    const flatComponent = flattenModalResponseComponent(modalAwaited.components);
    const description = flatComponent.find((component) =>
        component.customId == `lfg-modal-description-${interaction.id}`).value;
    const dateString = flatComponent.find((component) =>
        component.customId == `lfg-modal-date-${interaction.id}`).value;

    const date = parseDate(dateString);

    if (!(date instanceof Date) && Number.isNaN(date)) {
        await modalAwaited.reply({
            content: `Error: '${dateString.replaceAll("\n", "")}' is Invalid Format.`
        });
        return;
    }

    const result = LfgManager.instance.editNormalLfg(lfgID, {
        date: date as Date,
        description,
        activityName: activity
    });

    if (result) {
        await modalAwaited.reply({
            content: `${getLocalizedString(locale, "lfgEditCompletionMessage")} (ID: ${lfgID})`
        });
    } else {
        await modalAwaited.reply({
            content: `${getLocalizedString(locale, "lfgEditFailedMessage")} (ID: ${lfgID})`
        });
    }
};

const normalLfgExecutors: LfgSubCommandExecutors = {
    create: doCreate,
    getInfo: doGetInfo,
    delete: doDelete,
    edit: doEdit
};

export default normalLfgExecutors;
