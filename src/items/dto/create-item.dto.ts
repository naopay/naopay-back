import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class ExtraDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateItemDto {

  @ApiProperty({
    type: 'string',
    description: 'Name of the item',
    format: 'string'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 2.5,
    description: 'Price of the item',
    format: 'number'
  })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiProperty({
    example: 'true',
    description: 'Availability of the item',
    format: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly available: boolean;

  @ApiProperty({
    description: 'MongoDB ID of the category',
    format: 'string'
  })
  @IsMongoId()
  @IsNotEmpty()
  readonly category: string;

  @ApiProperty({
    description: 'Array of the extra [{name:big, price: 0.5}, ...]',
    type: [ExtraDto]
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExtraDto)
  extras: ExtraDto[];

}
