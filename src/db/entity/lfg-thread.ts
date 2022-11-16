import {
    Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation
} from "typeorm";
import { LongTermLfg, NormalLfg, RegularLfg } from "./lfg";

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
    @ManyToOne(
        (type) => NormalLfg,
        (lfg) => lfg.threads,
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
    @ManyToOne(
        (type) => LongTermLfg,
        (lfg) => lfg.threads,
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
    @ManyToOne(
        (type) => RegularLfg,
        (lfg) => lfg.threads,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "id"
    })
        lfg!: Relation<RegularLfg>;
}

export { NormalLfgThread, LongTermLfgThread, RegularLfgThread };
