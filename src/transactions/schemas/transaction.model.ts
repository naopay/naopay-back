import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as SchemaM } from 'mongoose'
import { Item, ExtraChoice } from 'src/items/schemas/item.model';

export class AmoutHandler extends Document {
    @Prop({
        required:true
    })
    fiat: string;

    @Prop({
        required:true
    })
    nano: string;
}

export class ItemOrder extends Document {

    @Prop({required:true})
    @Prop({
        type: Item,
        ref: () => Item,
    })
    item: Item;

    @Prop({
        type: ExtraChoice,
        ref: () => ExtraChoice
    })
    extras: ExtraChoice[]
    
    @Prop({
        required: true
    })
    quantity: number
}

@Schema()
export class Transaction extends Document {

    @Prop({
        required: true,
        type: AmoutHandler
    })
    total: AmoutHandler

    @Prop({
        required:true,
        type: ItemOrder
    })
    items: ItemOrder[]

    @Prop({
        required:true
    })
    sender: string

    @Prop({
        required:true
    })
    receiver: string

    @Prop({
        required: true
    })
    txid: string;

    @Prop({
        type: SchemaM.Types.ObjectId,
        ref: 'Transaction'
    })
    refund : number


    @Prop({default: Date.now})
    created: Date

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
