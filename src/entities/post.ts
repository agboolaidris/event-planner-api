import { Field, ObjectType } from "type-graphql";
import { v4 as uuidv4 } from "uuid";
import { Length } from "class-validator";
import { User } from "./User";

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeInsert,
  ManyToOne,
} from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  @Length(6)
  title: string;

  @Field()
  @Column()
  @Length(100)
  content: string;

  @Column({ default: 0, type: "int" })
  vote: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @Column({ nullable: true })
  imageURL: string;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @Column({ unique: true })
  uuid: string;

  @BeforeInsert()
  generateUUid() {
    this.uuid = uuidv4();
  }
}
