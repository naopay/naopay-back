import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from 'src/products/products.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schemas/category.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<Category>,
    private productService: ProductsService
    ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const category = new this.categoryModel(createCategoryDto)
    return category.save();
  }

  async findProductsByCategory(id: string) {
    const category: Category = await this.categoryModel.findById(id);
    if (!category) throw new BadRequestException("Category not found");
    return this.productService.findByCategory(category);
  }

  findAll() {
    return this.categoryModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
