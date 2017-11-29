import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import { AlvisProjectRoute } from './alvisproject';
import { AuthRoute } from './AuthRoute';
import { RegisterRoute } from './RegisterRoute';
import { AccountsRoute } from './AccountsRoute';
import * as passport from 'passport';

export class IndexRoute extends BaseRoute {
    constructor() {
        super();
    }

    public static create(router: Router) {
        console.log('[IndexRoute::create] asdf');

        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().index(req, res, next);
        });

        const projectsRouter: Router = Router(),
            regirsterRouter = Router(),
            authRouter = Router();

        AlvisProjectRoute.create(projectsRouter);
        RegisterRoute.create(regirsterRouter);
        AuthRoute.create(authRouter);


        router.use('/projects', projectsRouter);
        router.use('/auth', authRouter)
        router.use('/register', regirsterRouter);

        router.use('/system', (req, res, next) => {
            passport.authenticate('jwt', { session: false }, (err, user) => {
                if (err) { 
                    return next(err); 
                }
                if (!user) { 
                    return res.redirect('/auth'); // TO DO: check if it works auth is port system/account is get - problem
                }
                return next();
            })(req, res, next);
        });

        const systemRouter = Router(),
            accountsRouter = Router();

        AccountsRoute.create(accountsRouter);

        systemRouter.use('/account', accountsRouter)
        router.use('/system', systemRouter);
        // router.use('/account')
    }

    public index(req: Request, res: Response, next: NextFunction) {
        res.json({
            asdf: '9',
            asdf2: 'asdf2'
        });
    }
}