import loadConfig from "./config/config.loader";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
import { MysqlConfig } from "./config/config.model";


@Module({
    imports: [
        ConfigModule.forRoot({
            load: [ loadConfig ],
        }),
        ServeStaticModule.forRoot({
            rootPath: "static",
            serveRoot: "/static",
            serveStaticOptions: {
                cacheControl: true,
                immutable: true,
                maxAge: 864000000,
            },
        }),
        TypeOrmModule.forRootAsync({
            imports: [ ConfigModule ],
            inject: [ ConfigService ],
            useFactory: (configService: ConfigService<MysqlConfig, true>) => {
                const config = configService.get("mysql", { infer: true });
                return {
                    type: "mysql",
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    password: config.password,
                    database: config.database,
                    logging: [
                        "error", "warn", "info", "log",
                    ],
                    entities: [
                        SideEntity, FactionEntity, TypeEntity, SubtypeEntity,
                        SettypeEntity, CycleEntity, SetEntity,
                        FormatEntity, PoolEntity, RestrictionEntity, SnapshotEntity,
                        CardEntity, PrintingEntity, RulingEntity,
                    ],
                };
            }
        }),
        CatsModule,
        CardModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
