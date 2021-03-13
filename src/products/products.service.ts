import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.model';
import { Category } from 'src/categories/schemas/category.model';

@Injectable()
export class ProductsService {
  constructor(@InjectModel('Product') private productModel: Model<Product>){}
  create(createProductDto: CreateProductDto) {
    const product = new this.productModel(createProductDto)
    return product.save();
  }

  findByCategory(category: Category) {
    return this.productModel.find({category: category.id, disabled: false});
  }

  findAll() {
    return this.productModel.find({disabled:false});
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
