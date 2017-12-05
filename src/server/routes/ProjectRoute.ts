import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import * as db from '../db';
import { jwtSalt, dbPasswordSalt } from '../config';
import * as jwt from 'jsonwebtoken';
import { sha512 } from '../utils/sha512';
import * as fs from 'fs';

export class ProjectRoute extends BaseRoute {
    constructor() {
        super();
    }

    public static create(router: Router) {
        console.log('[ProjectsRoute::create]');

        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new ProjectRoute().index(req, res, next);
        });

        router.get('/:id/sourcecode', (req: Request, res: Response, next: NextFunction) => {
            new ProjectRoute().getProjectSourceCode(req, res, next);
        });
    }

    private async index(req: Request, res: Response, next: NextFunction) {
        try {
            const files = await db.models.File.findAll();

            res.json(files.map(
                (file) => ({
                    id: file.id,
                    name: file.name,
                })
            ));
        } catch (e) {
            next(e);
        }
    }

    private async getProjectSourceCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id,
                file = await db.models.File.findOne({
                    where: {
                        id,
                    }
                }),
                filePath = './static/alvis-project/project_' + file.id + '.alvis';

            fs.readFile(filePath, 'utf-8', (e, data: string) => {
                if (e) {
                    next(e);
                    return console.log(e);
                }

                res.json({
                    sourcecode: data
                });
            });
        } catch (e) {
            next(e);
        }
    }
}