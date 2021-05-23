import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Extra, Item } from 'src/items/schemas/item.model';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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
    .populate({path:'items.item', select:'name category price', model: Item})
    .populate({path: 'items.extras', select: 'name price', model: Extra});
  }

  findOne(id: number) {
    return this.transactionModel.findById(id);
  }
}
