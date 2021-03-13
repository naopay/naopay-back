import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Document } from 'mongoose'
import * as fs from 'fs';
import { v4 as uuid } from 'uuid'
import { Category } from 'src/categories/schemas/category.model';

@Schema({_id: true})
export class OptionalChoice extends Document {
    @Prop({
        required: true
    })
    name: string;

    @Prop({
        required:true
    })
    price: number;
}

@Schema()
export class Product extends Document {
    @Prop({
        required: true
    })
    image: string

    @Prop({
        required: true
    })
    name: string

    @Prop({
        required: true,
    })
    price: number
    
    @Prop({
        required: true
    })
    available: boolean;

    @Prop({
        default: false
    })
    deleted: boolean;

    @Prop({
        required:true,
        type: Category
    })
    category : Category

    @Prop({type: OptionalChoice})
    extra: [OptionalChoice]
    
    @Prop({type: OptionalChoice})
    options: OptionalChoice[][]

    @Prop({default: Date.now})
    created: Date

}

export const OptionalChoiceSchema = SchemaFactory.createForClass(OptionalChoice)
export const ProductSchema = SchemaFactory.createForClass(Product)

ProductSchema.pre('save', async function (next) {
    // TODO - Retirer return
    return next();

    try {
        if (!this.isModified('image')) {
            return next();
        }
        const fileName = uuid();
        await fs.writeFile('img/' + fileName + '.png', this['image'], 'base64', function(err) {
            if (err) console.log(err);
        });
        this['image'] = fileName;
        return next();
    } catch (err) {
        return next(err);
    }
})
