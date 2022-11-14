import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "REGULAR_LFG_STARTER" })
class RegularLfgStarter {
    @PrimaryGeneratedColumn(
        "increment",
        {
            name: "ID",
            type: "integer"
        }
    )
        id!: number;

    @Column({
        name: "USER_ID",
        type: "text"
    })
        userID!: string;

    @Column({
        name: "GUILD_ID",
        type: "text"
    })
        guildID!: string;
}

export default RegularLfgStarter;
