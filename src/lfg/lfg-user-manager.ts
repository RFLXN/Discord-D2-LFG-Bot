import { EventEmitter } from "events";
import { LongTermLfgUser, NormalLfgUser, RegularLfgUser } from "../db/entity/lfg-user";
import { getRepository } from "../db/typeorm";

interface LfgUserEventHandlers {
    NORMAL_LFG_CREATOR: [user: NormalLfgUser];
    NORMAL_LFG_JOIN: [user: NormalLfgUser];
    NORMAL_LFG_ALTER: [user: NormalLfgUser];
    NORMAL_LFG_LEAVE: [lfgID: number, userID: string];
    LONG_TERM_LFG_CREATOR: [user: LongTermLfgUser];
    LONG_TERM_LFG_JOIN: [user: LongTermLfgUser];
    LONG_TERM_LFG_ALTER: [user: LongTermLfgUser];
    LONG_TERM_LFG_LEAVE: [lfgID: number, userID: string];
    REGULAR_LFG_CREATOR: [user: RegularLfgUser];
    REGULAR_LFG_JOIN: [user: RegularLfgUser];
    REGULAR_LFG_ALTER: [user: RegularLfgUser];
    REGULAR_LFG_LEAVE: [lfgID: number, userID: string];
}

class LfgUserManager extends EventEmitter {
    private static singleton = new LfgUserManager();

    private normalLfgUsers: NormalLfgUser[] = [];

    private longTermLfgUsers: LongTermLfgUser[] = [];

    private regularLfgUsers: RegularLfgUser[] = [];

    private constructor() {
        super();
    }

    public static get instance() {
        return this.singleton;
    }

    public async loadUsers() {
        console.log("Loading All LFG Users...");
        await this.loadNormalUsers();
        await this.loadLongTermUsers();
        await this.loadRegularUsers();
        console.log("LFG Users Loaded.");
    }

    public getNormalUsers(id: number): NormalLfgUser[] {
        return this.normalLfgUsers.filter((user) => user.lfg.id == id)
            .sort((a, b) => a.date.valueOf() - b.date.valueOf());
    }

    public getLongTermUsers(id: number): LongTermLfgUser[] {
        return this.longTermLfgUsers.filter((user) => user.lfg.id == id)
            .sort((a, b) => a.date.valueOf() - b.date.valueOf());
    }

    public getRegularUsers(id: number): RegularLfgUser[] {
        return this.regularLfgUsers.filter((user) => user.lfg.id == id)
            .sort((a, b) => a.date.valueOf() - b.date.valueOf());
    }

    private async loadNormalUsers() {
        console.log("Loading Normal LFG Users...");
        this.normalLfgUsers = await getRepository(NormalLfgUser)
            .createQueryBuilder()
            .getMany();
        console.log(`Normal LFG Users Loaded. Every '${this.normalLfgUsers.length}' Users.`);
    }

    private async loadLongTermUsers() {
        console.log("Loading Long-Term LFG Users...");
        this.longTermLfgUsers = await getRepository(LongTermLfgUser)
            .createQueryBuilder()
            .getMany();
        console.log(`Long-Term LFG Users Loaded. Every '${this.longTermLfgUsers.length}' Users.`);
    }

    private async loadRegularUsers() {
        console.log("Loading Regular LFG Users...");
        this.regularLfgUsers = await getRepository(RegularLfgUser)
            .createQueryBuilder()
            .getMany();
        console.log(`Regular LFG Users Loaded. Every '${this.regularLfgUsers.length}' Users.`);
    }
}

export {
    LfgUserManager
};
