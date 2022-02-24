import { ContextType } from "./../types/@types";

import { MiddlewareFn } from "type-graphql";

export const AuthMiddeware: MiddlewareFn<ContextType> = ({ context }, Next) => {
  if (!context.req.session.userInfo)
    throw new Error("access denied, unauthenticated");

  return Next();
};
