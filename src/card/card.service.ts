import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { CardEntity } from "netrunner-entities";


@Injectable()
export class CardService {
    constructor(@InjectRepository(CardEntity) private readonly cardRepository: Repository<CardEntity>) { }
    
    public findAll(): Promise<Array<CardEntity>> {
        return this.cardRepository.find();
    }
    
    public findOne(id: string): Promise<CardEntity | null> {
        return this.cardRepository.findOneBy({
            codename: id,
        });
    }
}
