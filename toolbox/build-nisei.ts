import "reflect-metadata";
import fs from "fs/promises";
import path from "path";
import { stringify } from "csv-stringify/sync";
import { SnapshotEntity } from "netrunner-entities";

import { NetrunnerDataSource } from "./data-source";

const OUTPUT_FILENAME = path.resolve(__dirname, "../static/nisei_cards.csv");

async function initialize(): Promise<void> {
    await NetrunnerDataSource.initialize();
    console.log(`Database connected!`);
}

async function terminate(): Promise<void> {
    await NetrunnerDataSource.destroy();
}

async function extract(): Promise<void> {
    const format_codename = "standard";
    const snapshot_entity = await NetrunnerDataSource.manager.findOne(SnapshotEntity, {
        where: {
            format_codename: format_codename,
            active: true,
        },
        relations: {
            pool: {
                sets: {
                    cycle: true,
                    printings: {
                        card: {
                            type: true,
                            subtypes: true,
                            side: true,
                            faction: true,
                        },
                    },
                },
            }
        },
        order: {
            pool: {
                sets: {
                    release_date: "ASC",
                    printings: {
                        position: "ASC",
                    }
                },
            },
        },
    });
    
    if(!snapshot_entity) {
        throw new Error("No active snapshot for 'Standard' format found!");
    }
    
    const header = [
        "NRDB编号", "循环", "卡包", "序号",
        "英文名称", "名称", "文本", "风味文字",
        "阵营", "派系", "类型", "子类型", "是否独有",
        "构筑张数限制", "推进需求", "议案分数", "基础中转",
        "牌组最小张数", "牌组影响力上限", "费用", "强度",
        "内存费用", "销毁费用", "影响力费用", "卡图作者"
    ];
    
    const collector = new Array<Array<string>>();
    collector.push(header);
    for(const set of snapshot_entity.pool.sets) {
        for(const printing of set.printings) {
            const subtype_names = new Array<string>();
            for(const subtype of printing.card.subtypes) {
                subtype_names.push(subtype.locale_name);
            }
            
            const row = [
                printing.codename, set.cycle.locale_name, set.locale_name, printing.position.toString(),
                printing.card.oracle_title, printing.card.locale_title,
                printing.card.locale_text, printing.locale_flavor,
                printing.card.side.locale_name, printing.card.faction.locale_name,
                printing.card.type.locale_name, subtype_names.join(" - "),
                (printing.card.is_unique ? "是" : ""),
                (printing.card.deck_limit == undefined ? "" : printing.card.deck_limit.toString()),
                (printing.card.advancement_requirement == undefined ? "" : printing.card.advancement_requirement.toString()),
                (printing.card.agenda_point == undefined ? "" : printing.card.agenda_point.toString()),
                (printing.card.base_link == undefined ? "" : printing.card.base_link.toString()),
                (printing.card.minimum_deck_size == undefined ? "" : printing.card.minimum_deck_size.toString()),
                (printing.card.influence_limit == undefined ? "" : printing.card.influence_limit.toString()),
                (printing.card.cost == undefined ? "" : printing.card.cost.toString()),
                (printing.card.strength == undefined ? "" : printing.card.strength.toString()),
                (printing.card.memory_cost == undefined ? "" : printing.card.memory_cost.toString()),
                (printing.card.trash_cost == undefined ? "" : printing.card.trash_cost.toString()),
                (printing.card.influence_cost == undefined ? "" : printing.card.influence_cost.toString()),
                printing.illustrator
            ];
            
            collector.push(row);
        }
    }
    
    
    await fs.writeFile(OUTPUT_FILENAME, stringify(collector), "utf8");
    console.log(`Table '${OUTPUT_FILENAME}' created!`);
}

async function main(): Promise<void> {
    await initialize();
    await extract();
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
    });
