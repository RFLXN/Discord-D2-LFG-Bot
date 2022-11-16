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
        return this.doJoinOrAlter("NORMAL", option, "JOIN");
    }

    public async joinLongTermUser(option: LongTermLfgUserCreateOption) {
        return this.doJoinOrAlter("LONG-TERM", option, "JOIN");
    }

    public async joinRegularUser(option: RegularLfgUserCreateOption) {
        return this.doJoinOrAlter("REGULAR", option, "JOIN");
    }

    public async alterNormalUser(option: NormalLfgUserCreateOption) {
        return this.doJoinOrAlter("NORMAL", option, "ALTER");
    }

    public async alterLongTermUser(option: LongTermLfgUserCreateOption) {
        return this.doJoinOrAlter("LONG-TERM", option, "ALTER");
    }

    public async alterRegularUser(option: RegularLfgUserCreateOption) {
        return this.doJoinOrAlter("REGULAR", option, "ALTER");
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

    private async doJoinOrAlter(
        type: LfgType,
        option: LfgUserCreateOption,
        state: BaseState
    ) {
        let insertToDB;
        let updateFromDB;
        let idx = -1;
        let target;
        let event;

        const filter = (user: { lfg: { id: number }, userID: string, state: State }) =>
            user.lfg.id == option.lfgID && user.userID == option.userID
            && user.state != "CREATOR";

        if (type == "NORMAL") {
            insertToDB = this.insertNormalUserToDB;
            updateFromDB = this.updateNormalUserFromDB;
            idx = this.normalLfgUsers.findIndex(filter);
            event = `NORMAL_LFG_${state}`;
            target = this.normalLfgUsers;
        } else if (type == "LONG-TERM") {
            insertToDB = this.insertLongTermUserToDB;
            updateFromDB = this.updateLongTermUserFromDB;
            idx = this.longTermLfgUsers.findIndex(filter);
            target = this.longTermLfgUsers;
            event = `LONG_TERM_LFG_${state}`;
        } else {
            insertToDB = this.insertRegularUserToDB;
            updateFromDB = this.updateRegularUserFromDB;
            idx = this.regularLfgUsers.findIndex(filter);
            target = this.regularLfgUsers;
            event = `REGULAR_LFG_${state}`;
        }

        let user;

        if (idx == -1) {
            user = await insertToDB(option, state);
            target.push(user);
        } else if (target[idx].state == state) {
            return false;
        } else {
            target[idx].state = state;
            target[idx].timestamp = new Date().valueOf();
            user = target[idx];

            updateFromDB(option.lfgID, user.userID, state);
        }

        this.typedEmit(event, user);
        return true;
    }

    private async insertNormalUserToDB(option: NormalLfgUserCreateOption, state: State) {
        return this.insertUserToDB("NORMAL", option, state) as Promise<NormalLfgUser>;
    }

    private async insertLongTermUserToDB(option: LongTermLfgUserCreateOption, state: State) {
        return this.insertUserToDB("LONG-TERM", option, state) as Promise<LongTermLfgUser>;
    }

    private async insertRegularUserToDB(option: RegularLfgUserCreateOption, state: State) {
        return this.insertUserToDB("REGULAR", option, state) as Promise<RegularLfgUser>;
    }

    private async insertUserToDB(type: LfgType, option: LfgUserCreateOption, state: State):
    Promise<NormalLfgUser | LongTermLfgUser | RegularLfgUser> {
        let entity;
        let getter;
        if (type == "NORMAL") {
            entity = NormalLfgUser;
            getter = this.getNormalUserByID;
        } else if (type == "LONG-TERM") {
            entity = LongTermLfgUser;
            getter = this.getLongTermUserByID;
        } else {
            entity = RegularLfgUser;
            getter = this.getRegularUserByID;
        }

        const result = await getRepository(entity)
            .createQueryBuilder()
            .insert()
            .into(entity)
            .values({
                lfg: { id: option.lfgID },
                userID: option.userID,
                userName: option.userName,
                userTag: option.userTag,
                state,
                timestamp: new Date().valueOf()
            })
            .execute();

        const { id } = result.identifiers[0];

        return getter(id);
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
            .createQueryBuilder()
            .where("ID = :id", { id })
            .getOne();
    }

    private async getLongTermUserByID(id: number) {
        return getRepository(LongTermLfgUser)
            .createQueryBuilder()
            .where("ID = :id", { id })
            .getOne();
    }

    private async getRegularUserByID(id: number) {
        return getRepository(RegularLfgUser)
            .createQueryBuilder()
            .where("ID = :id", { id })
            .getOne();
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
