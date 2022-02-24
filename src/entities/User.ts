import { Field, ObjectType } from "type-graphql";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { IsEmail, Length } from "class-validator";

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import { Post } from "./post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  @Length(6)
  username: string;

  @Field()
  @Column({ enum: ["user", "admin"] })
  role: string;

  @Field()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @Length(6)
  password: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (posts) => posts.user)
  posts: Post[];

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

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
