import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
// import errorHandler = require('errorHandler');
import methodOverride = require('method-override');

import { IndexRoute } from './routes/index';

export class Server {
    public app: express.Application;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.api();
    }

    public api() {

    }

    public config() {
        this.app.use(express.static(path.join(__dirname, 'static')));
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser('SECRET'));
        this.app.use(methodOverride());
        this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
            err.status = 404;
            next(err);
        });
        // this.app.use(errorHandler());
    }

    private routes() {
        let router: express.Router;
        router = express.Router();

        IndexRoute.create(router);

        this.app.use(router);
    }
}
