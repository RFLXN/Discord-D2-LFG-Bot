import { ChatInputCommandInteraction } from "discord.js";
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
    const date = lfgDateString.replaceAll("\n", "")
        .toLowerCase() == "now"
        ? new Date()
        : moment(lfgDateString, "YYYY-MM-DD HH:mm")
            .toDate();

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
