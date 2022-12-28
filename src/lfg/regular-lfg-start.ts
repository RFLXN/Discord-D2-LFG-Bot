import { EmbedBuilder } from "discord.js";
import { LfgManager } from "./lfg-manager";
import { LfgUserManager } from "./lfg-user-manager";
import { RegularLfgUser } from "../db/entity/lfg-user";
import { RegularLfg } from "../db/entity/lfg";
import { LfgLocaleMap } from "../type/LfgLocaleMap";
import { getLocalizedString } from "./locale-map";
import LfgThreadManager from "./lfg-thread-manager";

const createEmbed = (lfg: RegularLfg, users: RegularLfgUser[], locale: keyof LfgLocaleMap) => {
    const embed = new EmbedBuilder();

    let userField = "";
    users.map((user) => {
        userField += `${user.userName} (${user.userTag})\n`;
    });

    embed.setTitle(`${getLocalizedString(locale, "startRegularLfg")} (LFG ID: ${lfg.id})`)
        .setDescription(`${getLocalizedString(locale, "datetime")}<t:${Math.floor((new Date().valueOf()) / 1000)}:F>`)
        .addFields({
            name: getLocalizedString(locale, "startedRegularLfgDecidedUsers"),
            value: userField
        });

    return embed;
};

const createMentionMessage = (users: RegularLfgUser[]) => {
    let msg = "";
    users.map((user) => {
        msg += `<@${user.userID}> `;
    });

    return msg;
};

const startRegularLfg = async (lfgID: number, locale: keyof LfgLocaleMap): Promise<boolean> => {
    const lfg = LfgManager.instance.getRegularLfg(lfgID);
    const users = LfgUserManager.instance.getRegularUsers(lfgID)
        .sort((a, b) => a.timestamp - b.timestamp);
    const decidedUsers = users.filter((user) => user.state == "JOIN")
        .sort((a, b) => a.timestamp - b.timestamp);

    if (decidedUsers.length <= 0) {
        return false;
    }

    const thread = await LfgThreadManager.instance.getRealRegularThread(lfgID);

    const embed = createEmbed(lfg, decidedUsers, locale);

    await thread.send({
        embeds: [embed]
    });

    await thread.send({
        content: createMentionMessage(decidedUsers)
    });

    return true;
};

export default startRegularLfg;
