import { EmbedBuilder, TextChannel } from "discord.js";
import { LfgManager } from "./lfg-manager";
import { getLfgServerConfig } from "./server-config";
import client from "../main";
import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { getLocalizedString } from "./locale-map";
import LfgThreadManager from "./lfg-thread-manager";

type LFG = NormalLfg | LongTermLfg | RegularLfg;

const createListEmbed = (type: "NORMAL" | "LONG-TERM" | "REGULAR", list: LFG[]): EmbedBuilder => {
    const builder = new EmbedBuilder();
    let field = "";

    if (type == "NORMAL") {
        builder.setTitle(getLocalizedString("default", "normalLfg"));
        list.map((lfg) => {
            const timestamp = `${Math.floor((lfg as NormalLfg).timestamp / 1000)}`;
            const thread = LfgThreadManager.instance.getNormalThread(lfg.id);
            const url = `https://discord.com/channels/${lfg.guildID}/${thread.threadID}`;
            field += `[${lfg.id} [${lfg.activityName}]](${url}) <t:${timestamp}:F> (<t:${timestamp}:R>)\n`;
            field += `${lfg.description}\n\n`;
        });
    } else if (type == "LONG-TERM") {
        builder.setTitle(getLocalizedString("default", "longTermLfg"));
        list.map((lfg) => {
            const timestamp = `${Math.floor((lfg as LongTermLfg).timestamp / 1000)}`;
            const thread = LfgThreadManager.instance.getLongTermThread(lfg.id);
            const url = `https://discord.com/channels/${lfg.guildID}/${thread.threadID}`;
            field += `[${lfg.id} [${lfg.activityName}]](${url}) <t:${timestamp}:F> (<t:${timestamp}:R>)\n`;
            field += `${lfg.description}\n\n`;
        });
    } else {
        builder.setTitle(getLocalizedString("default", "regularLfg"));
        list.map((lfg) => {
            const thread = LfgThreadManager.instance.getRegularThread(lfg.id);
            const url = `https://discord.com/channels/${lfg.guildID}/${thread.threadID}`;
            field += `[${lfg.id} [${lfg.activityName}]](${url})\n`;
            field += `${lfg.description}\n\n`;
        });
    }

    if (field == "") {
        field = "None";
    }

    builder.setDescription(field);

    return builder;
};

const refreshLfgList = async (guildID: string, type: "NORMAL" | "LONG-TERM" | "REGULAR") => {
    const serverConfigs = getLfgServerConfig(guildID);
    if (!serverConfigs) {
        return;
    }

    let lfgList;
    let channelID;
    if (type == "NORMAL") {
        if (!serverConfigs.normalLfgListChannel) {
            return;
        }
        channelID = serverConfigs.normalLfgListChannel;
        lfgList = LfgManager.instance.getAllNormalLfg();
    } else if (type == "LONG-TERM") {
        if (!serverConfigs.longTermLfgListChannel) {
            return;
        }
        channelID = serverConfigs.longTermLfgListChannel;
        lfgList = LfgManager.instance.getAllLongTermLfg();
    } else {
        if (!serverConfigs.regularLfgListChannel) {
            return;
        }
        channelID = serverConfigs.regularLfgListChannel;
        lfgList = LfgManager.instance.getAllRegularLfg();
    }

    const channel = (await client.channels.fetch(channelID)) as TextChannel;
    if (!channel) {
        return;
    }

    const embed = createListEmbed(type, lfgList);

    const messages = await channel.messages.fetch();

    for (const message of messages.values()) {
        await message.delete();
    }

    await channel.send({
        embeds: [embed]
    });
};

export default refreshLfgList;
