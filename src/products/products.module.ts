import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OptionalChoiceSchema, ProductSchema } from './schemas/product.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }, {name: 'OptionalChoice', schema: OptionalChoiceSchema}])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
