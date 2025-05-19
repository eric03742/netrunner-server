import "reflect-metadata";
import fs from "fs";
import path from "path";

import { PrintingEntity } from "netrunner-entities";

import { NetrunnerDataSource } from "./data-source";

const IMAGE_SIZE = [
    "tiny", "small", "medium", "large",
];
const IMAGE_URL = "https://card-images.netrunnerdb.com/v2";
const OUTPUT_FOLDER = path.resolve(__dirname, "../static/card-scans");

let exist_count = 0;
let download_count = 0;
let failed_count = 0;

async function initialize(): Promise<void> {
    await NetrunnerDataSource.initialize();
    console.log(`Database connected!`);

    exist_count = 0;
    download_count = 0;
    failed_count = 0;
}

async function terminate(): Promise<void> {
    await NetrunnerDataSource.destroy();
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function download(codename: string, face: number = -1): Promise<void> {
    const filename = (face >= 0) ? `${codename}-${face}.jpg` : `${codename}.jpg`;
    for(const size of IMAGE_SIZE) {
        const url =`${IMAGE_URL}/${size}/${filename}`;
        const address = path.join(OUTPUT_FOLDER, size, filename);
        if(fs.existsSync(address)) {
            exist_count += 1;
            continue;
        }
        
        const result = await fetch(url);
        if(result.ok) {
            const buffer = await result.bytes();
            fs.writeFileSync(address, buffer);
            await sleep(100);
            console.info(`Downloaded: ${size}/${filename}!`);
            download_count += 1;
        } else {
            console.error(`Failed: ${size}/${filename}!`);
            failed_count += 1;
        }
    }
}

async function extract(): Promise<void> {
    const repository = NetrunnerDataSource.getRepository(PrintingEntity);
    const entries = await repository.find({
        select: [
            "codename", "extra_face",
        ],
        relations: [
            "card",
        ],
    });
    for(const e of entries) {
        await download(e.codename);
        if(e.extra_face > 0) {
            for(let i = 0; i < e.extra_face; ++i) {
                await download(e.codename, i);
            }
        } else if(e.card.extra_face > 0) {
            for(let i = 0; i < e.card.extra_face; ++i) {
                await download(e.codename, i);
            }
        }
    }
    
    console.log(`Total: ${exist_count} Skipped, ${download_count} Downloaded, ${failed_count} Failed!`);
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
