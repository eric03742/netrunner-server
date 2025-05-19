import "reflect-metadata";
import fs from "fs";
import path from "path";
import { EntityTarget } from "typeorm";

import {
    BaseEntity, SideEntity, FactionEntity, TypeEntity, SubtypeEntity,
    SettypeEntity, CycleEntity, SetEntity,
    FormatEntity, PoolEntity, RestrictionEntity, SnapshotEntity,
    CardEntity, PrintingEntity, RulingEntity,
} from "netrunner-entities";

import { NetrunnerDataSource } from "./data-source";

const OUTPUT_FOLDER = path.resolve(__dirname, "../static/card-texts");

async function initialize(): Promise<void> {
    await NetrunnerDataSource.initialize();
    console.log(`Database connected!`);
}

async function terminate(): Promise<void> {
    await NetrunnerDataSource.destroy();
}

async function extract<T extends BaseEntity>(type: EntityTarget<T>, filename: string): Promise<void> {
    const database = NetrunnerDataSource.getRepository(type);
    const items = await database.find();
    const content = JSON.stringify(items, (k, v) => {
        if(k === "id") {
            return undefined;
        }

        if(k.endsWith("codenames")) {
            return (v && v.length > 0 ) ? v.split(",") : [];
        }

        return v;
    }, 2);
    fs.writeFileSync(path.join(OUTPUT_FOLDER, filename + ".json"), content, "utf8");
    console.log(`Save '${filename}' finished!`);
}

async function main(): Promise<void> {
    await initialize();
    await extract(SideEntity, "sides");
    await extract(FactionEntity, "factions");
    await extract(TypeEntity, "types");
    await extract(SubtypeEntity, "subtypes");
    await extract(SettypeEntity, "settypes");
    await extract(CycleEntity, "cycles");
    await extract(SetEntity, "sets");
    await extract(FormatEntity, "formats");
    await extract(PoolEntity, "pools");
    await extract(RestrictionEntity, "restrictions");
    await extract(SnapshotEntity, "snapshots");
    await extract(CardEntity, "cards");
    await extract(PrintingEntity, "printings");
    await extract(RulingEntity, "rulings");
}

main()
    .then(() => {
        console.log("Finished!");
    })
    .catch((err: Error) => {
        console.error("Failed with error: " + err.message);
        console.error("Stacktrace: " + err.stack);
    })
    .finally(async () => {
        await terminate();
    })
;
