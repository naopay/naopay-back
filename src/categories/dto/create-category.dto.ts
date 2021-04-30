import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({
        type: 'string',
        description: 'Name of the category',
        format: 'string'
      })
      @IsNotEmpty()
      @IsString()
      readonly name: string;
    
      @ApiProperty({
        example: '1',
        description: 'Index front color of the category',
        format: 'number'
      })
      @IsNotEmpty()
      @IsNumber()
      readonly color: number;
}
