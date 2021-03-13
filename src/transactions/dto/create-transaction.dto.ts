import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";

export class ProductOrder {
  @ApiProperty({
      description: 'MongoDB ID of the product',
      format: 'string'
  })
  @IsMongoId()
  @IsNotEmpty()
  readonly product: string;

  @ApiProperty({
    description: 'Quantity of the product',
    format: 'number'
  })
  @IsNumber()
  @IsNotEmpty()
  readonly quantity: number

  @ApiProperty({
    description: 'List ID of extra price'
  })
  @IsArray()
  readonly extra: string[]
  
  @ApiProperty({
    description: 'List ID of extra price for the sum'
  })
  @IsArray()
  readonly options: string[]
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Array of the product order',
    type: [ProductOrder]
    })
  @ValidateNested({each: true})
  @Type(() => ProductOrder)
  readonly products: ProductOrder[];
}