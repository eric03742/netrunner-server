import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
    SideEntity, FactionEntity, TypeEntity, SubtypeEntity,
    SettypeEntity, CycleEntity, SetEntity,
    FormatEntity, PoolEntity, RestrictionEntity, SnapshotEntity,
    CardEntity, PrintingEntity, RulingEntity,
} from "netrunner-entities";

import { CardModule } from "./card/card.module";
import { CatsModule } from "./cats/cats.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";


@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: "static",
            serveRoot: "/static",
            serveStaticOptions: {
                cacheControl: true,
                immutable: true,
                maxAge: 864000000,
            },
        }),
        TypeOrmModule.forRoot({
            type: "better-sqlite3",
            database: "db/netrunner.sqlite",
            logging: [
                "error", "warn", "info", "log",
            ],
            entities: [
                SideEntity, FactionEntity, TypeEntity, SubtypeEntity,
                SettypeEntity, CycleEntity, SetEntity,
                FormatEntity, PoolEntity, RestrictionEntity, SnapshotEntity,
                CardEntity, PrintingEntity, RulingEntity,
            ],
            prepareDatabase: db => {
                db.pragma('journal_mode = WAL');
            },
        }),
        CatsModule, CardModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
