import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import * as passport from 'passport';
import {
  Strategy as JwtStrategy,
  StrategyOptions as JwtStrategyOptions,
  ExtractJwt,
} from 'passport-jwt';
// import errorHandler = require('errorHandler');
import methodOverride = require('method-override');

import { IndexRoute } from './routes/index';
import * as db from './db';
import { dbConfig, jwtSalt } from './config';

export class Server {
  public app: express.Application;

  public static bootstrap(): Server {
    return new Server();
  }

  constructor() {
    const dbSetUpCorrectly = this.setupSequelize();
    if (dbSetUpCorrectly) {
      // Testing if Sequalize works:
      console.log();
      db.models.User.findOne()
        .then((user) => {
          console.log(user);
          // console.log(question.get({
          //   plain: true
          // }))
        })
        .catch((err) => {
          console.error('no results ', err);
        });
      // END OF Testing if Sequalize works:
    }

    this.app = express();
    this.config();
    this.addPassport();
    this.routes();
    this.api();
  }

  private addPassport() {
    const jwtOptions: JwtStrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSalt,
    };
    const strategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
      console.log('payload received', jwt_payload);
      // usually this would be a database call:

      console.log(jwt_payload);
      try {
        const user = await db.models.User.findOne({
          where: {
            id: jwt_payload.id,
          },
        });

        next(null, user);
      } catch (e) {
        next(e, false);
      }
    });

    passport.use(strategy);
    this.app.use(passport.initialize());
  }

  public api() {}

  private async setupSequelize() {
    const { username, password, database, options } = dbConfig.development;
    options.host = process.env.DATABASE_HOST;

    db.initializeSequelize(database, username, password, options);

    try {
      await db.sqlz.authenticate();
      console.log('Connection has been established successfully.');
      return true;
    } catch (e) {
      console.log('Unable to connect to the database:', e);
      return false;
    }
  }

  public config() {
    this.app.use(express.static(path.join(__dirname, 'static')));
    this.app.use(logger('dev'));
    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );
    this.app.use(cookieParser('SECRET'));
    this.app.use(methodOverride());
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        err.status = 404;
        next(err);
      },
    );
    // this.app.use(errorHandler());
  }

  private routes() {
    let router: express.Router;
    router = express.Router();

    IndexRoute.create(router);

    this.app.use('/server', router);
  }
}
