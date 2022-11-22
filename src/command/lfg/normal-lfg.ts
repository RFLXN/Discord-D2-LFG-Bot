import { ChatInputCommandInteraction, ThreadChannel } from "discord.js";
import { ComponentType } from "discord-api-types/v10";
import moment from "moment";
import { LfgSubCommandExecutor, LfgSubCommandExecutors, LfgSubCommandIdExecutor } from "../lfg";
import {
    createActivitySelectActionRow,
    createActivitySelectEmbed,
    createLfgDataModal,
    flattenModalResponseComponent,
    getLocale
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

    const createdLfg = await LfgManager.instance.createNormalLfg({
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

    await modalMessage.edit({
        content: `${getLocalizedString(locale, "lfgCreationCompleteMessage")} (ID: ${createdLfg.id})`
    });

    const messageCreatingMessage = await modalMessage.channel.send({
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

        await messageCreatingMessage.delete();
        const lfgMessage = await messageCreatingMessage.channel.send({
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

const doGetInfo: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const doDelete: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const doEdit: LfgSubCommandIdExecutor = async (interaction: ChatInputCommandInteraction, lfgId: number) => {

};

const normalLfgExecutors: LfgSubCommandExecutors = {
    create: doCreate,
    getInfo: doGetInfo,
    delete: doDelete,
    edit: doEdit
};

export default normalLfgExecutors;
