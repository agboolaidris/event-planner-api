import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class PostInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => String, { nullable: true })
  imageURL?: string;
}

@ObjectType()
class ErrorType {
  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  server?: string;
}

@ObjectType()
export class PostResponse {
  @Field(() => Boolean, { nullable: true })
  ok?: boolean;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
