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

    public static create(router: Router) {
        console.log('[AuthRoute::create] asdf');

        router.post('/', (req: Request, res: Response, next: NextFunction) => {
            new AuthRoute().index(req, res, next);
        });
    }

    private async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reqBody = req.body,
                user = await db.models.User.findOne({
                    where: {
                        email: reqBody.email,
                    },
                });

            if (!user) {
                res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
                return; // TO DO: check:  Can i return void?
            }

            if (user.password != sha512(reqBody.password, dbPasswordSalt)) {
                res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
                return;
            }

            const payload = { id: user.id },
                token = jwt.sign(payload, jwtSalt);

            res.json({ success: true, token: token });
        } catch (e) {
            next(e);
        }
    }
}