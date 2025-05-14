import { Controller, Get, Param } from "@nestjs/common";

import { CardEntity } from "netrunner-entities";

import { CardService } from "./card.service";


@Controller("cards")
export class CardController {
    constructor(private readonly cardService: CardService) { }
    
    @Get()
    public async findAll(): Promise<Array<CardEntity>> {
        return this.cardService.findAll();
    }
    
    @Get(":id")
    public async findOne(@Param("id") id: string): Promise<CardEntity | null> {
        return this.cardService.findOne(id);
    }
}
