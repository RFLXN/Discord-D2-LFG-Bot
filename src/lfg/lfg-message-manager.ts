import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel
} from "discord.js";
import { LocaleString } from "discord-api-types/v10";
import { APIEmbed } from "discord-api-types/v9";
import { EventTypes, TypedEventEmitter } from "../util/event-emitter";
import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { LongTermLfgUser, NormalLfgUser, RegularLfgUser } from "../db/entity/lfg-user";
import { getLocalizedString, getStrings } from "./locale-map";
import { getLocale } from "../command/lfg/share";
import { LongTermLfgThread, NormalLfgThread, RegularLfgThread } from "../db/entity/lfg-thread";
import { LongTermLfgMessage, NormalLfgMessage, RegularLfgMessage } from "../db/entity/lfg-message";
import { getRepository } from "../db/typeorm";
import LfgMessageCreateOption from "../type/LfgMessageCreateOption";
import { getActivityMap } from "./activity-map";
import client from "../main";
import { LfgUserManager } from "./lfg-user-manager";
import { LfgManager } from "./lfg-manager";
import LfgThreadManager from "./lfg-thread-manager";

interface LfgMessageEvents extends EventTypes {
    newNormalMessage: [];
}

type Lfg = NormalLfg | LongTermLfg | RegularLfg;
type LfgUser = NormalLfgUser | LongTermLfgUser | RegularLfgUser;
type LfgThread = NormalLfgThread | LongTermLfgThread | RegularLfgThread;
type LfgType = "NORMAL" | "LONG-TERM" | "REGULAR";
type LfgMessage = NormalLfgMessage | LongTermLfgMessage | RegularLfgMessage;

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
        let description = "";

        if (option.type == "NORMAL") {
            typeStr = getLocalizedString(localeMapKey, "normalLfg");
        } else if (option.type == "LONG-TERM") {
            typeStr = getLocalizedString(localeMapKey, "longTermLfg");
        } else {
            typeStr = getLocalizedString(localeMapKey, "regularLfg");
        }

        const activityObj = getActivityMap()
            .find((activity) => activity.name == option.lfg.activityName);

        let activity;

        if (localeMapKey == "default") {
            activity = activityObj.name;
        } else {
            activity = activityObj.localizationName[localeMapKey];
        }

        description += `${activity}\n`;

        if (option.type == "NORMAL" || option.type == "LONG-TERM") {
            const lfg = option.lfg as NormalLfg | LongTermLfg;
            const dateString = `<t:${Math.floor(lfg.timestamp / 1000)}:F> (<t:${Math.floor(lfg.timestamp / 1000)}:R>)`;
            description += `${lfg.description}\n${dateString}`;
        } else {
            description += option.lfg.description;
        }

        const creator = option.users.find((user) => user.state == "CREATOR");

        embed.setTitle(`${typeStr}: ${option.lfg.id}`)
            .setDescription(description)
            .setFooter({
                text: `${getLocalizedString(localeMapKey, "creator")}: ${creator.userName} (${creator.userTag})`
            })
            .setURL(`https://discord.com/channels/${option.thread.guildID}/${option.thread.threadID}`)
            .addFields([
                {
                    name: `${getLocalizedString(localeMapKey, "join")}`
                        + `[${option.users.filter((u) => u.state == "JOIN").length}]`,
                    value: this.createJoinString(option.users),
                    inline: false
                },
                {
                    name: `${getLocalizedString(localeMapKey, "alter")}`
                        + `[${option.users.filter((u) => u.state == "ALTER").length}]`,
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
            typeStr = "longterm";
        } else {
            typeStr = "regular";
        }

        join.setCustomId(`lfgmsgbtn-${typeStr}-${lfgID}-join`)
            .setLabel(getLocalizedString(localeMapKey, "join"))
            .setStyle(ButtonStyle.Success);

        alter.setCustomId(`lfgmsgbtn-${typeStr}-${lfgID}-alter`)
            .setLabel(getLocalizedString(localeMapKey, "alter"))
            .setStyle(ButtonStyle.Primary);

        leave.setCustomId(`lfgmsgbtn-${typeStr}-${lfgID}-leave`)
            .setLabel(getLocalizedString(localeMapKey, "leave"))
            .setStyle(ButtonStyle.Danger);

        row.addComponents(join, alter, leave);

        return row;
    }

    public async refreshNormalMessageUser(lfgID: number) {
        const users = LfgUserManager.instance.getNormalUsers(lfgID);
        const messages = this.getNormalMessage(lfgID);
        messages.push(this.getNormalThreadRootMessage(lfgID));
        await this.refreshMessages(users, messages);
    }

    public async refreshLongTermMessageUser(lfgID: number) {
        const users = LfgUserManager.instance.getLongTermUsers(lfgID);
        const messages = this.getLongTermMessage(lfgID);
        messages.push(this.getLongTermThreadRootMessage(lfgID));
        await this.refreshMessages(users, messages);
    }

    public async refreshRegularMessageUser(lfgID: number) {
        const users = LfgUserManager.instance.getRegularUsers(lfgID);
        const messages = this.getRegularMessage(lfgID);
        messages.push(this.getRegularThreadRootMessage(lfgID));
        await this.refreshMessages(users, messages);
    }

    public async refreshNormalMessage(lfgID: number) {
        const lfg = LfgManager.instance.getNormalLfg(lfgID);
        const users = LfgUserManager.instance.getNormalUsers(lfgID);
        const thread = LfgThreadManager.instance.getNormalThread(lfgID);
        const messages = this.getNormalMessage(lfgID);
        messages.push(this.getNormalThreadRootMessage(lfgID));

        await this.refreshMessages(users, messages, {
            lfg,
            thread
        });
    }

    public async refreshLongTermMessage(lfgID: number) {
        const lfg = LfgManager.instance.getLongTermLfg(lfgID);
        const users = LfgUserManager.instance.getLongTermUsers(lfgID);
        const thread = LfgThreadManager.instance.getLongTermThread(lfgID);
        const messages = this.getLongTermMessage(lfgID);
        messages.push(this.getLongTermThreadRootMessage(lfgID));

        await this.refreshMessages(users, messages, {
            lfg,
            thread
        });
    }

    public async refreshRegularMessage(lfgID: number) {
        const lfg = LfgManager.instance.getRegularLfg(lfgID);
        const users = LfgUserManager.instance.getRegularUsers(lfgID);
        const thread = LfgThreadManager.instance.getRegularThread(lfgID);
        const messages = this.getRegularMessage(lfgID);
        messages.push(this.getRegularThreadRootMessage(lfgID));

        await this.refreshMessages(users, messages, {
            lfg,
            thread
        });
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
                threadID: option.threadID,
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
                threadID: option.threadID,
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
                threadID: option.threadID,
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

    public deleteCachedNormalMessage(lfgID: number) {
        this.normalMessages = this.normalMessages.filter((msg) => msg.lfg.id != lfgID);
    }

    public deleteCachedLongTermMessage(lfgID: number) {
        this.longTermMessages = this.longTermMessages.filter((msg) => msg.lfg.id != lfgID);
    }

    public deleteCachedRegularMessage(lfgID: number) {
        this.regularMessages = this.regularMessages.filter((msg) => msg.lfg.id != lfgID);
    }

    private async refreshMessages(
        users: LfgUser[],
        messages: LfgMessage[],
        options?: { lfg: Lfg, thread: LfgThread }
    ) {
        const channelIDs = new Set<string>();
        messages.map((message) => channelIDs.add(message.channelID));

        const guild = await client.guilds.fetch(messages[0].guildID);

        // Processing By Same Channel
        for (const channelID of channelIDs) {
            const channelMessages = messages.filter((message) => message.channelID == channelID);
            const channel = (await guild.channels.fetch(channelID)) as TextChannel;

            const threadIDs = new Set<string>();
            channelMessages.map((message) => {
                if (message.threadID) {
                    threadIDs.add(message.threadID);
                }
            });

            // Processing Thread Message By Same Thread
            for (const threadID of threadIDs) {
                const threadMessages = channelMessages.filter((message) => message.threadID == threadID);
                const thread = await channel.threads.fetch(threadID);

                for (const message of threadMessages) {
                    try {
                        const realMessage = await thread.messages.fetch(message.messageID);
                        const embed = realMessage.embeds[0];
                        const newEmbed = !options ? this.createUserRefreshedEmbed(embed, users)
                            : this.createUserRefreshedEmbed(embed, users, options);
                        await realMessage.edit({
                            embeds: [newEmbed]
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            // Processing Channel Message
            const channelOnlyMessages = channelMessages.filter((message) => !message.threadID);
            for (const message of channelOnlyMessages) {
                try {
                    const realMessage = await channel.messages.fetch(message.messageID);
                    const embed = realMessage.embeds[0];
                    const newEmbed = !options ? this.createUserRefreshedEmbed(embed, users)
                        : this.createUserRefreshedEmbed(embed, users, options);
                    await realMessage.edit({
                        embeds: [newEmbed]
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    private createUserRefreshedEmbed(originEmbed: APIEmbed, users: LfgUser[], option?: { lfg: Lfg, thread: LfgThread }) {
        const newEmbed = new EmbedBuilder();
        const {
            join,
            alter,
            locale
        } = this.findField(originEmbed.fields);
        join.value = this.createJoinString(users);
        join.name = join.name.replace(/\[[0-9]+]/, `[${users.filter((u) => u.state == "JOIN").length}]`);
        alter.value = this.createAlterString(users);
        alter.name = alter.name.replace(/\[[0-9]+]/, `[${users.filter((u) => u.state == "ALTER").length}]`);

        if (option) {
            let typeStr;
            if (option.lfg instanceof NormalLfg) {
                typeStr = "NORMAL";
            } else if (option.lfg instanceof LongTermLfg) {
                typeStr = "LONG-TERM";
            } else {
                typeStr = "REGULAR";
            }

            return this.createMessageEmbed({
                lfg: option.lfg,
                locale,
                users,
                thread: option.thread,
                type: typeStr as LfgType
            });
        }
        newEmbed.setTitle(originEmbed.title)
            .setDescription(originEmbed.description)
            .setURL(originEmbed.url)
            .setFooter(originEmbed.footer)
            .addFields([
                join,
                alter
            ]);

        return newEmbed;
    }

    private findField(fields: { name: string, value: string, inline?: boolean }[]) {
        const joinStrings = getStrings("join");
        let joinField;

        const alterStrings = getStrings("alter");
        let alterField;

        let locale;

        fields.map((field) => {
            for (const joinString of joinStrings) {
                if (field.name == joinString.value) {
                    locale = joinString.locale;
                    joinField = field;
                }
            }

            for (const alterString of alterStrings) {
                if (field.name == alterString.value) {
                    alterField = field;
                }
            }
        });

        return {
            locale,
            join: joinField as { name: string, value: string, inline?: boolean },
            alter: alterField as { name: string, value: string, inline?: boolean }
        };
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
