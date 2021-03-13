import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { OptionalChoice, Product } from './schemas/product.model';
import { Category } from 'src/categories/schemas/category.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('OptionalChoice') private optchoiceModel: Model<OptionalChoice>){}
  async create(createProductDto: CreateProductDto) {
    const product = new this.productModel(createProductDto)
    product.extra = await Promise.all(createProductDto.extra!.map(async (value) => {
      const extra = new this.optchoiceModel(value)
      
      return (await extra.save())._id;
    }));

    product.options = await Promise.all(createProductDto.options!.map((value) => {
      return Promise.all(value.map(async (opt) => {
        const option = new this.optchoiceModel(opt)
        return (await option.save())._id;
      }));
    }));

    return product.save();
  }

  findByCategory(category: Category) {
    return this.productModel.find({category: category.id, deleted: false}).populate('extra').populate('options');
  }

  findAll() {
    return this.productModel.find({deleted: false}).populate('extra').populate('options');
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
