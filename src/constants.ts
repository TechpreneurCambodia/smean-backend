import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const FILE_UPLOAD_DIR = './uploads/audio';

if (!existsSync(FILE_UPLOAD_DIR)) {
  mkdirSync(FILE_UPLOAD_DIR, { recursive: true });
}
