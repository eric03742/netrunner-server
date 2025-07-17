export interface MysqlConfig {
    mysql: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    }
}

export interface MeilisearchConfig {
    meilisearch: {
        host: string;
        port: number;
        password: string;
        secret: string;
    }
}
