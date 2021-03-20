import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBase64, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class OptionalChoiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class OptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => OptionalChoiceDto)
  options: OptionalChoiceDto[]

}
export class CreateProductDto {

  @ApiProperty({
    type: 'string',
    description: 'Image of the product (base64)',
    format: 'byte'
  })
  // TODO - Change to IsBase64()
  @IsString()
  image: string;

  @ApiProperty({
    type: 'string',
    description: 'Name of the product',
    format: 'string'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 2.5,
    description: 'Price of the Product',
    format: 'number'
  })
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiProperty({
    example: 'true',
    description: 'Availability of the product',
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
    type: [OptionalChoiceDto]
    })
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => OptionalChoiceDto)
  extras: OptionalChoiceDto[];

}
