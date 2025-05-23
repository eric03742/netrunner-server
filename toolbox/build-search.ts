import "reflect-metadata";

import dotenv from "dotenv";
import { Meilisearch } from "meilisearch";
import { CardEntity } from "netrunner-entities";
import { NetrunnerDataSource } from "./data-source";

interface MeilisearchEnv {
    MEILISEARCH_HOST: string;
    MEILISEARCH_PORT: string;
    MEILISEARCH_DATABASE: string;
    MEILISEARCH_KEY: string;
}

class Document {
    public constructor(
        readonly id: number,
        readonly codename: string,
        readonly oracle_title: string,
        readonly locale_title: string,
    ) { }
}

dotenv.config();
const config = process.env as unknown as MeilisearchEnv;
const client = new Meilisearch({
    host: `http://${config.MEILISEARCH_HOST}:${config.MEILISEARCH_PORT}`,
    apiKey: config.MEILISEARCH_KEY,
});

async function initialize(): Promise<void> {
    const healthy = await client.isHealthy();
    if(!healthy) {
        throw new Error("Meilisearch is unavailable!");
    }

    await NetrunnerDataSource.initialize();
    console.log(`Database connected!`);
}

async function terminate(): Promise<void> {
    await NetrunnerDataSource.destroy();
}

async function extract(): Promise<void> {
    const indexes = await client.getRawIndexes();
    let initialized = false;
    for(const result of indexes.results) {
        if(result.uid === config.MEILISEARCH_DATABASE) {
            initialized = true;
            break;
        }
    }

    if(!initialized) {
        await client.createIndex(config.MEILISEARCH_DATABASE, { primaryKey: "id" }).waitTask();
    }

    const index = await client.getIndex(config.MEILISEARCH_DATABASE);
    await index.deleteAllDocuments().waitTask();
    await index.updateSearchableAttributes([
        "oracle_title", "locale_title"
    ]).waitTask();
    await index.updateTypoTolerance({
        enabled: false
    }).waitTask();
    const entities = await NetrunnerDataSource.manager.find(CardEntity, {
        select: [
            "id", "codename", "oracle_title", "locale_title"
        ]
    });

    const documents = new Array<Document>();
    for(const e of entities) {
        const document = new Document(e.id, e.codename, e.oracle_title, e.locale_title);
        documents.push(document);
    }

    const task = await index.addDocuments(documents).waitTask();
    if(task.status !== "succeeded") {
        throw new Error(`Failed to add documents: ${(task.error ? task.error.message : "Unknown error")}!`);
    }

    const total = documents.length;
    const actual = task.details!.indexedDocuments!
    console.log(`Add documents: Total ${total}, Actual ${actual}!`);
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
