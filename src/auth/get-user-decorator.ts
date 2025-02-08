import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "./user.entity";

export const Getuser = createParamDecorator((_data, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest(); // Get the request object
  return request.user;
},
);