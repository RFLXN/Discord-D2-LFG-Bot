import { EmbedBuilder, TextChannel } from "discord.js";
import { LfgManager } from "./lfg-manager";
import { getLfgServerConfig } from "./server-config";
import client from "../main";
import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";

type LFG = NormalLfg | LongTermLfg | RegularLfg;

const createListEmbed = (type: "NORMAL" | "LONG-TERM" | "REGULAR", list: LFG[]): EmbedBuilder => {
    const embed = new EmbedBuilder();

    // TODO: IMPLEMENT CREATE LFG LIST EMBED

    return embed;
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

// TODO: ADD THIS TO EVENT HANDLERS (WHEN EDIT AND CREATED)
export default refreshLfgList;
