import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


export class AmoutHandlerDto {
  @IsNumber()
  @IsNotEmpty()
  fiat: number;

  @IsNumber()
  @IsNotEmpty()
  nano: number;
}

export class ProductOrderDto {
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
  @IsOptional()
  @IsArray()
  readonly extra: string[]
  
  @ApiProperty({
    description: 'List ID of options price for the sum'
  })
  @IsOptional()
  @IsArray()
  readonly options: string[]
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Array of the product order',
    type: [ProductOrderDto]
    })
  @ValidateNested({each: true})
  @Type(() => ProductOrderDto)
  readonly products: ProductOrderDto[];

  @ApiProperty({
    description: 'Public address of the sender',
    format: 'string'
    })
  @IsNotEmpty()
  @IsString()
  readonly sender: string

  @ApiProperty({
    description: 'Public address of the receiver',
    format: 'string'
    })
    @IsNotEmpty()
  @IsString()
  readonly receiver: string

  @ApiProperty({
    description: 'txid of the transaction',
    format: 'string'
    })
  @IsString()
  @IsNotEmpty()
  readonly txid: string

  @ApiProperty({
    description: 'total in nano and fiat',
    type: AmoutHandlerDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AmoutHandlerDto)
  total: AmoutHandlerDto
}