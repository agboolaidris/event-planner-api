import { ContextType } from "./../types/@types";
import { v4 as uuidv4 } from "uuid";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entities/User";
import {
  LoginInput,
  RegisterInput,
  ResetpasswordInput,
  ResetpasswordResponse,
} from "../types/user";
import bcrypt from "bcrypt";
import { validate } from "class-validator";
import { LoginResponse, RegisterResponse } from "./../types/user";
import { sendEmail } from "../utils/sendMail";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async isme(@Ctx() { req }: ContextType) {
    try {
      if (!req.session?.userInfo) return null;

      return User.findOne(req.session.userInfo.id);
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => RegisterResponse)
  async registerUser(
    @Arg("options") body: RegisterInput
  ): Promise<RegisterResponse> {
    try {
      const user = new User({ ...body, role: "admin" });

      const errors = await validate(user);
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
          errors: map,
        };
      }

      if (body.password !== body.confirmPassword) {
        return {
          errors: {
            confirmPassword: "password not match",
          },
        };
      }

      await user.save();

      return { msg: { msg: "user register" } };
    } catch (error) {
      if (error.code === "23505") {
        if (error.detail.includes("email")) {
          return {
            errors: {
              email: "email already exist",
            },
          };
        }

        if (error.detail.includes("username")) {
          return {
            errors: {
              username: "username already exist",
            },
          };
        }
      }
      return {
        errors: {
          server: error.message,
        },
      };
    }
  }

  @Mutation(() => LoginResponse)
  async loginUser(
    @Ctx() { req }: ContextType,
    @Arg("options") { email, password }: LoginInput
  ): Promise<LoginResponse> {
    try {
      const user = await User.findOne({ email });

      if (!user)
        return {
          errors: {
            email: "email address is invalid",
          },
        };

      const compare_password = await bcrypt.compare(password, user.password);

      if (!compare_password)
        return {
          errors: {
            password: "password doesn't match",
          },
        };

      req.session.userInfo = {
        id: user.id,
        role: user.role,
      };

      return {
        msg: {
          msg: "login successful",
        },
      };
    } catch (error) {
      return {
        errors: {
          server: error.message,
        },
      };
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: ContextType): Promise<boolean> {
    const response = req.session.destroy(() => {});
    if (!response.userInfo) {
      return false;
    } else {
      res.clearCookie("auth-cookie");
      return true;
    }
  }

  @Mutation(() => Boolean)
  async forgetpassword(
    @Arg("email") email: string,
    @Ctx() { Redis }: ContextType
  ): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      if (!user) return false;
      const token = uuidv4();

      const message = `
      <a href="${process.env.CLIENT_URL}/forget-password/${token}">Click to change your password</a>
      `;
      await Redis.set(
        `forgetpassword-${token}`,
        user.id,
        "ex",
        1000 * 60 * 60 * 24
      ); //expire in 1day
      const send = await sendEmail(
        "iristech247@gmail.com",
        message,
        "Reset password"
      );
      if (!send) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => ResetpasswordResponse)
  async resetpassword(
    @Ctx() { Redis }: ContextType,
    @Arg("options") { password, token }: ResetpasswordInput
  ): Promise<ResetpasswordResponse> {
    try {
      if (password.length < 2)
        return {
          errors: {
            password: "password most be greater than 2 character",
          },
        };

      const id = await Redis.get(`forgetpassword-${token}`);
      if (!id)
        return {
          errors: {
            password: "token expired",
          },
        };

      const user = await User.findOne(id);
      if (!user)
        return {
          errors: {
            password: "user not longer exist",
          },
        };
      user.password = await bcrypt.hash(password, 10);
      await user.save();
      await Redis.del(`forgetpassword-${token}`);

      return {
        msg: {
          msg: "password change",
        },
      };
    } catch (error) {
      return {
        errors: {
          server: error.message,
        },
      };
    }
  }
}
