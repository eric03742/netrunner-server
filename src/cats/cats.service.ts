import { Injectable } from "@nestjs/common";
import { Cat } from "./cats.model";

@Injectable()
export class CatsService {
    private readonly cats: Array<Cat> = new Array<Cat>();
    
    public create(cat: Cat) {
        this.cats.push(cat);
    }
    
    public findAll(): Array<Cat> {
        return this.cats;
    }
}
