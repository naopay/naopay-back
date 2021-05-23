import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as SchemaM } from 'mongoose'
import { Category } from 'src/categories/schemas/category.model';

@Schema()
export class Extra extends Document {
    @Prop({
        required: true
    })
    name: string;

    @Prop({
        required:true
    })
    price: number;

    @Prop({
        default: false
    })
    deleted: boolean;
}

@Schema()
export class Item extends Document {

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

    @Prop({ type: [{ type: SchemaM.Types.ObjectId, ref: 'Extra' }] })
    extras: Extra[]

    @Prop({default: Date.now})
    created: Date

}

export const ExtraSchema = SchemaFactory.createForClass(Extra)
export const ItemSchema = SchemaFactory.createForClass(Item)
