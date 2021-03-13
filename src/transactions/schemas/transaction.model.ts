import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Mongoose, Schema as SchemaM } from 'mongoose'
import { Product } from 'src/products/schemas/product.model';

export class AmoutHandler extends Document {
    @Prop({
        required:true
    })
    fiat: number;

    @Prop({
        required:true
    })
    nano: number;
}

export class ProductOrder extends Document {
    @Prop({
        required: true,
        type: Product
    })
    product: Product;

    @Prop({
        required: true
    })
    quantity: number

    @Prop({
        required: true,
        type: AmoutHandler
    })
    price: AmoutHandler
}

@Schema()
export class Transaction extends Document {

    @Prop({
        required: true,
        type: AmoutHandler
    })
    total: AmoutHandler

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
