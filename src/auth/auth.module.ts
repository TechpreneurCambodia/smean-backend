import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersRepository } from "./users.repository";
import { User } from "./user.entity";
import { DataSource } from "typeorm";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt-strategy";
import { GoogleStrategy } from "./utils/google-strategy";
import { SessionSerializer } from "./utils/serializer";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: "smeanSecret04",
      signOptions: {
        expiresIn: 3600,
      }}),
    TypeOrmModule.forFeature([User])], // Register entities here
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    JwtStrategy,
    GoogleStrategy,
    SessionSerializer,
    // {
    //   provide: UsersRepository,
    //   useFactory: (dataSource: DataSource) => {
    //     return new UsersRepository(dataSource);
    //   },
    //   inject: [DataSource],
    // },
  ],
  exports: [JwtStrategy, PassportModule,],
})
export class AuthModule {}
