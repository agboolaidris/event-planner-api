import { Request, Response } from "express";
import { Session, SessionData } from "express-session";

import { Redis } from "ioredis";

export type ContextType = {
  req: Request & {
    session: Session & Partial<SessionData> & { userInfo: any };
  };
  res: Response;
  Redis: Redis;
};
