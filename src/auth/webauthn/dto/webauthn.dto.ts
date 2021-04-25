import { IsNotEmpty, IsString } from "class-validator";
import { TokenPairAuth } from "src/auth/token/token.model";

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

export class SuccessLoginDto {

    @IsString()
    @IsNotEmpty()
    readonly cipher: string;

    @IsNotEmpty()
    readonly tokens: TokenPairAuth;

}
