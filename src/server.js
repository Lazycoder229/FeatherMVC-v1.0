import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import router from './routes/index.js';
import { notFound } from './middleware/notFound.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(express.static(path.join(__dirname, '../public')));




app.use('/', router);
app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`FeatherMVC running at http://localhost:${port}`));
