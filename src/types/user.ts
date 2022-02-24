import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
class MsgType {
  @Field()
  msg: string;
}

@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  confirmPassword: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class ResetpasswordInput {
  @Field()
  token: string;

  @Field()
  password: string;
}

@ObjectType()
class RegisterError {
  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  confirmPassword?: string;

  @Field(() => String, { nullable: true })
  server?: string;
}

@ObjectType()
export class RegisterResponse {
  @Field(() => RegisterError, { nullable: true })
  errors?: RegisterError;

  @Field(() => MsgType, { nullable: true })
  msg?: MsgType;
}

@ObjectType()
class LoginError {
  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  server?: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => LoginError, { nullable: true })
  errors?: LoginError;

  @Field(() => MsgType, { nullable: true })
  msg?: MsgType;
}

@ObjectType()
class ResetpasswordError {
  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  server?: string;
}

@ObjectType()
export class ResetpasswordResponse {
  @Field(() => ResetpasswordError, { nullable: true })
  errors?: ResetpasswordError;

  @Field(() => MsgType, { nullable: true })
  msg?: MsgType;
}
