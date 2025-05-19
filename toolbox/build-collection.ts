import "reflect-metadata";
import fs from "fs/promises";
import path from "path";
import { stringify } from "csv-stringify/sync";
import { PrintingEntity } from "netrunner-entities";

import { NetrunnerDataSource } from "./data-source";

const OUTPUT_FILENAME = path.resolve(__dirname, "../static/all_cards.csv");

async function initialize(): Promise<void> {
    await NetrunnerDataSource.initialize();
    console.log(`Database connected!`);
}

async function terminate(): Promise<void> {
    await NetrunnerDataSource.destroy();
}

async function extract(): Promise<void> {
    const printing_entities = await NetrunnerDataSource.manager.find(PrintingEntity, {
        relations: {
            card: {
                type: true,
                subtypes: true,
                side: true,
                faction: true,
            },
            set: {
                cycle: true,
            }
        },
        order: {
            codename: "ASC",
        },
    });
    
    
    const header = [
        "NRDB编号", "序号",
        "英文循环名", "中文循环名",
        "英文卡包名","中文卡包名",
        "英文名称", "中文名称",
        "英文文本", "中文文本",
        "英文风味文字", "中文风味文字",
        "英文阵营", "中文阵营",
        "英文派系", "中文派系",
        "英文类型", "中文类型",
        "英文子类型", "中文子类型",
        "是否独有",
        "构筑张数限制", "推进需求", "议案分数", "基础中转",
        "牌组最小张数", "牌组影响力上限", "费用", "强度",
        "内存费用", "销毁费用", "影响力费用", "卡图作者"
    ];
    
    const collector = new Array<Array<string>>();
    collector.push(header);
    for(const printing of printing_entities) {
        const oracle_subtypes = new Array<string>();
        const locale_subtypes = new Array<string>();
        for(const subtype of printing.card.subtypes) {
            oracle_subtypes.push(subtype.oracle_name);
            locale_subtypes.push(subtype.locale_name);
        }
        
        const row = [
            printing.codename, printing.position.toString(),
            printing.set.cycle.oracle_name, printing.set.cycle.locale_name,
            printing.set.oracle_name, printing.set.locale_name,
            printing.card.oracle_title, printing.card.locale_title,
            printing.card.oracle_text, printing.card.locale_text,
            printing.oracle_flavor, printing.locale_flavor,
            printing.card.side.oracle_name, printing.card.side.locale_name,
            printing.card.faction.oracle_name, printing.card.faction.locale_name,
            printing.card.type.oracle_name, printing.card.type.locale_name,
            oracle_subtypes.join(" - "), locale_subtypes.join(" - "),
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
