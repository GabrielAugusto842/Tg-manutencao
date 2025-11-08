import dotenv from 'dotenv';
import path from 'path';

// Carrega .env da raiz do projeto (mesmo que src esteja em subpasta)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });