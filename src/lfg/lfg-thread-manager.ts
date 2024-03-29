import { TextChannel, ThreadAutoArchiveDuration, ThreadChannel } from "discord.js";
import { EventTypes, TypedEventEmitter } from "../util/event-emitter.js";
import { LfgManager } from "./lfg-manager.js";
import { getLfgServerConfig } from "./server-config.js";
import client from "../main.js";
import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg.js";
import { getRepository } from "../db/typeorm.js";
import { LongTermLfgThread, NormalLfgThread, RegularLfgThread } from "../db/entity/lfg-thread.js";
import { LfgUserManager } from "./lfg-user-manager.js";

interface LfgThreadEvents extends EventTypes {
    newNormalThread: [entity: NormalLfgThread, real: ThreadChannel];
    newLongTermThread: [entity: LongTermLfgThread, real: ThreadChannel];
    newRegularThread: [entity: RegularLfgThread, real: ThreadChannel];
}

type LfgThread = NormalLfgThread | LongTermLfgThread | RegularLfgThread;

type LfgType = "NORMAL" | "LONG-TERM" | "REGULAR";

type LfgUserActionType = "Join" | "Alter" | "Leave";

class LfgThreadManager extends TypedEventEmitter<LfgThreadEvents> {
    private static readonly singleton = new LfgThreadManager();

    private normalThreads: NormalLfgThread[] = [];

    private longTermThreads: LongTermLfgThread[] = [];

    private regularThreads: RegularLfgThread[] = [];

    private constructor() {
        super();
    }

    public static get instance() {
        return this.singleton;
    }

    public async loadThreads() {
        console.log("Loading All LFG Threads...");
        await this.loadNormalThreads();
        await this.loadLongTermThreads();
        await this.loadRegularThreads();
        console.log("Successfully Loaded All LFG Threads.");
    }

    public async sendNormalThreadMessage(lfgID: number, user: { id: string, name: string }, type: LfgUserActionType) {
        const thread = await this.getRealNormalThread(lfgID);
        if (type != "Leave") {
            return thread.send({
                content: `<@${user.id}> -> ${type}`
            });
        }

        await thread.send({
            content: `${user.name} -> Leave`
        });
        await thread.members.remove(user.id);
    }

    public async sendLongTermThreadMessage(lfgID: number, user: { id: string, name: string }, type: LfgUserActionType) {
        const thread = await this.getRealLongTermThread(lfgID);
        if (type != "Leave") {
            return thread.send({
                content: `<@${user.id}> -> ${type}`
            });
        }

        await thread.send({
            content: `${user.name} -> Leave`
        });
        await thread.members.remove(user.id);
    }

    public async sendRegularThreadMessage(lfgID: number, user: { id: string, name: string }, type: LfgUserActionType) {
        const thread = await this.getRealRegularThread(lfgID);
        if (type != "Leave") {
            return thread.send({
                content: `<@${user.id}> -> ${type}`
            });
        }

        await thread.send({
            content: `${user.name} -> Leave`
        });
        await thread.members.remove(user.id);
    }

    public getNormalThreads() {
        return this.normalThreads;
    }

    public getNormalThread(lfgID: number) {
        return this.normalThreads.find((thread) => thread.lfg.id == lfgID);
    }

    public async getRealNormalThread(lfgID: number) {
        const entity = this.getNormalThread(lfgID);
        const guild = await client.guilds.fetch(entity.guildID);
        const channel = (await guild.channels.fetch(entity.channelID)) as TextChannel;
        return channel.threads.fetch(entity.threadID);
    }

    public getLongTermThreads() {
        return this.longTermThreads;
    }

    public getLongTermThread(lfgID: number) {
        return this.longTermThreads.find((thread) => thread.lfg.id == lfgID);
    }

    public async getRealLongTermThread(lfgID: number) {
        const entity = this.getLongTermThread(lfgID);
        const guild = await client.guilds.fetch(entity.guildID);
        const channel = (await guild.channels.fetch(entity.channelID)) as TextChannel;
        return channel.threads.fetch(entity.threadID);
    }

    public getRegularThreads() {
        return this.regularThreads;
    }

    public getRegularThread(lfgID: number) {
        return this.regularThreads.find((thread) => thread.lfg.id == lfgID);
    }

    public async getRealRegularThread(lfgID: number) {
        const entity = this.getRegularThread(lfgID);
        const guild = await client.guilds.fetch(entity.guildID);
        const channel = (await guild.channels.fetch(entity.channelID)) as TextChannel;
        return channel.threads.fetch(entity.threadID);
    }

    public async createNormalThread(lfgID: number) {
        const lfg = LfgManager.instance.getNormalLfg(lfgID);
        const channel = await this.getChannelFromLfg("NORMAL", lfg);
        const thread = await this.createThread(channel, lfg, "NORMAL");

        const created = await this.insertThread("NORMAL", {
            lfg,
            guildID: lfg.guildID,
            channelID: channel.id,
            threadID: thread.id
        });

        this.normalThreads.push(created as NormalLfgThread);

        this.typedEmit("newNormalThread", created as NormalLfgThread, thread);
        return {
            entity: created,
            real: thread
        };
    }

    public async createLongTermThread(lfgID: number) {
        const lfg = LfgManager.instance.getLongTermLfg(lfgID);
        const channel = await this.getChannelFromLfg("LONG-TERM", lfg);
        const thread = await this.createThread(channel, lfg, "LONG-TERM");

        const created = await this.insertThread("LONG-TERM", {
            lfg,
            guildID: lfg.guildID,
            channelID: channel.id,
            threadID: thread.id
        });

        this.longTermThreads.push(created as LongTermLfgThread);

        this.typedEmit("newLongTermThread", created as LongTermLfgThread, thread);
        return {
            entity: created,
            real: thread
        };
    }

    public async createRegularThread(lfgID: number) {
        const lfg = LfgManager.instance.getRegularLfg(lfgID);
        const channel = await this.getChannelFromLfg("REGULAR", lfg);
        const thread = await this.createThread(channel, lfg, "REGULAR");

        const created = await this.insertThread("REGULAR", {
            lfg,
            guildID: lfg.guildID,
            channelID: channel.id,
            threadID: thread.id
        });

        this.regularThreads.push(created as RegularLfgThread);

        this.typedEmit("newRegularThread", created as RegularLfgThread, thread);
        return {
            entity: created,
            real: thread
        };
    }

    public deleteCachedNormalThread(lfgID: number) {
        const idx = this.normalThreads.findIndex((thread) => thread.lfg.id == lfgID);
        if (idx != -1) {
            this.normalThreads.splice(idx, 1);
        }
    }

    public deleteCachedLongTermThread(lfgID: number) {
        const idx = this.longTermThreads.findIndex((thread) => thread.lfg.id == lfgID);
        if (idx != -1) {
            this.longTermThreads.splice(idx, 1);
        }
    }

    public deleteCachedRegularThread(lfgID: number) {
        const idx = this.regularThreads.findIndex((thread) => thread.lfg.id == lfgID);
        if (idx != -1) {
            this.regularThreads.splice(idx, 1);
        }
    }

    public createThreadInitMessage(type: LfgType, lfg: NormalLfg | LongTermLfg | RegularLfg, creatorID: string) {
        let s = "";

        if (type == "NORMAL") {
            s = "Normal Looking-For-Group\n";
        } else if (type == "LONG-TERM") {
            s = "Long-Term Looking-For-Group\n";
        } else {
            s = "Regular Looking-For-Group\n";
        }

        s += `ID: ${lfg.id}\n`;
        s += `Creator: <@${creatorID}>\n`;

        return s;
    }

    public async refreshNormalThread(lfgID: number) {
        const lfg = LfgManager.instance.getNormalLfg(lfgID);
        await this.refreshThread("NORMAL", lfg);
    }

    public async refreshLongTermThread(lfgID: number) {
        const lfg = LfgManager.instance.getLongTermLfg(lfgID);
        await this.refreshThread("LONG-TERM", lfg);
    }

    public async refreshRegularThread(lfgID: number) {
        const lfg = LfgManager.instance.getRegularLfg(lfgID);
        await this.refreshThread("REGULAR", lfg);
    }

    private async refreshThread(type: LfgType, lfg: NormalLfg | LongTermLfg | RegularLfg) {
        let thread;
        let creatorID;

        if (type == "NORMAL") {
            thread = await this.getRealNormalThread(lfg.id);
            creatorID = LfgUserManager.instance.getNormalUsers(lfg.id)
                .find((u) => u.state == "CREATOR").userID;
        } else if (type == "LONG-TERM") {
            thread = await this.getRealLongTermThread(lfg.id);
            creatorID = LfgUserManager.instance.getLongTermUsers(lfg.id)
                .find((u) => u.state == "CREATOR").userID;
        } else {
            thread = await this.getRealRegularThread(lfg.id);
            creatorID = LfgUserManager.instance.getRegularUsers(lfg.id)
                .find((u) => u.state == "CREATOR").userID;
        }

        await thread.edit({
            name: this.createLfgThreadName(type, lfg)
        });
    }

    private async createThread(
        channel: TextChannel,
        lfg: NormalLfg | RegularLfg | LongTermLfg,
        type: LfgType
    )
        : Promise<ThreadChannel> {
        return channel.threads.create({
            name: this.createLfgThreadName(type, lfg),
            autoArchiveDuration: ThreadAutoArchiveDuration.OneDay
        });
    }

    private createLfgThreadName(type: LfgType, lfg: NormalLfg | LongTermLfg | RegularLfg) {
        let head;
        if (type == "NORMAL") {
            head = "N";
        } else if (type == "LONG-TERM") {
            head = "L";
        } else {
            head = "R";
        }

        return `${head}${lfg.id}-${lfg.activityName.replaceAll(" ", "-")
            .replaceAll("---", "-")}`;
    }

    private async getChannelFromLfg(type: LfgType, lfg: { guildID: string }) {
        const configs = await getLfgServerConfig(lfg.guildID);
        let channelID;

        if (type == "NORMAL") {
            channelID = configs.normalLfgThreadChannel;
        } else if (type == "LONG-TERM") {
            channelID = configs.longTermLfgThreadChannel;
        } else {
            channelID = configs.regularLfgThreadChannel;
        }

        const guild = await client.guilds.fetch(lfg.guildID);
        return guild.channels.fetch(channelID) as Promise<TextChannel>;
    }

    private async insertThread(type: LfgType, thread: Omit<LfgThread, "id"> & { lfg: { id: number } }) {
        let entity;
        if (type == "NORMAL") {
            entity = NormalLfgThread;
        } else if (type == "LONG-TERM") {
            entity = LongTermLfgThread;
        } else {
            entity = RegularLfgThread;
        }
        const result = await getRepository(entity)
            .createQueryBuilder()
            .insert()
            .into(entity)
            .values({ ...thread })
            .execute();

        const { id } = result.identifiers[0];
        return this.getThreadByIdFromDB(type, id);
    }

    private async getThreadByIdFromDB(type: LfgType, id: number): Promise<LfgThread> {
        let entity;
        if (type == "NORMAL") {
            entity = NormalLfgThread;
        } else if (type == "LONG-TERM") {
            entity = LongTermLfgThread;
        } else {
            entity = RegularLfgThread;
        }

        return getRepository(entity)
            .findOne({
                relations: ["lfg"],
                where: { id }
            });
    }

    private deleteThread(type: LfgType, id: number) {
        let entity;
        if (type == "NORMAL") {
            entity = NormalLfgThread;
        } else if (type == "LONG-TERM") {
            entity = LongTermLfgThread;
        } else {
            entity = RegularLfgThread;
        }

        getRepository(entity)
            .createQueryBuilder()
            .delete()
            .where("ID = :id", { id })
            .execute();
    }

    private async loadNormalThreads() {
        console.log("Loading Normal LFG Threads...");
        this.normalThreads = await getRepository(NormalLfgThread)
            .find({ relations: ["lfg"] });
        console.log(`Normal LFG Threads Loaded. Every '${this.normalThreads.length}' Threads.`);
    }

    private async loadLongTermThreads() {
        console.log("Loading Long-Term LFG Threads...");
        this.longTermThreads = await getRepository(LongTermLfgThread)
            .find({ relations: ["lfg"] });
        console.log(`Long-Term LFG Threads Loaded. Every '${this.longTermThreads.length}' Threads.`);
    }

    private async loadRegularThreads() {
        console.log("Loading Regular LFG Threads...");
        this.regularThreads = await getRepository(RegularLfgThread)
            .find({ relations: ["lfg"] });
        console.log(`Regular LFG Threads Loaded. Every '${this.regularThreads.length}' Threads.`);
    }
}

export default LfgThreadManager;
