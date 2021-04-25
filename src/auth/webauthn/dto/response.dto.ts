import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class ResponseDto {
    @IsOptional()
    @IsString()
    readonly attestationObject: string;

    @IsNotEmpty()
    readonly clientDataJSON: string;

    @IsOptional()
    @IsString()
    readonly authenticatorData: string;
    
    @IsOptional()
    @IsString()
    readonly signature: string;

    @IsOptional()
    @IsString()
    readonly userHandle: string;
}

export class WebAuthnResponseDto {
    @IsString()
    @IsNotEmpty()
    readonly rawId: string;

    @ValidateNested()
    @IsNotEmpty()
    @Type(() => ResponseDto)
    readonly response: ResponseDto;

    @IsNotEmpty()
    readonly id: string;

    @IsNotEmpty()
    readonly type: string;

    readonly username:string;

}