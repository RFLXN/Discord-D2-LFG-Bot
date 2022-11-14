import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "BOT_ADMIN" })
class BotAdmin {
    @PrimaryGeneratedColumn("increment", {
        name: "ID",
        type: "integer"
    })
        id!: number;

    @Column({
        name: "USER_ID",
        type: "text"
    })
        userID!: string;
}

export { BotAdmin };
