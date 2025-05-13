import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

import { CatsModule } from "./cats/cats.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
    imports: [
        CatsModule,
        ServeStaticModule.forRoot({
            rootPath: "static",
            serveRoot: "/static",
            serveStaticOptions: {
                cacheControl: true,
                immutable: true,
                maxAge: 864000000,
            },
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
