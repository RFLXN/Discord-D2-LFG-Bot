import {
    LfgCreator,
    LongTermLfgCreateOption,
    NormalLfgCreateOption,
    RegularLfgCreateOption
} from "../type/LfgCreateOption";
import { LongTermLfg, NormalLfg, RegularLfg } from "../db/entity/lfg";
import { getQueryBuilder, getRepository } from "../db/typeorm";
import { EventTypes, TypedEventEmitter } from "../util/event-emitter";

interface LfgEvents extends EventTypes {
    NEW_NORMAL_LFG: [creator: LfgCreator, lfg: NormalLfg];
    NEW_LONG_TERM_LFG: [creator: LfgCreator, lfg: LongTermLfg];
    NEW_REGULAR_LFG: [creator: LfgCreator, lfg: RegularLfg];
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

class LfgManager extends TypedEventEmitter<LfgEvents> {
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

    public async createNormalLfg(creator: LfgCreator, option: NormalLfgCreateOption): Promise<NormalLfg> {
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

        this.typedEmit("NEW_NORMAL_LFG", creator, created);
        return created;
    }

    public async createLongTermLfg(creator: LfgCreator, option: LongTermLfgCreateOption): Promise<LongTermLfg> {
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

        this.typedEmit("NEW_LONG_TERM_LFG", creator, created);
        return created;
    }

    public async createRegularLfg(creator: LfgCreator, option: RegularLfgCreateOption): Promise<RegularLfg> {
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

        this.typedEmit("NEW_REGULAR_LFG", creator, created);
        return created;
    }

    public deleteNormalLfg(id: number): boolean {
        const idx = this.normalLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) {
            return false;
        }
        this.normalLfg.splice(idx, 1);

        this.deleteNormalLfgFromDB(id);

        this.typedEmit("DELETE_NORMAL_LFG", id);

        return true;
    }

    public deleteLongTermLfg(id: number): boolean {
        const idx = this.longTermLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) {
            return false;
        }

        this.longTermLfg.splice(idx, 1);

        this.deleteLongTermLfgFromDB(id);

        this.typedEmit("DELETE_LONG_TERM_LFG", id);
        return true;
    }

    public deleteRegularLfg(id: number): boolean {
        const idx = this.regularLfg.findIndex((lfg) => lfg.id == id);

        if (idx == -1) {
            return false;
        }

        this.regularLfg.splice(idx, 1);

        this.deleteRegularLfgFromDB(id);

        this.typedEmit("DELETE_REGULAR_LFG", id);
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

        this.typedEmit("EDIT_NORMAL_LFG", this.normalLfg[idx]);

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

        this.typedEmit("EDIT_LONG_TERM_LFG", this.longTermLfg[idx]);

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

        this.typedEmit("EDIT_REGULAR_LFG", this.regularLfg[idx]);

        return true;
    }

    public getNormalLfg(id: number): NormalLfg | undefined {
        const found = this.normalLfg.find((lfg) => lfg.id == id);
        this.typedEmit("GET_NORMAL_LFG", found);
        return found;
    }

    public getLongTermLfg(id: number): LongTermLfg | undefined {
        const found = this.longTermLfg.find((lfg) => lfg.id == id);
        this.typedEmit("GET_LONG_TERM_LFG", found);
        return found;
    }

    public getRegularLfg(id: number): RegularLfg | undefined {
        const found = this.regularLfg.find((lfg) => lfg.id == id);
        this.typedEmit("GET_REGULAR_LFG", found);
        return found;
    }

    private async getNormalLfgFromDB(id: number): Promise<NormalLfg> {
        return getRepository(NormalLfg)
            .findOne({
                where: { id }
            });
    }

    private async getLongTermLfgFromDB(id: number): Promise<LongTermLfg> {
        return getRepository(LongTermLfg)
            .findOne({
                where: { id }
            });
    }

    private async getRegularLfgFromDB(id: number): Promise<RegularLfg> {
        return getRepository(RegularLfg)
            .findOne({
                where: { id }
            });
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

    private async editNormalLfgFromDB(id: number, options: Partial<Omit<NormalLfg, "guildID" | "id">>) {
        await getQueryBuilder(NormalLfg)
            .update()
            .set({ ...options })
            .where("ID = :id", { id })
            .execute();
    }

    private async editLongTermLfgFromDB(id: number, options: Partial<Omit<LongTermLfg, "guildID" | "id">>) {
        await getQueryBuilder(LongTermLfg)
            .update()
            .set({ ...options })
            .where("ID = :id", { id })
            .execute();
    }

    private async editRegularLfgFromDB(id: number, options: Partial<Omit<RegularLfg, "guildID" | "id">>) {
        await getQueryBuilder(RegularLfg)
            .update()
            .set({ ...options })
            .where("ID = :id", { id })
            .execute();
    }

    private async loadAllNormalLfg() {
        console.log("Loading Normal LFG...");
        this.normalLfg = await getRepository(NormalLfg)
            .find();
        console.log(`Normal LFG Loaded. Every '${this.normalLfg.length}' LFG.`);
    }

    private async loadAllLongTermLfg() {
        console.log("Loading Long-Term LFG...");
        this.longTermLfg = await getRepository(LongTermLfg)
            .find();
        console.log(`Long-Term LFG Loaded. Every '${this.longTermLfg.length}' LFG.`);
    }

    private async loadAllRegularLfg() {
        console.log("Loading Regular LFG...");
        this.regularLfg = await getRepository(RegularLfg)
            .find();
        console.log(`Regular LFG Loaded. Every '${this.regularLfg.length}' LFG.`);
    }
}

export { LfgManager, LfgEvents };
