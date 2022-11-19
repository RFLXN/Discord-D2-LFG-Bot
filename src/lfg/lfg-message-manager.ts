import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder
} from "discord.js";
import { LocaleString } from "discord-api-types/v10";
import { EventTypes, TypedEventEmitter } from "../util/event-emitter";
import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { LongTermLfgUser, NormalLfgUser, RegularLfgUser } from "../db/entity/lfg-user";
import { getLocalizedString } from "./locale-map";
import { getLocale } from "../command/lfg/share";
import { LongTermLfgThread, NormalLfgThread, RegularLfgThread } from "../db/entity/lfg-thread";
import { LongTermLfgMessage, NormalLfgMessage, RegularLfgMessage } from "../db/entity/lfg-message";
import { getRepository } from "../db/typeorm";
import LfgMessageCreateOption from "../type/LfgMessageCreateOption";

interface LfgMessageEvents extends EventTypes {
    newNormalMessage: [];
}

type Lfg = NormalLfg | LongTermLfg | RegularLfg;
type LfgUser = NormalLfgUser | LongTermLfgUser | RegularLfgUser;
type LfgThread = NormalLfgThread | LongTermLfgThread | RegularLfgThread;
type LfgType = "NORMAL" | "LONG-TERM" | "REGULAR";

interface LfgMessageEmbedCreateOption {
    type: LfgType
    lfg: Lfg,
    users: LfgUser[],
    thread: LfgThread,
    locale: LocaleString | "default"
}

class LfgMessageManager extends TypedEventEmitter<LfgMessageEvents> {
    private static readonly singleton = new LfgMessageManager();

    private normalMessages: NormalLfgMessage[] = [];

    private longTermMessages: LongTermLfgMessage[] = [];

    private regularMessages: RegularLfgMessage[] = [];

    private constructor() {
        super();
    }

    public static get instance() {
        return this.singleton;
    }

    public async loadMessages() {
        console.log("Loading All LFG Messages...");
        await this.loadNormalMessages();
        await this.loadLongTermMessages();
        await this.loadRegularMessages();
        console.log("Every LFG Messages Loaded.");
    }

    public createMessageEmbed(option: LfgMessageEmbedCreateOption) {
        const embed = new EmbedBuilder();
        const localeMapKey = option.locale == "default" ? "default" : getLocale(option.locale);
        let typeStr;

        if (option.type == "NORMAL") {
            typeStr = getLocalizedString(localeMapKey, "normalLfg");
        } else if (option.type == "LONG-TERM") {
            typeStr = getLocalizedString(localeMapKey, "longTermLfg");
        } else {
            typeStr = getLocalizedString(localeMapKey, "regularLfg");
        }

        const creator = option.users.find((user) => user.state == "CREATOR");

        embed.setTitle(`${typeStr}: ${option.lfg.id}`)
            .setDescription(option.lfg.description)
            .setFooter({
                text: `${getLocalizedString(localeMapKey, "creator")}: ${creator.userName} (${creator.userTag})`
            })
            .setURL(`https://discord.com/channels/${option.thread.guildID}/${option.thread.threadID}`)
            .addFields([
                {
                    name: getLocalizedString(localeMapKey, "join"),
                    value: this.createJoinString(option.users),
                    inline: false
                },
                {
                    name: getLocalizedString(localeMapKey, "alter"),
                    value: this.createAlterString(option.users),
                    inline: false
                }
            ]);

        return embed;
    }

    public createMessageButton(type: LfgType, lfgID: number, locale: LocaleString | "default") {
        const row = new ActionRowBuilder<ButtonBuilder>();
        const join = new ButtonBuilder();
        const alter = new ButtonBuilder();
        const leave = new ButtonBuilder();
        const localeMapKey = locale == "default" ? "default" : getLocale(locale);
        let typeStr = "";

        if (type == "NORMAL") {
            typeStr = "normal";
        } else if (type == "LONG-TERM") {
            typeStr = "long-term";
        } else {
            typeStr = "regular";
        }

        join.setCustomId(`lfg-${typeStr}-${lfgID}-join`)
            .setLabel(getLocalizedString(localeMapKey, "join"))
            .setStyle(ButtonStyle.Success);

        alter.setCustomId(`lfg-${typeStr}-${lfgID}-alter`)
            .setLabel(getLocalizedString(localeMapKey, "alter"))
            .setStyle(ButtonStyle.Primary);

        leave.setCustomId(`lfg-${typeStr}-${lfgID}-leave`)
            .setLabel(getLocalizedString(localeMapKey, "leave"))
            .setStyle(ButtonStyle.Danger);

        row.addComponents(join, alter, leave);

        return row;
    }

    public async createNormalMessage(option: LfgMessageCreateOption) {
        if (this.getNormalMessage(option.lfgID).length > 5) {
            this.deleteOldestNormalMessage(option.lfgID);
        }

        const result = await getRepository(NormalLfgMessage)
            .insert({
                lfg: { id: option.lfgID },
                guildID: option.guildID,
                channelID: option.channelID,
                threadID: option.channelID,
                messageID: option.messageID,
                type: option.type,
                timestamp: new Date().valueOf()
            });
        const { id } = result.identifiers[0];

        const message = await this.getNormalMessageByIdFromDB(id);
        this.normalMessages.push(message);
    }

    public async createLongTermMessage(option: LfgMessageCreateOption) {
        if (this.getLongTermMessage(option.lfgID).length > 5) {
            this.deleteOldestLongTermMessage(option.lfgID);
        }

        const result = await getRepository(LongTermLfgMessage)
            .insert({
                lfg: { id: option.lfgID },
                guildID: option.guildID,
                channelID: option.channelID,
                threadID: option.channelID,
                messageID: option.messageID,
                type: option.type,
                timestamp: new Date().valueOf()
            });
        const { id } = result.identifiers[0];

        const message = await this.getLongTermMessageByIdFromDB(id);
        this.longTermMessages.push(message);
    }

    public async createRegularMessage(option: LfgMessageCreateOption) {
        if (this.getRegularMessage(option.lfgID).length > 5) {
            this.deleteOldestRegularMessage(option.lfgID);
        }

        const result = await getRepository(RegularLfgMessage)
            .insert({
                lfg: { id: option.lfgID },
                guildID: option.guildID,
                channelID: option.channelID,
                threadID: option.channelID,
                messageID: option.messageID,
                type: option.type,
                timestamp: new Date().valueOf()
            });
        const { id } = result.identifiers[0];

        const message = await this.getRegularMessageByIdFromDB(id);
        this.regularMessages.push(message);
    }

    public getNormalThreadRootMessage(lfgID: number) {
        return this.normalMessages.find((message) => message.lfg.id == lfgID && message.type == "THREAD_ROOT");
    }

    public getLongTermThreadRootMessage(lfgID: number) {
        return this.longTermMessages.find((message) => message.lfg.id == lfgID && message.type == "THREAD_ROOT");
    }

    public getRegularThreadRootMessage(lfgID: number) {
        return this.regularMessages.find((message) => message.lfg.id == lfgID && message.type == "THREAD_ROOT");
    }

    public getNormalMessage(lfgID: number) {
        return this.normalMessages.filter((message) => message.lfg.id == lfgID && message.type == "NORMAL")
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    public getLongTermMessage(lfgID: number) {
        return this.longTermMessages.filter((message) => message.lfg.id == lfgID && message.type == "NORMAL")
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    public getRegularMessage(lfgID: number) {
        return this.regularMessages.filter((message) => message.lfg.id == lfgID && message.type == "NORMAL")
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    public deleteOldestNormalMessage(lfgID: number) {
        const sorted = this.normalMessages.filter((message) => message.lfg.id == lfgID && message.type == "NORMAL")
            .sort((a, b) => a.timestamp - b.timestamp);
        const { id } = sorted[0];
        const idx = this.normalMessages.findIndex((msg) => msg.id == id);
        this.normalMessages.splice(idx, 1);
        this.deleteNormalMessageByIdFromDB(id);
    }

    public deleteOldestLongTermMessage(lfgID: number) {
        const sorted = this.longTermMessages.filter((message) => message.lfg.id == lfgID && message.type == "NORMAL")
            .sort((a, b) => a.timestamp - b.timestamp);
        const { id } = sorted[0];
        const idx = this.longTermMessages.findIndex((msg) => msg.id == id);
        this.longTermMessages.splice(idx, 1);
        this.deleteLongTermMessageByIdFromDB(id);
    }

    public deleteOldestRegularMessage(lfgID: number) {
        const sorted = this.regularMessages.filter((message) => message.lfg.id == lfgID && message.type == "NORMAL")
            .sort((a, b) => a.timestamp - b.timestamp);
        const { id } = sorted[0];
        const idx = this.regularMessages.findIndex((msg) => msg.id == id);
        this.regularMessages.splice(idx, 1);
        this.deleteRegularMessageByIdFromDB(id);
    }

    private createJoinString(users: LfgUser[]) {
        let str = "";
        users.filter((user) => user.state == "JOIN")
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((user) => {
                str += `${user.userName} (${user.userTag})\n`;
            });
        if (str == "") {
            str = "None";
        }
        return str;
    }

    private createAlterString(users: LfgUser[]) {
        let str = "";
        users.filter((user) => user.state == "ALTER")
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((user) => {
                str += `${user.userName} (${user.userTag})\n`;
            });
        if (str == "") {
            str = "None";
        }
        return str;
    }

    private async loadNormalMessages() {
        console.log("Loading Normal LFG Messages...");
        this.normalMessages = await getRepository(NormalLfgMessage)
            .find({ relations: ["lfg"] });
        console.log(`Normal LFG Messages Loaded. Every '${this.normalMessages.length}' Messages.`);
    }

    private async loadLongTermMessages() {
        console.log("Loading Long-Term LFG Messages...");
        this.longTermMessages = await getRepository(LongTermLfgMessage)
            .find({ relations: ["lfg"] });
        console.log(`Long-Term LFG Messages Loaded. Every '${this.longTermMessages.length}' Messages.`);
    }

    private async loadRegularMessages() {
        console.log("Loading Regular LFG Messages...");
        this.regularMessages = await getRepository(RegularLfgMessage)
            .find({ relations: ["lfg"] });
        console.log(`Regular LFG Messages Loaded. Every '${this.regularMessages.length}' Messages.`);
    }

    private async getNormalMessageByIdFromDB(id: number) {
        return getRepository(NormalLfgMessage)
            .findOne({
                where: { id },
                relations: ["lfg"]
            });
    }

    private async getLongTermMessageByIdFromDB(id: number) {
        return getRepository(LongTermLfgMessage)
            .findOne({
                where: { id },
                relations: ["lfg"]
            });
    }

    private async getRegularMessageByIdFromDB(id: number) {
        return getRepository(RegularLfgMessage)
            .findOne({
                where: { id },
                relations: ["lfg"]
            });
    }

    private async deleteNormalMessageByIdFromDB(id: number) {
        await getRepository(NormalLfgMessage)
            .delete({
                id
            });
    }

    private async deleteLongTermMessageByIdFromDB(id: number) {
        await getRepository(LongTermLfgMessage)
            .delete({
                id
            });
    }

    private async deleteRegularMessageByIdFromDB(id: number) {
        await getRepository(RegularLfgMessage)
            .delete({
                id
            });
    }
}

export { LfgMessageManager };
