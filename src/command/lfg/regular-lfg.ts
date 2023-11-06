import {
    ButtonInteraction, ChatInputCommandInteraction, GuildMember, ThreadChannel
} from "discord.js";
import { ComponentType } from "discord-api-types/v10";
import { LfgSubCommandExecutor, LfgSubCommandExecutors, LfgSubCommandIdExecutor } from "../lfg.js";
import {
    createActivitySelectActionRow,
    createActivitySelectEmbed,
    createDeleteCheckButton,
    createDescriptionInputEmbed,
    getLocale,
    hasDeletePermission
} from "./share.js";
import { getLocalizedString } from "../../lfg/locale-map.js";
import { LfgManager } from "../../lfg/lfg-manager.js";
import { RegularLfgThread } from "../../db/entity/lfg-thread.js";
import { LfgUserManager } from "../../lfg/lfg-user-manager.js";
import { LfgMessageManager } from "../../lfg/lfg-message-manager.js";
import LfgThreadManager from "../../lfg/lfg-thread-manager.js";

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

    await activityAwaited.reply({
        embeds: [createDescriptionInputEmbed(locale, "create")]
    });

    const descriptionAwaited = await activityAwaited.channel.awaitMessages({
        filter: (collected) => collected.author.id == interaction.user.id,
        max: 1,
        time: 1000 * 60 * 3
    });

    const description = descriptionAwaited.first().content;
    await descriptionAwaited.first()
        .delete();

    await activityAwaited.editReply({
        content: getLocalizedString(locale, "waitingLfgCreationMessage"),
        embeds: []
    });

    const createdLfg = await LfgManager.instance.createRegularLfg({
        guildID: interaction.guild.id,
        userID: interaction.user.id,
        userName: (interaction.member as GuildMember).displayName,
        userTag: interaction.user.tag
    }, {
        activityName: activityAwaited.values[0],
        description,
        guildID: interaction.guild.id
    });

    activityAwaited.editReply({
        content: `${getLocalizedString(locale, "lfgCreationCompleteMessage")} (ID: ${createdLfg.id})`
    });

    const messageCreatingMessage = activityAwaited.channel.send({
        content: "Creating Info Message... Please Wait."
    });

    const afterCreatedListener = async (thread: RegularLfgThread, real: ThreadChannel) => {
        if (thread.lfg.id != createdLfg.id) return;

        const users = LfgUserManager.instance.getRegularUsers(createdLfg.id);
        const embed = LfgMessageManager.instance.createMessageEmbed({
            type: "REGULAR",
            lfg: createdLfg,
            users,
            thread,
            locale
        });
        const buttons = LfgMessageManager.instance.createMessageButton("REGULAR", createdLfg.id, locale);

        await (await messageCreatingMessage).delete();
        const lfgMessage = await (await messageCreatingMessage).channel.send({
            embeds: [embed],
            components: [buttons]
        });

        await LfgMessageManager.instance.createRegularMessage({
            type: "NORMAL",
            guildID: lfgMessage.guild.id,
            channelID: lfgMessage.channel.isThread()
                ? lfgMessage.channel.parent.id : lfgMessage.channel.id,
            messageID: lfgMessage.id,
            lfgID: createdLfg.id,
            threadID: lfgMessage.channel.isThread()
                ? lfgMessage.channel.id : undefined
        });

        LfgThreadManager.instance.typedRemoveListener("newRegularThread", afterCreatedListener);
    };

    LfgThreadManager.instance.typedOn("newRegularThread", afterCreatedListener);
};

const doGetInfo: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgID: number) => {
    const locale = getLocale(interaction.locale);
    const lfg = LfgManager.instance.getRegularLfg(lfgID);

    if (!lfg) {
        await interaction.reply({
            content: getLocalizedString(locale, "invalidLfg"),
            ephemeral: true
        });
    }

    const messageManager = LfgMessageManager.instance;
    const users = LfgUserManager.instance.getRegularUsers(lfgID);
    const thread = LfgThreadManager.instance.getRegularThread(lfgID);

    const embed = messageManager.createMessageEmbed({
        lfg,
        locale,
        users,
        thread,
        type: "REGULAR"
    });
    const button = messageManager.createMessageButton("REGULAR", lfgID, locale);

    const message = await interaction.reply({
        embeds: [embed],
        components: [button],
        fetchReply: true
    });

    await messageManager.createRegularMessage({
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
    const lfg = LfgManager.instance.getRegularLfg(lfgID);

    if (!lfg) {
        await interaction.reply({
            content: getLocalizedString(locale, "invalidLfg"),
            ephemeral: true
        });
        return;
    }

    const creator = LfgUserManager.instance.getRegularUsers(lfgID)
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

    const result = LfgManager.instance.deleteRegularLfg(lfgID);

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

const regularLfgExecutors: LfgSubCommandExecutors = {
    create: doCreate,
    getInfo: doGetInfo,
    delete: doDelete,
    edit: doEdit
};

export default regularLfgExecutors;
