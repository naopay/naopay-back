import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemsService } from 'src/items/items.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './schemas/category.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<Category>,
    private itemsService: ItemsService
  ) { }

  create(createCategoryDto: CreateCategoryDto) {
    const category = new this.categoryModel(createCategoryDto)
    return category.save();
  }

  async findItemsByCategory(id: string) {
    const category: Category = await this.categoryModel.findById(id);
    if (!category) throw new BadRequestException("Category not found");
    return this.itemsService.findByCategory(category);
  }

  findAll() {
    return this.categoryModel.find({deleted: false});
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id);
    if (!category) { throw new BadRequestException("Category not found"); }
    category.deleted = true;
    await Promise.all([category.save(), this.itemsService.removeByCategory(category)])
  }
}
