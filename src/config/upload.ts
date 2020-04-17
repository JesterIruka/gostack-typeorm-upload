import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      const hex = crypto.randomBytes(10).toString('HEX');
      const fileName = hex + file.originalname;

      return callback(null, fileName);
    },
  }),
};
