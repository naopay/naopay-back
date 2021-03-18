import { IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    readonly username: string;

    @IsString()
    @IsNotEmpty()
    readonly cipher: string;

    id: string

}

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    readonly username: string;
}