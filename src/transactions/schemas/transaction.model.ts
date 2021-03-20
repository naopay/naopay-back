import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Mongoose, Schema as SchemaM } from 'mongoose'
import { Product, OptionalChoice } from 'src/products/schemas/product.model';

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

export class ProductOrder extends Document {

    @Prop({required:true})
    @Prop({
        type: Product,
        ref: () => Product,
    })
    product: Product;

    @Prop({
        type: OptionalChoice,
        ref: () => OptionalChoice
    })
    extras: OptionalChoice[]
    
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
        type: ProductOrder
    })
    products: ProductOrder[]

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
