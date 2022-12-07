import {
    ActionRowBuilder,
    ActionRowModalData,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    ModalBuilder,
    SelectMenuBuilder,
    TextInputBuilder,
    TextInputModalData,
    TextInputStyle
} from "discord.js";
import { LocaleString } from "discord-api-types/v10";
import moment from "moment/moment";
import { getLocalizedString } from "../../lfg/locale-map";
import { LfgLocaleMap } from "../../type/LfgLocaleMap";
import { getActivityMap } from "../../lfg/activity-map";
import { isAdmin } from "../../bot-admin";

const getLocale = (locale?: LocaleString): keyof LfgLocaleMap => {
    if (!locale || locale == "en-US") return "default";
    return locale;
};

const createActivitySelectEmbed = (locale: keyof LfgLocaleMap, type: "create" | "edit") => {
    const embed = new EmbedBuilder();
    embed.setTitle(getLocalizedString(locale, type == "create"
        ? "activityCreateSelectionTitle" : "activityEditSelectionTitle"))
        .setDescription(getLocalizedString(locale, "activitySelectionDescription"));

    return embed;
};

const createActivitySelectActionRow = (locale: keyof LfgLocaleMap, id: string): ActionRowBuilder<SelectMenuBuilder> => {
    const row = new ActionRowBuilder<SelectMenuBuilder>();
    const activities = getActivityMap();
    const menu = new SelectMenuBuilder();

    menu.setCustomId(`activity-select-${id}`)
        .setPlaceholder(getLocalizedString(locale, "activitySelectMenuPlaceholder"))
        .addOptions(
            Array.from(activities.map((activity) => {
                let activityName = "";
                if (locale != "default") {
                    activityName = activity.localizationName[locale];
                } else {
                    activityName = activity.name;
                }

                return {
                    label: activityName,
                    description: activity.name,
                    value: activity.name
                };
            }))
        );

    row.addComponents(menu);

    return row;
};

const createLfgDataModal = (locale: keyof LfgLocaleMap, id: string, type: "create" | "edit") => {
    const modal = new ModalBuilder();

    modal.setCustomId(`lfg-modal-${id}`)
        .setTitle(getLocalizedString(locale, "modalCreateTitle"));

    const descriptionInput = new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
        .setCustomId(`lfg-modal-description-${id}`)
        .setLabel(getLocalizedString(locale, "modalDescriptionInput"))
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(80)
        .setRequired(true));

    const dateInput = new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
        .setCustomId(`lfg-modal-date-${id}`)
        .setLabel(getLocalizedString(locale, "modalDateInput"))
        .setPlaceholder(getLocalizedString(locale, "modalDateInputDescription"))
        .setMinLength(3)
        .setMaxLength(16)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true));

    modal.addComponents(descriptionInput, dateInput);

    return modal;
};

const flattenModalResponseComponent = (components: ActionRowModalData[]): TextInputModalData[] =>
    components.flatMap((component) => component.components) as TextInputModalData[];

const createDescriptionInputEmbed = (locale: keyof LfgLocaleMap, type: "create" | "edit") => {
    const embed = new EmbedBuilder();
    embed.setTitle(type == "create" ? getLocalizedString(locale, "activityCreateSelectionTitle")
        : getLocalizedString(locale, "activityEditSelectionTitle"))
        .setDescription(getLocalizedString(locale, "pleaseInputDescription"));

    return embed;
};

const createDeleteCheckButton = (id: string) => {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const yes = new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel("⭕")
        .setCustomId(`lfg-delete-check-${id}-yes`);
    const no = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel("❌")
        .setCustomId(`lfg-delete-check-${id}-no`);
    row.addComponents(yes, no);

    return row;
};

const hasDeletePermission = async (interaction: ChatInputCommandInteraction, creator: { userID: string }) => {
    if (await isAdmin(interaction.user.id)) {
        return true;
    }

    if ((interaction.member as GuildMember)?.permissions?.has("Administrator")) {
        return true;
    }

    return interaction.user.id == creator.userID;
};

const parseDate = (dateString: string) => {
    if (dateString.replaceAll("\n", "")
        .toLowerCase() == "now") {
        return new Date();
    }
    try {
        return moment(dateString, "YYYY-MM-DD HH:mm")
            .toDate();
    } catch (e) {
        return NaN;
    }
};

export {
    getLocale,
    createActivitySelectActionRow,
    createActivitySelectEmbed,
    createLfgDataModal,
    flattenModalResponseComponent,
    createDescriptionInputEmbed,
    createDeleteCheckButton,
    hasDeletePermission,
    parseDate
};
