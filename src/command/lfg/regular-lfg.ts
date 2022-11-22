import { ChatInputCommandInteraction, ThreadChannel } from "discord.js";
import { ComponentType } from "discord-api-types/v10";
import { LfgSubCommandExecutor, LfgSubCommandExecutors, LfgSubCommandIdExecutor } from "../lfg";
import {
    createActivitySelectActionRow,
    createActivitySelectEmbed,
    createDescriptionInputEmbed,
    getLocale
} from "./share";
import { getLocalizedString } from "../../lfg/locale-map";
import { LfgManager } from "../../lfg/lfg-manager";
import { RegularLfgThread } from "../../db/entity/lfg-thread";
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
        userName: interaction.user.username,
        userTag: interaction.user.tag
    }, {
        activityName: activityAwaited.values[0],
        description,
        guildID: interaction.guild.id
    });

    await activityAwaited.editReply({
        content: `${getLocalizedString(locale, "lfgCreationCompleteMessage")} (ID: ${createdLfg.id})`
    });

    const messageCreatingMessage = await activityAwaited.channel.send({
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

        await messageCreatingMessage.delete();
        const lfgMessage = await messageCreatingMessage.channel.send({
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

const doGetInfo: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const doDelete: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

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
