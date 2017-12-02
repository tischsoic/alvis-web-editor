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

    public static createPublic(router: Router) {
        console.log('[AccountsRoute::create]');

        router.head('/:email', (req: Request, res: Response, next: NextFunction) => {
            new AccountsRoute().email(req, res, next);
        });
    }


    public static create(router: Router) {
        console.log('[AccountsRoute::create]');

        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new AccountsRoute().index(req, res, next);
        });
    }

    private async email(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email = req.params.email,
                emailUnique = await this.emailUnique(email),
                responseStatus = emailUnique ? 404 : 200;

            res.status(responseStatus).end();
        } catch (e) {
            next(e);
        }
    }

    private async index(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await db.models.User.findAll();

            res.json({ users });
        } catch (e) {
            next(e);
        }
    }

    private async emailUnique(email: string): Promise<boolean> {
        try {
            const emailCount = await db.models.User.count({
                where: {
                    email,
                }
            });

            return emailCount === 0;
        } catch (e) {
            throw { message: 'Failed during checking if Email was taken' }
        }
    }
}