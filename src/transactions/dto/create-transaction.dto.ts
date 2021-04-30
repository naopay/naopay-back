import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


export class AmoutHandlerDto {
  @IsString()
  @IsNotEmpty()
  fiat: number;

  @IsString()
  @IsNotEmpty()
  nano: number;
}

export class ItemOrderDto {
  @ApiProperty({
      description: 'MongoDB ID of the item',
      format: 'string'
  })
  @IsMongoId()
  @IsNotEmpty()
  readonly item: string;

  @ApiProperty({
    description: 'Quantity of the item',
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
  readonly extras: string[]
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Array of the item order',
    type: [ItemOrderDto]
    })
  @ValidateNested({each: true})
  @Type(() => ItemOrderDto)
  readonly items: ItemOrderDto[];

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