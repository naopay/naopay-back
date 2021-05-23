import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtraSchema, ItemSchema } from './schemas/item.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Item', schema: ItemSchema },
      { name: 'Extra', schema: ExtraSchema }
    ])
  ],
  controllers: [ItemsController],
  providers: [
    ItemsService,
  ],
  exports: [ItemsService]
})
export class ItemsModule {}
