import { EventEmitter } from "events";
import { LongTermLfgCreateOption, NormalLfgCreateOption, RegularLfgCreateOption } from "../type/LfgCreateOption";
import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { getQueryBuilder, getRepository } from "../db/typeorm";

interface LfgEventHandlers {
    NEW_NORMAL_LFG: [creator: string, lfg: NormalLfg];
    NEW_LONG_TERM_LFG: [creator: string, lfg: LongTermLfg];
    NEW_REGULAR_LFG: [creator: string, lfg: RegularLfg];
    DELETE_NORMAL_LFG: [id: number];
    DELETE_LONG_TERM_LFG: [id: number];
    DELETE_REGULAR_LFG: [id: number];
    EDIT_NORMAL_LFG: [lfg: NormalLfg];
    EDIT_LONG_TERM_LFG: [lfg: LongTermLfg];
    EDIT_REGULAR_LFG: [lfg: RegularLfg];
    GET_NORMAL_LFG: [lfg: NormalLfg];
    GET_LONG_TERM_LFG: [lfg: LongTermLfg];
    GET_REGULAR_LFG: [lfg: RegularLfg];
}

type LfgEventHandler<K extends keyof LfgEventHandlers> = (...args: LfgEventHandlers[K]) => void;

class LfgManager extends EventEmitter {
    private static readonly singleton = new LfgManager();

    private normalLfg: NormalLfg[] = [];

    private longTermLfg: LongTermLfg[] = [];

    private regularLfg: RegularLfg[] = [];

    private constructor() {
        super();
    }

    public static get instance() {
        return this.singleton;
    }

    public async loadLfg() {
        console.log("Loading All LFG...");
        await this.loadAllNormalLfg();
        await this.loadAllLongTermLfg();
        await this.loadAllRegularLfg();
        console.log("Successfully Loaded All LFG.");
    }

    public on<K extends keyof LfgEventHandlers>(eventName: K, listener: LfgEventHandler<K>): this {
        return super.on(eventName, listener as (...args: any[]) => void);
    }

    public emit<K extends keyof LfgEventHandlers>(eventName: K, ...args: LfgEventHandlers[K]): boolean {
        return super.emit(eventName, args);
    }

    public async createNormalLfg(creatorId: string, option: NormalLfgCreateOption): Promise<NormalLfg> {
        const result = await getQueryBuilder()
            .insert()
            .into(NormalLfg)
            .values({
                activityName: option.activityName,
                description: option.description,
                guildID: option.guildID,
                timestamp: option.date.valueOf()
            })
            .execute();

        const id = result.raw as number;
        const created = await this.getNormalLfgFromDB(id);

        this.normalLfg.push(created);

        this.emit("NEW_NORMAL_LFG", creatorId, created);
        return created;
    }

    public async createLongTermLfg(creatorId: string, option: LongTermLfgCreateOption): Promise<LongTermLfg> {
        const result = await getQueryBuilder()
            .insert()
            .into(LongTermLfg)
            .values({
                activityName: option.activityName,
                description: option.description,
                guildID: option.guildID,
                timestamp: option.date.valueOf()
            })
            .execute();

        const id = result.raw as number;
        const created = await this.getLongTermLfgFromDB(id);

        this.longTermLfg.push(created);

        this.emit("NEW_LONG_TERM_LFG", creatorId, created);
        return created;
    }

    public async createRegularLfg(creatorId: string, option: RegularLfgCreateOption): Promise<RegularLfg> {
        const result = await getQueryBuilder()
            .insert()
            .into(RegularLfg)
            .values({
                activityName: option.activityName,
                description: option.description,
                guildID: option.guildID
            })
            .execute();

        const id = result.raw as number;
        const created = await this.getRegularLfgFromDB(id);

        this.regularLfg.push(created);

        this.emit("NEW_REGULAR_LFG", creatorId, created);
        return created;
    }

    public deleteNormalLfg(id: number): boolean {
        const idx = this.normalLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) {
            return false;
        }
        this.normalLfg.splice(idx, 1);

        this.deleteNormalLfgFromDB(id);

        this.emit("DELETE_NORMAL_LFG", id);

        return true;
    }

    public deleteLongTermLfg(id: number): boolean {
        const idx = this.longTermLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) {
            return false;
        }

        this.longTermLfg.splice(idx, 1);

        this.deleteLongTermLfgFromDB(id);

        this.emit("DELETE_LONG_TERM_LFG", id);
        return true;
    }

    public deleteRegularLfg(id: number): boolean {
        const idx = this.regularLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) {
            return false;
        }

        this.regularLfg.splice(idx, 1);

        this.deleteRegularLfgFromDB(id);

        this.emit("DELETE_REGULAR_LFG", id);
        return true;
    }

    public editNormalLfg(id: number, option: Partial<Omit<NormalLfgCreateOption, "guildID">>) {
        const idx = this.normalLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) return false;

        if (option.date) {
            this.normalLfg[idx].timestamp = option.date.valueOf();
        }

        if (option.activityName) {
            this.normalLfg[idx].activityName = option.activityName;
        }

        if (option.description) {
            this.normalLfg[idx].description = option.description;
        }

        this.editNormalLfgFromDB(id, option);

        this.emit("EDIT_NORMAL_LFG", this.normalLfg[idx]);

        return true;
    }

    public editLongTermLfg(id: number, option: Partial<Omit<LongTermLfgCreateOption, "guildID">>) {
        const idx = this.longTermLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) return false;

        if (option.date) {
            this.normalLfg[idx].timestamp = option.date.valueOf();
        }

        if (option.activityName) {
            this.normalLfg[idx].activityName = option.activityName;
        }

        if (option.description) {
            this.normalLfg[idx].description = option.description;
        }

        this.editLongTermLfgFromDB(id, option);

        this.emit("EDIT_LONG_TERM_LFG", this.longTermLfg[idx]);

        return true;
    }

    public editRegularLfg(id: number, option: Partial<Omit<RegularLfgCreateOption, "guildID">>) {
        const idx = this.longTermLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) return false;

        if (option.activityName) {
            this.normalLfg[idx].activityName = option.activityName;
        }

        if (option.description) {
            this.normalLfg[idx].description = option.description;
        }

        this.editRegularLfgFromDB(id, option);

        this.emit("EDIT_REGULAR_LFG", this.regularLfg[idx]);

        return true;
    }

    public getNormalLfg(id: number): NormalLfg | undefined {
        const found = this.normalLfg.find((lfg) => lfg.id == id);
        this.emit("GET_NORMAL_LFG", found);
        return found;
    }

    public getLongTermLfg(id: number): LongTermLfg | undefined {
        const found = this.longTermLfg.find((lfg) => lfg.id == id);
        this.emit("GET_LONG_TERM_LFG", found);
        return found;
    }

    public getRegularLfg(id: number): RegularLfg | undefined {
        const found = this.regularLfg.find((lfg) => lfg.id == id);
        this.emit("GET_REGULAR_LFG", found);
        return found;
    }

    private async getNormalLfgFromDB(id: number): Promise<NormalLfg> {
        return getRepository(NormalLfg)
            .createQueryBuilder("NORMAL_LFG")
            .where("NORMAL_LFG.ID = :id", { id })
            .getOne();
    }

    private async getLongTermLfgFromDB(id: number): Promise<LongTermLfg> {
        return getRepository(LongTermLfg)
            .createQueryBuilder("LONG_TERM_LFG")
            .where("NORMAL_LFG.ID = :id", { id })
            .getOne();
    }

    private async getRegularLfgFromDB(id: number): Promise<RegularLfg> {
        return getRepository(RegularLfg)
            .createQueryBuilder("NORMAL_LFG")
            .where("NORMAL_LFG.ID = :id", { id })
            .getOne();
    }

    private async deleteNormalLfgFromDB(id: number) {
        await getQueryBuilder(NormalLfg)
            .delete()
            .from(NormalLfg)
            .where("ID = :id", { id })
            .execute();
    }

    private async deleteLongTermLfgFromDB(id: number) {
        await getQueryBuilder(LongTermLfg)
            .delete()
            .from(LongTermLfg)
            .where("ID = :id", { id })
            .execute();
    }

    private async deleteRegularLfgFromDB(id: number) {
        await getQueryBuilder(RegularLfg)
            .delete()
            .from(RegularLfg)
            .where("ID = :id", { id })
            .execute();
    }

    private async editNormalLfgFromDB(id: number, options: Partial<Omit<NormalLfg, "guildID">>) {

    }

    private async editLongTermLfgFromDB(id: number, options: Partial<Omit<LongTermLfg, "guildID">>) {

    }

    private async editRegularLfgFromDB(id: number, options: Partial<Omit<RegularLfg, "guildID">>) {

    }

    private async loadAllNormalLfg() {
        console.log("Loading Normal LFG...");
        this.normalLfg = await getRepository(NormalLfg)
            .createQueryBuilder("NORMAL_LFG")
            .getMany();
        console.log(`Normal LFG Loaded. Every '${this.normalLfg.length}' LFG.`);
    }

    private async loadAllLongTermLfg() {
        console.log("Loading Long-Term LFG...");
        this.longTermLfg = await getRepository(LongTermLfg)
            .createQueryBuilder("LONG_TERM_LFG")
            .getMany();
        console.log(`Long-Term LFG Loaded. Every '${this.longTermLfg.length}' LFG.`);
    }

    private async loadAllRegularLfg() {
        console.log("Loading Regular LFG...");
        this.regularLfg = await getRepository(RegularLfg)
            .createQueryBuilder("REGULAR_LFG")
            .getMany();
        console.log(`Regular LFG Loaded. Every '${this.regularLfg.length}' LFG.`);
    }
}

export { LfgManager, LfgEventHandlers };
