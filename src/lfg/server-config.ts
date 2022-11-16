import { ServerLfgConfig } from "../db/entity/server-lfg-config";
import { getRepository } from "../db/typeorm";

let configs: ServerLfgConfig[] = [];

const loadLfgServerConfigs = async () => {
    configs = await getRepository(ServerLfgConfig)
        .createQueryBuilder()
        .getMany();
};

const getLfgServerConfig = (guildID: string) => configs.find((cfg) => cfg.guildID == guildID);

const addServerConfig = (guildID: string, options: Partial<Omit<ServerLfgConfig, "guildID" | "id">>) => {
    const idx = configs.findIndex((cfg) => cfg.guildID == guildID);

    if (idx == -1) {
        getRepository(ServerLfgConfig)
            .createQueryBuilder()
            .insert()
            .into(ServerLfgConfig)
            .values({ guildID, ...options })
            .execute()
            .then((result) => result.identifiers[0].id as number)
            .then((id) => getRepository(ServerLfgConfig)
                .createQueryBuilder()
                .where("ID = :id", { id })
                .getOne())
            .then((config) => configs.push(config));
    } else {
        for (const key of Object.keys(options) as (keyof typeof options)[]) {
            if (options[key]) {
                if (configs[idx]) {
                    (configs[idx][key] as string | number | undefined) = options[key];
                }
            }
        }

        getRepository(ServerLfgConfig)
            .createQueryBuilder()
            .update()
            .set({ ...options })
            .where("GUILD_ID = :guildID", { guildID })
            .execute();
    }
};

export { loadLfgServerConfigs, getLfgServerConfig, addServerConfig };
