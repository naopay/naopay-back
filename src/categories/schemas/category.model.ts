import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {Document} from 'mongoose'

@Schema()
export class Category extends Document {

    @Prop({
        required: true
    })
    name: string

    @Prop({
        required: true
    })
    color: number

    @Prop({
        default: false
    })
    deleted: boolean
    
    @Prop({default: Date.now})
    created: Date

}


export const CategorySchema = SchemaFactory.createForClass(Category)