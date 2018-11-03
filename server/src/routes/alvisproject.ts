import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import * as fs from 'fs';

export class AlvisProjectRoute extends BaseRoute {
  constructor() {
    super();
  }

  public static create(router: Router) {
    console.log('[AlvisProjectRoute::create] asdf');

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
      new AlvisProjectRoute().index(req, res, next);
    });
  }

  public index(req: Request, res: Response, next: NextFunction) {
    fs.readFile(
      './alvis-projects-files/fst_project.alvis',
      'utf-8',
      (err, data: string) => {
        // TO DO: check data type?? previous BUffer
        if (err) {
          return console.log(err);
        }

        // console.log(data);
        res.json({
          projectXML: data,
        });
      },
    );
    // console.log(__filename);
    // console.log(__dirname);
  }
}
