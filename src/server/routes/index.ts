import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import { AlvisProjectRoute } from './alvisproject';

export class IndexRoute extends BaseRoute {
    constructor() {
        super();
    }

    public static create(router: Router) {
        console.log('[IndexRoute::create] asdf');

        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().index(req, res, next);
        });

        const projectsRouter: Router = Router();
        AlvisProjectRoute.create(projectsRouter);
        router.use('/projects', projectsRouter);
    }

    public index(req: Request, res: Response, next: NextFunction) {
        res.json({
            asdf: '9',
            asdf2: 'asdf2'
        });
    }
}