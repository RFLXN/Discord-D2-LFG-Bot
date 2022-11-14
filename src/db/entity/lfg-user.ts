import {
    Check, Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { JoinColumn } from "typeorm/browser";
import { LongTermLfg, NormalLfg, RegularLfg } from "./lfg";

@Check("\"STATE\" = 'JOIN' OR \"STATE\" = 'ALTER'  OR \"STATE\" = 'CREATOR'")
class LfgUser {
    @PrimaryGeneratedColumn("increment", { name: "ID" })
        id!: number;

    @Column({
        name: "USER_ID",
        type: "text",
        nullable: false
    })
        userID!: string;

    @Column({
        name: "USER_NAME",
        type: "text",
        nullable: false
    })
        userName!: string;

    @Column({
        name: "USER_TAG",
        type: "text",
        nullable: false
    })
        userTag!: string;

    @Column({
        name: "STATE",
        type: "text",
        nullable: false
    })
        state!: "JOIN" | "ALTER" | "CREATOR";

    @Column({
        name: "STATE_CHANGE_RAW_TIMESTAMP",
        type: "integer",
        nullable: false
    })
        timestamp!: number;

    get date() {
        return new Date(this.timestamp);
    }
}

@Entity({ name: "NORMAL_LFG_USER" })
class NormalLfgUser extends LfgUser {
    @ManyToOne(
        (type) => NormalLfg,
        (lfg) => lfg.users,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "ID"
    })
        lfg!: NormalLfg;
}

@Entity({ name: "LONG_TERM_LFG_USER" })
class LongTermLfgUser extends LfgUser {
    @ManyToOne(
        (type) => LongTermLfg,
        (lfg) => lfg.users,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "ID"
    })
        lfg!: LongTermLfg;
}

@Entity({ name: "REGULAR_LFG_USER" })
class RegularLfgUser extends LfgUser {
    @ManyToOne(
        (type) => RegularLfg,
        (lfg) => lfg.users,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "ID"
    })
        lfg!: RegularLfg;
}

export { NormalLfgUser, LongTermLfgUser, RegularLfgUser };
