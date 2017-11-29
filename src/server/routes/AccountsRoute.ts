import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import * as db from '../db';
import { jwtSalt, dbPasswordSalt } from '../config';
import * as jwt from 'jsonwebtoken';
import { sha512 } from '../utils/sha512';

export class AccountsRoute extends BaseRoute {
    constructor() {
        super();
    }

    public static create(router: Router) {
        console.log('[AccountsRoute::create]');

        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new AccountsRoute().index(req, res, next);
        });
    }

    private async index(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await db.models.User.findAll();

            res.json({ users });
        } catch (e) {
            next(e);
        }
    }
}