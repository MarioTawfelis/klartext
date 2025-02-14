import express, {Response } from 'express';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { policy, checkOrigin } from './functions/originCheck';

// routes
import {wordInfoRouter} from '../routes/GET/wordinfo';
import {defaultRouter} from '../routes/GET/landing';
import {setCookieRouter} from '../routes/GET/setcoookie';
import {simplifyRouter} from '../routes/POST/simplify';
import {feedbackRouter} from '../routes/POST/feedback';

dotenv.config();

const app = express();
const apiKey = process.env.OPENAI_API_KEY || "error" ;
const port = 7171;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || "error";
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || "error";
const deploy = process.env.NODE_ENV === "deploy";
const wordLimit = Number(process.env.WORD_LIMIT) || 5000;
const sk = process.env.SK || "error";

// middleware
app.set('trust proxy', true); // Trust the first proxy
app.use(cookieParser(sk));
app.use(policy);
app.use(checkOrigin)
app.use(express.json());

// simplify text route
app.post('/simplify', simplifyRouter);
// Feedback
app.post('/feedback', feedbackRouter);
// default route
app.get('/', defaultRouter);
// word info route
app.get('/word-info', wordInfoRouter);
// set cookie route
app.get('/set-cookie', setCookieRouter);

if (deploy){
  const sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  };
  const server = https.createServer(sslOptions, app);
  server.listen(port, () => {
    console.log('Backend listening at https://simplifymytext.org:7171');
  });
} else {
  app.listen(port, ()=>{
    console.log(`Backend listening at http://localhost:${port}`);
  })
}

export default app;