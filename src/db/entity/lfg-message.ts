import {
    Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation
} from "typeorm";
import { LongTermLfg, NormalLfg, RegularLfg } from "./lfg.js";

@Check("TYPE = 'NORMAL' OR TYPE = 'THREAD_ROOT'")
class LfgMessage {
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
        nullable: true
    })
        threadID!: string;

    @Column({
        name: "MESSAGE_ID",
        type: "text",
        nullable: false
    })
        messageID!: string;

    @Column({
        name: "TYPE",
        type: "text",
        nullable: false
    })
        type!: "NORMAL" | "THREAD_ROOT";

    @Column({
        name: "RAW_TIMESTAMP",
        type: "integer",
        nullable: false
    })
        timestamp!: number;

    get date() {
        return new Date(this.timestamp);
    }
}

@Entity({ name: "NORMAL_LFG_MESSAGE" })
class NormalLfgMessage extends LfgMessage {
    @ManyToOne(
        (type) => NormalLfg,
        (lfg) => lfg.messages,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "id"
    })
        lfg: Relation<NormalLfg>;
}

@Entity({ name: "LONG_TERM_LFG_MESSAGE" })
class LongTermLfgMessage extends LfgMessage {
    @ManyToOne(
        (type) => LongTermLfg,
        (lfg) => lfg.messages,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "id"
    })
        lfg: Relation<LongTermLfg>;
}

@Entity({ name: "REGULAR_LFG_MESSAGE" })
class RegularLfgMessage extends LfgMessage {
    @ManyToOne(
        (type) => RegularLfg,
        (lfg) => lfg.messages,
        { onDelete: "CASCADE" }
    )
    @JoinColumn({
        name: "LFG_ID",
        referencedColumnName: "id"
    })
        lfg: Relation<RegularLfg>;
}

export { NormalLfgMessage, LongTermLfgMessage, RegularLfgMessage };
