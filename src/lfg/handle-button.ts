import { ButtonInteraction } from "discord.js";
import { LfgUserManager } from "./lfg-user-manager.js";
import {
    LongTermLfgUserCreateOption,
    NormalLfgUserCreateOption,
    RegularLfgUserCreateOption
} from "../type/LfgUserCreateOption.js";
import { getLocale } from "../command/lfg/share.js";
import { getLocalizedString } from "./locale-map.js";
import LfgThreadManager from "./lfg-thread-manager.js";
import { LfgMessageManager } from "./lfg-message-manager.js";

type LfgAction = "join" | "alter" | "leave";
type LfgType = "normal" | "longterm" | "regular";

type LfgUserCreateOption = NormalLfgUserCreateOption | LongTermLfgUserCreateOption | RegularLfgUserCreateOption;

const createUserFromInteraction = (interaction: ButtonInteraction, lfgID: number): LfgUserCreateOption => ({
    userID: interaction.user.id,
    userName: interaction.user.username,
    userTag: interaction.user.tag,
    lfgID
});

const doNormal = async (interaction: ButtonInteraction, lfgID: number, action: LfgAction) => {
    const userManager = LfgUserManager.instance;
    const threadManager = LfgThreadManager.instance;
    const locale = getLocale(interaction.locale);

    if (action == "leave") {
        const result = await userManager.leaveNormalUser(lfgID, interaction.user.id);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "notJoined")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "leaved")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendNormalThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Leave");
    }

    const user = createUserFromInteraction(interaction, lfgID);
    if (action == "join") {
        const result = await userManager.joinNormalUser(user);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "alreadyJoined")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "joined")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendNormalThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Join");
    } else if (action == "alter") {
        const result = await userManager.alterNormalUser(user);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "alreadyAltered")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "altered")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendNormalThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Alter");
    }

    await LfgMessageManager.instance.refreshNormalMessageUser(lfgID);
};

const doLongTerm = async (interaction: ButtonInteraction, lfgID: number, action: LfgAction) => {
    const userManager = LfgUserManager.instance;
    const threadManager = LfgThreadManager.instance;
    const locale = getLocale(interaction.locale);

    if (action == "leave") {
        const result = await userManager.leaveLongTermUser(lfgID, interaction.user.id);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "notJoined")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "leaved")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendLongTermThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Leave");
    }

    const user = createUserFromInteraction(interaction, lfgID);
    if (action == "join") {
        const result = await userManager.joinLongTermUser(user);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "alreadyJoined")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "joined")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendLongTermThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Join");
    } else if (action == "alter") {
        const result = await userManager.alterLongTermUser(user);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "alreadyAltered")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "altered")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendLongTermThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Alter");
    }

    await LfgMessageManager.instance.refreshLongTermMessageUser(lfgID);
};

const doRegular = async (interaction: ButtonInteraction, lfgID: number, action: LfgAction) => {
    const userManager = LfgUserManager.instance;
    const threadManager = LfgThreadManager.instance;
    const locale = getLocale(interaction.locale);

    if (action == "leave") {
        const result = await userManager.leaveRegularUser(lfgID, interaction.user.id);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "notJoined")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "leaved")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendRegularThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Leave");
    }

    const user = createUserFromInteraction(interaction, lfgID);
    if (action == "join") {
        const result = await userManager.joinRegularUser(user);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "alreadyJoined")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "joined")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendRegularThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Join");
    } else if (action == "alter") {
        const result = await userManager.alterRegularUser(user);

        if (!result) {
            return interaction.reply({
                content: `${getLocalizedString(locale, "alreadyAltered")} (ID: ${lfgID})`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${getLocalizedString(locale, "altered")} (ID: ${lfgID})`,
            ephemeral: true
        });

        await threadManager.sendRegularThreadMessage(lfgID, {
            id: interaction.user.id,
            name: interaction.user.username
        }, "Alter");
    }

    await LfgMessageManager.instance.refreshRegularMessageUser(lfgID);
};

const handleButton = async (interaction: ButtonInteraction) => {
    const token = interaction.customId.replace("lfgmsgbtn-", "")
        .split("-");
    const type = token[0] as LfgType;
    const lfgID = Number(token[1]);
    const action = token[2] as LfgAction;

    if (type == "normal") {
        await doNormal(interaction, lfgID, action);
    } else if (type == "longterm") {
        await doLongTerm(interaction, lfgID, action);
    } else {
        await doRegular(interaction, lfgID, action);
    }
};

export { handleButton };
