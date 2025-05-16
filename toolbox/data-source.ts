import "reflect-metadata";
import { DataSource } from "typeorm";

import {
    SideEntity, FactionEntity, TypeEntity, SubtypeEntity,
    SettypeEntity, CycleEntity, SetEntity,
    FormatEntity, PoolEntity, RestrictionEntity, SnapshotEntity,
    CardEntity, PrintingEntity, RulingEntity,
} from "netrunner-entities";

const DATABASE_FILENAME = "db/netrunner.sqlite";

export const NetrunnerDataSource = new DataSource({
    database: DATABASE_FILENAME,
    type: "better-sqlite3",
    logging: [
        "error", "warn", "info", "log",
    ],
    entities: [
        SideEntity, FactionEntity, TypeEntity, SubtypeEntity,
        SettypeEntity, CycleEntity, SetEntity,
        FormatEntity, PoolEntity, RestrictionEntity, SnapshotEntity,
        CardEntity, PrintingEntity, RulingEntity
    ],
    prepareDatabase: db => {
        db.pragma('journal_mode = WAL');
    },
});
