import fs from "fs"
import path from "path"

const buildDir = path.join(__dirname, 'dist');
const indexPath = path.join(buildDir, 'index.html');
const rootPath = path.join(__dirname, 'index.html');

fs.copyFileSync(indexPath, rootPath);