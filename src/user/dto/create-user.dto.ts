import { IsNotEmpty, IsString, Matches, MinLength, MaxLength, IsEmail, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(25)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(25)
    lastName: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character or number.',
    })
    password: string;


    @IsString()
    @MinLength(8)
    @MaxLength(40)
    @Matches(/^([a-zA-Z0-9._%+-]+)@gmail\.com$/, {
        message: 'Email must be a valid Gmail address (e.g., example@gmail.com).',
    })
    email: string;

}
