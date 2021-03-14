import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OptionalChoice, Product } from 'src/products/schemas/product.model';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './schemas/transaction.model';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel('Transaction') private transactionModel: Model<Transaction>){}

  create(createTransactionDto: CreateTransactionDto) {
    const transaction = new this.transactionModel(createTransactionDto);
    return transaction.save();
  }

  findAll() {
    return this.transactionModel
    .find()
    .populate({path:'products.product', select:'name category price', model: Product})
    .populate({path: 'products.extra', select: 'name price', model: OptionalChoice})
    .populate({path: 'products.options', select: 'name price', model: OptionalChoice});
  }

  findOne(id: number) {
    return this.transactionModel.findById(id);
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
