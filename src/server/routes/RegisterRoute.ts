import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import * as db from '../db';
import { dbPasswordSalt } from '../config';
import { sha512 } from '../utils/sha512';
import { IUserAttribute } from '../models/User';

export class RegisterRoute extends BaseRoute {
  constructor() {
    super();
  }

  public static create(router: Router) {
    console.log('[RegisterRoute::create] asdf');

    router.post('/', (req: Request, res: Response, next: NextFunction) => {
      new RegisterRoute().index(req, res, next);
    });
  }

  private async index(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reqBody = req.body,
        userData: IUserAttribute = {
          email: reqBody.email,
          password: sha512(reqBody.password, dbPasswordSalt),
          firstname: reqBody.firstname,
          lastname: reqBody.lastname,
          activated: false,
        },
        newEntity = db.models.User.build(userData),
        savedUser = await newEntity.save();

      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
}
