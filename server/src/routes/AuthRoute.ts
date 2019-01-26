import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import * as db from '../db';
import { jwtSalt, dbPasswordSalt } from '../config';
import * as jwt from 'jsonwebtoken';
import { sha512 } from '../utils/sha512';

export class AuthRoute extends BaseRoute {
  constructor() {
    super();
  }

  public static createPrivate(router: Router) {
    console.log('[AuthRoute::createPrivate]');

    router.head(
      '/verify-token',
      (req: Request, res: Response, next: NextFunction) => {
        new AuthRoute().verifyToken(req, res, next);
      },
    );
  }

  public static create(router: Router) {
    console.log('[AuthRoute::create] asdf');

    router.post('/', (req: Request, res: Response, next: NextFunction) => {
      new AuthRoute().index(req, res, next);
    });
  }

  private async index(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reqBody: { email: string; password: string } = req.body;
      const user = await db.models.User.findOne({
        where: {
          email: reqBody.email,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication failed. User not found.',
        });
        return; // TO DO: check:  Can i return void?
      }

      console.log(sha512(reqBody.password, dbPasswordSalt));
      if (user.password != sha512(reqBody.password, dbPasswordSalt)) {
        res.status(401).json({
          success: false,
          message: 'Authentication failed. Wrong password.',
        });
        return;
      }

      const payload = { id: user.id };
      const token = jwt.sign(payload, jwtSalt);

      res.json({ success: true, token: token });
    } catch (e) {
      next(e);
    }
  }

  private async verifyToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    // If we are here, token should be correct
    // TODO: What if user account was deleted/deactivated? Then user token should also be deleted
    res.sendStatus(200);
  }
}
