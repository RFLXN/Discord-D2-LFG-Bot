import {
    Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { LongTermLfgUser, NormalLfgUser, RegularLfgUser } from "./lfg-user";
import { LongTermLfgThread, NormalLfgThread, RegularLfgThread } from "./lfg-thread";

abstract class BaseLfg {
    @PrimaryGeneratedColumn("increment", {
        name: "ID",
        type: "integer"
    })
        id!: number;

    @Column({
        name: "GUILD_ID",
        type: "text",
        nullable: false
    })
        guildID!: string;

    @Column({
        name: "ACTIVITY_NAME",
        type: "text",
        nullable: false
    })
        activityName!: string;

    @Column({
        name: "DESCRIPTION",
        type: "text",
        nullable: false
    })
        description!: string;
}

class DateLfg extends BaseLfg {
    @Column({
        name: "RAW_TIMESTAMP",
        type: "integer",
        nullable: false
    })
        timestamp!: number;

    public get date(): Date {
        return new Date(this.timestamp);
    }
}

@Entity({ name: "NORMAL_LFG" })
class NormalLfg extends DateLfg {
    @OneToMany((type) => NormalLfgUser, (user) => user.lfg)
        users: NormalLfgUser[];

    @OneToMany((type) => NormalLfgThread, (thread) => thread.lfg)
        threads: NormalLfgThread[];
}

@Entity({ name: "LONG_TERM_LFG" })
class LongTermLfg extends DateLfg {
    @OneToMany((type) => LongTermLfgUser, (user) => user.lfg)
        users: LongTermLfgUser[];

    @OneToMany((type) => LongTermLfgThread, (thread) => thread.lfg)
        threads: LongTermLfgThread[];
}

@Entity({ name: "REGULAR_LFG" })
class RegularLfg extends BaseLfg {
    @OneToMany((type) => RegularLfgUser, (user) => user.lfg)
        users: RegularLfgUser[];

    @OneToMany((type) => RegularLfgThread, (thread) => thread.lfg)
        threads: RegularLfgThread[];
}

export { NormalLfg, LongTermLfg, RegularLfg };
