import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 8642;
app.use(express.static(path.join(thisDir, '../')));
app.listen(port, () => {
  console.log(`Example running at http://localhost:${port}/example`);
});
