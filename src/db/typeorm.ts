import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { DB_FILE_PATH } from "./sqlite.js";
import index from "./entity/index.js";

let db: undefined | DataSource;

const connectDB = async (): Promise<DataSource> => {
    console.log("Connecting DB...");
    const connection = await new DataSource({
        type: "sqlite",
        database: DB_FILE_PATH,
        entities: index
    }).initialize();
    db = connection;
    console.log("Successfully Connected DB.");
    return connection;
};

const getDB = async () => {
    if (!db) {
        db = await connectDB();
    }
    return db;
};

const getRepository = <T>(entity: { new(): T }): Repository<T> => {
    if (!db) throw new Error("DB Not Connected.");

    return db.getRepository<T>(entity);
};

const getQueryBuilder = <T>(entity?: { new(): T }): SelectQueryBuilder<T> => {
    if (!db) throw new Error("DB Not Connected.");

    if (!entity) return db.createQueryBuilder();

    return getRepository<T>(entity)
        .createQueryBuilder();
};

const disconnectDB = async () => {
    if (db) {
        console.log("Disconnecting DB...");
        await db.destroy();
        console.log("DB Disconnected.");
    }
};

export {
    connectDB, getDB, disconnectDB, getRepository, getQueryBuilder
};
