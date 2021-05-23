import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateItemDto } from './dto/create-item.dto';
import { Extra, Item } from './schemas/item.model';
import { Category } from 'src/categories/schemas/category.model';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel('Item') private itemModel: Model<Item>,
    @InjectModel('Extra') private extraModel: Model<Extra>) { }
  async create(createItemDto: CreateItemDto) {
    const item = new this.itemModel(createItemDto)
    if (createItemDto.extras) {
      item.extras = await Promise.all(createItemDto.extras?.map(async (value) => {
        const extra = new this.extraModel(value)

        return (await extra.save())._id;
      }));
    }

    return item.save();
  }

  findByCategory(category: Category): Promise<Item[]> {
    return this.itemModel.find({ category: category.id, deleted: false }).populate('extras').exec();
  }

  removeByCategory(category: Category) {
    return this.itemModel.updateMany({ category: category.id }, { deleted: true });
  }

  findAll(): Promise<Item[]> {
    return this.itemModel.find({ deleted: false }).populate('extras').exec();
  }

  findOne(id: string): Promise<Item> {
    return this.itemModel.findById(id).populate('extras').exec();
  }

  async remove(id: string) {
    const item = await this.itemModel.findById(id);
    if (!item) throw new BadRequestException("Item not found");
    item.deleted = true;
    await item.save();
  }

  async removeExtra(itemID: string, extraID: string) {
    const item = await this.findOne(itemID);
    if (!item) throw new BadRequestException("Item not found");

    const itemExtra = item.extras.find(extra => extra.id === extraID);
    if (!itemExtra) throw new BadRequestException("Extra does not exist in this item");

    const extra = await this.extraModel.findById(itemExtra.id);
    if (!extra) throw new BadRequestException("Extra not found");

    extra.deleted = true;
    await extra.save();
    item.extras = item.extras.filter(extra => extra._id !== itemExtra.id)
    item.markModified("extras");
    await item.save();
  }
}
