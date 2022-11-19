import { LongTermLfgUser, NormalLfgUser, RegularLfgUser } from "../db/entity/lfg-user";
import { getRepository } from "../db/typeorm";
import {
    LongTermLfgUserCreateOption,
    NormalLfgUserCreateOption,
    RegularLfgUserCreateOption
} from "../type/LfgUserCreateOption";
import { EventTypes, TypedEventEmitter } from "../util/event-emitter";

interface LfgUserEvents extends EventTypes {
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

type LfgUserCreateOption = NormalLfgUserCreateOption | LongTermLfgUserCreateOption | RegularLfgUserCreateOption;

type BaseState = "JOIN" | "ALTER";

type State = BaseState | "CREATOR";

type LfgType = "NORMAL" | "LONG-TERM" | "REGULAR";

class LfgUserManager extends TypedEventEmitter<LfgUserEvents> {
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
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    public getLongTermUsers(id: number): LongTermLfgUser[] {
        return this.longTermLfgUsers.filter((user) => user.lfg.id == id)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    public getRegularUsers(id: number): RegularLfgUser[] {
        return this.regularLfgUsers.filter((user) => user.lfg.id == id)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    public async newNormalCreator(option: NormalLfgUserCreateOption): Promise<NormalLfgUser> {
        const user = await this.insertNormalUserToDB(option, "CREATOR");
        this.normalLfgUsers.push(user);

        this.typedEmit("NORMAL_LFG_CREATOR", user);
        return user;
    }

    public async newLongTermCreator(option: NormalLfgUserCreateOption): Promise<LongTermLfgUser> {
        const user = await this.insertLongTermUserToDB(option, "CREATOR");
        this.longTermLfgUsers.push(user);

        this.typedEmit("LONG_TERM_LFG_CREATOR", user);
        return user;
    }

    public async newRegularCreator(option: NormalLfgUserCreateOption): Promise<RegularLfgUser> {
        const user = await this.insertRegularUserToDB(option, "CREATOR");
        this.regularLfgUsers.push(user);

        this.typedEmit("REGULAR_LFG_CREATOR", user);
        return user;
    }

    public async joinNormalUser(option: NormalLfgUserCreateOption) {
        const idx = this.findNormalUserIndexWithoutCreator(option.lfgID, option.userID);
        if (idx == -1) {
            const user = await this.insertNormalUserToDB(option, "JOIN");
            this.normalLfgUsers.push(user);
            return true;
        }
        if (this.normalLfgUsers[idx].state == "JOIN") {
            return false;
        }
        this.normalLfgUsers[idx].state = "JOIN";
        this.normalLfgUsers[idx].timestamp = new Date().valueOf();
        this.updateNormalUserFromDB(option.lfgID, option.userID, "JOIN");

        this.typedEmit("NORMAL_LFG_JOIN", this.normalLfgUsers[idx]);
        return true;
    }

    public async joinLongTermUser(option: LongTermLfgUserCreateOption) {
        const idx = this.findLongTermUserIndexWithoutCreator(option.lfgID, option.userID);
        if (idx == -1) {
            const user = await this.insertLongTermUserToDB(option, "JOIN");
            this.longTermLfgUsers.push(user);
            return true;
        }
        if (this.longTermLfgUsers[idx].state == "JOIN") {
            return false;
        }
        this.longTermLfgUsers[idx].state = "JOIN";
        this.longTermLfgUsers[idx].timestamp = new Date().valueOf();
        this.updateLongTermUserFromDB(option.lfgID, option.userID, "JOIN");

        this.typedEmit("LONG_TERM_LFG_JOIN", this.longTermLfgUsers[idx]);
        return true;
    }

    public async joinRegularUser(option: RegularLfgUserCreateOption) {
        const idx = this.findRegularUserIndexWithoutCreator(option.lfgID, option.userID);
        if (idx == -1) {
            const user = await this.insertRegularUserToDB(option, "JOIN");
            this.regularLfgUsers.push(user);
            return true;
        }
        if (this.normalLfgUsers[idx].state == "JOIN") {
            return false;
        }
        this.regularLfgUsers[idx].state = "JOIN";
        this.regularLfgUsers[idx].timestamp = new Date().valueOf();
        this.updateRegularUserFromDB(option.lfgID, option.userID, "JOIN");

        this.typedEmit("REGULAR_LFG_JOIN", this.regularLfgUsers[idx]);
        return true;
    }

    public async alterNormalUser(option: NormalLfgUserCreateOption) {
        const idx = this.findNormalUserIndexWithoutCreator(option.lfgID, option.userID);
        if (idx == -1) {
            const user = await this.insertNormalUserToDB(option, "ALTER");
            this.normalLfgUsers.push(user);
            return true;
        }
        if (this.normalLfgUsers[idx].state == "ALTER") {
            return false;
        }
        this.normalLfgUsers[idx].state = "ALTER";
        this.normalLfgUsers[idx].timestamp = new Date().valueOf();
        this.updateNormalUserFromDB(option.lfgID, option.userID, "ALTER");

        this.typedEmit("NORMAL_LFG_ALTER", this.normalLfgUsers[idx]);
        return true;
    }

    public async alterLongTermUser(option: LongTermLfgUserCreateOption) {
        const idx = this.findLongTermUserIndexWithoutCreator(option.lfgID, option.userID);
        if (idx == -1) {
            const user = await this.insertLongTermUserToDB(option, "ALTER");
            this.longTermLfgUsers.push(user);
            return true;
        }
        if (this.longTermLfgUsers[idx].state == "ALTER") {
            return false;
        }
        this.longTermLfgUsers[idx].state = "ALTER";
        this.longTermLfgUsers[idx].timestamp = new Date().valueOf();
        this.updateLongTermUserFromDB(option.lfgID, option.userID, "ALTER");

        this.typedEmit("LONG_TERM_LFG_ALTER", this.longTermLfgUsers[idx]);
        return true;
    }

    public async alterRegularUser(option: RegularLfgUserCreateOption) {
        const idx = this.findRegularUserIndexWithoutCreator(option.lfgID, option.userID);
        if (idx == -1) {
            const user = await this.insertRegularUserToDB(option, "ALTER");
            this.regularLfgUsers.push(user);
            return true;
        }
        if (this.normalLfgUsers[idx].state == "ALTER") {
            return false;
        }
        this.regularLfgUsers[idx].state = "ALTER";
        this.regularLfgUsers[idx].timestamp = new Date().valueOf();
        this.updateRegularUserFromDB(option.lfgID, option.userID, "ALTER");

        this.typedEmit("REGULAR_LFG_ALTER", this.regularLfgUsers[idx]);
        return true;
    }

    public async leaveNormalUser(lfgID: number, userID: string) {
        const result = await this.deleteUser("NORMAL", lfgID, userID);

        this.typedEmit("NORMAL_LFG_LEAVE", lfgID, userID);

        return result;
    }

    public async leaveLongTermUser(lfgID: number, userID: string) {
        const result = await this.deleteUser("LONG-TERM", lfgID, userID);

        this.typedEmit("LONG_TERM_LFG_LEAVE", lfgID, userID);

        return result;
    }

    public async leaveRegularUser(lfgID: number, userID: string) {
        const result = await this.deleteUser("REGULAR", lfgID, userID);

        this.typedEmit("REGULAR_LFG_LEAVE", lfgID, userID);

        return result;
    }

    private async deleteUser(type: LfgType, lfgID: number, userID: string) {
        let entity;
        let target;

        const filter = (user: { lfg: { id: number }, userID: string, state: State }) =>
            user.lfg.id == lfgID && user.userID == userID && user.state != "CREATOR";

        if (type == "NORMAL") {
            entity = NormalLfgUser;
            target = this.normalLfgUsers;
        } else if (type == "LONG-TERM") {
            entity = LongTermLfgUser;
            target = this.longTermLfgUsers;
        } else {
            entity = RegularLfgUser;
            target = this.regularLfgUsers;
        }

        const idx = target.findIndex(filter);

        if (idx == -1) return false;

        await getRepository(entity)
            .createQueryBuilder()
            .delete()
            .from(entity)
            .where("LFG_ID = :lfgID AND USER_ID = :userID", {
                lfgID,
                userID
            })
            .execute();

        return true;
    }

    private findNormalUserIndexWithoutCreator(lfgID: number, userID: string): number {
        return this.normalLfgUsers.findIndex((user) => user.lfg.id == lfgID && user.userID == userID
            && user.state != "CREATOR");
    }

    private findLongTermUserIndexWithoutCreator(lfgID: number, userID: string): number {
        return this.longTermLfgUsers.findIndex((user) => user.lfg.id == lfgID && user.userID == userID
            && user.state != "CREATOR");
    }

    private findRegularUserIndexWithoutCreator(lfgID: number, userID: string): number {
        return this.regularLfgUsers.findIndex((user) => user.lfg.id == lfgID && user.userID == userID
            && user.state != "CREATOR");
    }

    private async insertNormalUserToDB(option: NormalLfgUserCreateOption, state: State) {
        const result = await getRepository(NormalLfgUser)
            .insert({
                lfg: { id: option.lfgID },
                userID: option.userID,
                userTag: option.userTag,
                userName: option.userName,
                state,
                timestamp: new Date().valueOf()
            });
        const { id } = result.identifiers[0];

        return this.getNormalUserByID(id);
    }

    private async insertLongTermUserToDB(option: LongTermLfgUserCreateOption, state: State) {
        const result = await getRepository(LongTermLfgUser)
            .insert({
                lfg: { id: option.lfgID },
                userID: option.userID,
                userTag: option.userTag,
                userName: option.userName,
                state,
                timestamp: new Date().valueOf()
            });
        const { id } = result.identifiers[0];

        return this.getLongTermUserByID(id);
    }

    private async insertRegularUserToDB(option: RegularLfgUserCreateOption, state: State) {
        const result = await getRepository(RegularLfgUser)
            .insert({
                lfg: { id: option.lfgID },
                userID: option.userID,
                userTag: option.userTag,
                userName: option.userName,
                state,
                timestamp: new Date().valueOf()
            });
        const { id } = result.identifiers[0];

        return this.getRegularUserByID(id);
    }

    private async updateNormalUserFromDB(lfgID: number, userID: string, state: BaseState) {
        await this.updateUserFromDB("NORMAL", lfgID, userID, state);
    }

    private async updateLongTermUserFromDB(lfgID: number, userID: string, state: BaseState) {
        await this.updateUserFromDB("LONG-TERM", lfgID, userID, state);
    }

    private async updateRegularUserFromDB(lfgID: number, userID: string, state: BaseState) {
        await this.updateUserFromDB("REGULAR", lfgID, userID, state);
    }

    private async updateUserFromDB(type: LfgType, lfgID: number, userID: string, state: BaseState) {
        let entity;
        if (type == "NORMAL") {
            entity = NormalLfgUser;
        } else if (type == "LONG-TERM") {
            entity = LongTermLfgUser;
        } else {
            entity = RegularLfgUser;
        }

        await getRepository(entity)
            .createQueryBuilder()
            .update()
            .set({
                state
            })
            .where("LFG_ID = :lfgID AND USER_ID = :userID", {
                lfgID,
                userID
            })
            .execute();
    }

    private async getNormalUserByID(id: number) {
        return getRepository(NormalLfgUser)
            .findOne({
                relations: ["lfg"],
                where: { id }
            });
    }

    private async getLongTermUserByID(id: number) {
        return getRepository(LongTermLfgUser)
            .findOne({
                relations: ["lfg"],
                where: { id }
            });
    }

    private async getRegularUserByID(id: number) {
        return getRepository(RegularLfgUser)
            .findOne({
                relations: ["lfg"],
                where: { id }
            });
    }

    private async loadNormalUsers() {
        console.log("Loading Normal LFG Users...");
        this.normalLfgUsers = await getRepository(NormalLfgUser)
            .find({
                relations: ["lfg"]
            });
        console.log(`Normal LFG Users Loaded. Every '${this.normalLfgUsers.length}' Users.`);
    }

    private async loadLongTermUsers() {
        console.log("Loading Long-Term LFG Users...");
        this.longTermLfgUsers = await getRepository(LongTermLfgUser)
            .find({
                relations: ["lfg"]
            });
        console.log(`Long-Term LFG Users Loaded. Every '${this.longTermLfgUsers.length}' Users.`);
    }

    private async loadRegularUsers() {
        console.log("Loading Regular LFG Users...");
        this.regularLfgUsers = await getRepository(RegularLfgUser)
            .find({
                relations: ["lfg"]
            });
        console.log(`Regular LFG Users Loaded. Every '${this.regularLfgUsers.length}' Users.`);
    }
}

export {
    LfgUserManager
};
