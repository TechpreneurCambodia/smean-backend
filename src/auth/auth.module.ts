import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersRepository } from "./users.repository";
import { User } from "./user.entity";
import { DataSource } from "typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Register entities here
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: UsersRepository,
      useFactory: (dataSource: DataSource) => {
        return new UsersRepository(dataSource);
      },
      inject: [DataSource],
    },
  ],
})
export class AuthModule {}
