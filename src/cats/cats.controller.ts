import { Body, Controller, Get, Post } from "@nestjs/common";
import { CatsService } from "./cats.service";
import { Cat } from "./cats.model";

@Controller("cats")
export class CatsController {
    constructor(private catsService: CatsService) { }
    
    @Get()
    async findAll(): Promise<Array<Cat>> {
        return this.catsService.findAll();
    }
    
    // @Get(":id")
    // findOne(@Param("id") id: string): string {
    //     return `One Cat: #${id}!`;
    // }
    
    @Post()
    async create(@Body() cat: Cat): Promise<void> {
        this.catsService.create(cat);
    }
}
