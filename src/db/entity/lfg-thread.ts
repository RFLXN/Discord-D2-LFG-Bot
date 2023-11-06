import {
    Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation
} from "typeorm";
import { LongTermLfg, NormalLfg, RegularLfg } from "./lfg.js";

class LfgThread {
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
        name: "CHANNEL_ID",
        type: "text",
        nullable: false
    })
        channelID!: string;

    @Column({
        name: "THREAD_ID",
        type: "text",
        nullable: false
    })
        threadID!: string;
}

@Entity({ name: "NORMAL_LFG_THREAD" })
class NormalLfgThread extends LfgThread {
    @OneToOne(
        (type) => NormalLfg,
        (lfg) => lfg.thread,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "id"
    })
        lfg!: Relation<NormalLfg>;
}

@Entity({ name: "LONG_TERM_LFG_THREAD" })
class LongTermLfgThread extends LfgThread {
    @OneToOne(
        (type) => LongTermLfg,
        (lfg) => lfg.thread,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "id"
    })
        lfg!: Relation<LongTermLfg>;
}

@Entity({ name: "REGULAR_LFG_THREAD" })
class RegularLfgThread extends LfgThread {
    @OneToOne(
        (type) => RegularLfg,
        (lfg) => lfg.thread,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "id"
    })
        lfg!: Relation<RegularLfg>;
}

export { NormalLfgThread, LongTermLfgThread, RegularLfgThread };
