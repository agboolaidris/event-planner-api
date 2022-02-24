import { Post } from "../entities/post";
import { getRepository } from "typeorm";
import { PostInput, PostResponse } from "../types/post";
import {
  Arg,
  Mutation,
  Resolver,
  Ctx,
  UseMiddleware,
  Query,
} from "type-graphql";
import { ContextType } from "../types/@types";
import { validate } from "class-validator";
import { AuthMiddeware } from "../middleware/auth";
import { User } from "../entities/User";

@Resolver()
export class PostResolver {
  @Mutation(() => PostResponse)
  @UseMiddleware(AuthMiddeware)
  async createPost(
    @Arg("options") body: PostInput,
    @Ctx() { req }: ContextType
  ): Promise<PostResponse> {
    try {
      const { title, content, imageURL } = body;

      const user = await User.findOneOrFail({ id: req.session.userInfo.id });

      const post = new Post({
        title,
        content,
        imageURL,
        user,
      });
      const errors = await validate(post);

      if (errors.length > 0) {
        const map: any = {};
        errors.forEach((err) => {
          const key = err.property;

          if (err.constraints) {
            const value = Object.entries(err.constraints)[0][1];
            map[key] = value;
          }
        });

        return {
          error: map,
        };
      }

      await post.save();

      return {
        ok: true,
      };
    } catch (error) {
      if (error.code === "23505") {
        if (error.detail.includes("title")) {
          return {
            error: {
              title: "title already exist",
            },
          };
        }
      }
      return {
        error: {
          server: error.message,
        },
      };
    }
  }

  @Query(() => [Post])
  async posts(
    @Arg("limit", { nullable: true }) limit: number
  ): Promise<Post[] | null> {
    try {
      const posts = await getRepository(Post)
        .createQueryBuilder("post")
        .orderBy("post.created_at", "DESC")
        .leftJoinAndSelect("post.user", "user")
        .take(Math.min(limit ? limit : 50))
        .getMany();

      return posts;
    } catch (error) {
      return null;
    }
  }
}
