import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoute } from './route';
import * as db from '../db';
import { jwtSalt, dbPasswordSalt } from '../config';
import * as jwt from 'jsonwebtoken';
import { sha512 } from '../utils/sha512';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as multer from "multer";
import { alvisProjectsFilesDir } from '../config';
import { IFileAttribute } from '../models/File';
import * as shortid from 'shortid';

function getRandomAlvisProjectFilename(): string {
    return shortid.generate() + '.alvis';
}

const alvisProjectStorage = multer.diskStorage({
    destination: alvisProjectsFilesDir,
    filename: (req, file, callback) => {
        const filename = getRandomAlvisProjectFilename();
        callback(null, filename);
    },
});
const alvisProjectUpload = multer({ storage: alvisProjectStorage }).single('alvisProjectFile');

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

        router.post('/:id/sourcecode', (req: Request, res: Response, next: NextFunction) => {
            new ProjectRoute().postProjectSourceCode(req, res, next);
        });

        router.post('/sourcecodefile', alvisProjectUpload, (req: Request, res: Response, next: NextFunction) => {
            new ProjectRoute().postCreateProjectFromFile(req, res, next);
        });

        router.post('/sourcecode', (req: Request, res: Response, next: NextFunction) => {
            new ProjectRoute().postCreateProject(req, res, next);
        });

        router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
            new ProjectRoute().deleteProject(req, res, next);
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

    private async postProjectSourceCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projectId: number = req.params.id,
                filePath = await this.getProjectFilePath(projectId),
                projectSourceCode: string = req.body.sourcecode;

            fs.writeFile(filePath, projectSourceCode, { encoding: 'utf-8' }, (e) => {
                if (e) { throw e };

                res.json({ success: true });
            });
        } catch (e) {
            next(e);
        }
    }

    private async getProjectSourceCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projectId: number = req.params.id,
                filePath = await this.getProjectFilePath(projectId);

            fs.readFile(filePath, 'utf-8', (e, data: string) => {
                if (e) { throw e; } // TO DO: is it OK? --- NO, server will crash if file does not exists

                res.json({
                    sourcecode: data
                });
            });
        } catch (e) {
            next(e);
        }
    }

    private async postCreateProjectFromFile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reqBody = req.body,
                reqFileFilename = req.file.filename,
                fileData: IFileAttribute = {
                    name: reqBody.name,
                    realtive_path: reqFileFilename,
                },
                newFileEntity = db.models.File.build(fileData),
                savedFileEntity = await newFileEntity.save(),
                filePath = alvisProjectsFilesDir + reqFileFilename;

            fs.readFile(filePath, 'utf-8', (e, sourcecode: string) => {
                if (e) { throw e; }

                res.json({
                    projectId: savedFileEntity.id,
                    name: savedFileEntity.name,
                    sourcecode,
                });
            });
        } catch (e) {
            next(e);
        }
    }

    private async postCreateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reqBody: { name: string, sourceCode: string } = req.body,
                { name, sourceCode } = reqBody,
                filename = getRandomAlvisProjectFilename(),
                filePath = path.join(alvisProjectsFilesDir + filename);

            fs.writeFile(filePath, sourceCode, { encoding: 'utf-8' }, async (e: NodeJS.ErrnoException) => {
                if (e) {
                    if (e.errno === os.constants.errno.ENOENT) {
                        res.status(404).send({ error: 'Project file does not exists. :O' });
                        return;
                    }
                    throw e; // Maybe we should throw string because if we throw string server will not crash? On ENOENT error server is crashing
                } // TO DO: handle more exceptions

                const fileData: IFileAttribute = {
                    name: reqBody.name,
                    realtive_path: filename,
                },
                    newFileEntity = db.models.File.build(fileData),
                    savedFileEntity = await newFileEntity.save();

                res.json({
                    projectId: savedFileEntity.id,
                    projectName: savedFileEntity.name,
                    projectSourceCode: sourceCode,
                });
            });
        } catch (e) {
            next(e);
        }
    }

    private async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projectId: number = req.params.id;

            db.models.File.destroy({
                where: {
                    id: projectId,
                }
            }).then(affectedRows => {
                res.json({
                    success: true,
                });
            });
        } catch (e) {
            next(e);
        }
    }

    private async getProjectFilePath(projectId: number): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const projectFile = await db.models.File.findById(projectId);

                if (!projectFile) {
                    throw `Project with id ${projectId} does not exists`;
                }

                console.log(__dirname);

                const projectFileRelativePath = alvisProjectsFilesDir + projectFile.realtive_path;
                resolve(projectFileRelativePath);
            } catch (e) {
                throw e; // TO DO: come up with something better
                // TO DO: will it catch throw above - rather YES?? 
            }
        });

    }

}