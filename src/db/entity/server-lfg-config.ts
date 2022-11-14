import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "SERVER_LFG_CONFIG" })
class ServerLfgConfig {
    @PrimaryGeneratedColumn("increment", {
        name: "ID",
        type: "integer"
    })
        id!: number;

    @Column({
        name: "GUILD_ID",
        type: "text",
        nullable: false,
        unique: true
    })
        guildID!: string;

    @Column({
        name: "NORMAL_LFG_THREAD_CHANNEL",
        type: "text"
    })
        normalLfgThreadChannel!: string;

    @Column({
        name: "LONG_TERM_LFG_THREAD_CHANNEL",
        type: "text"
    })
        longTermLfgThreadChannel!: string;

    @Column({
        name: "REGULAR_LFG_THREAD_CHANNEL",
        type: "text"
    })
        regularLfgThreadChannel!: string;

    @Column({
        name: "NORMAL_LFG_LIST_CHANNEL",
        type: "text"
    })
        normalLfgListChannel!: string;

    @Column({
        name: "LONG_TERM_LFG_LIST_CHANNEL",
        type: "text"
    })
        longTermLfgListChannel!: string;

    @Column({
        name: "REGULAR_LFG_LIST_CHANNEL",
        type: "text"
    })
        regularLfgListChannel!: string;

    @Column({
        name: "EXPIRED_LFG_DELETE_DELAY",
        type: "integer"
    })
        expiredLfgDeleteDelay!: number;
}

export { ServerLfgConfig };
