// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import uuid from 'uuid';
import { upload } from '@fleekhq/fleek-storage-js';

interface ResponseData {
  url: string;
}

const getFleekAPIKey = () => {
  if (!process.env.FLEEK_API_KEY) {
    throw new Error('FLEEK_API_KEY environment variable not set!');
  }
  return process.env.FLEEK_API_KEY;
}

const getFleekAPISecret = () => {
  if (!process.env.FLEEK_API_SECRET) {
    throw new Error('FLEEK_API_SECRET environment variable not set!');
  }
  return process.env.FLEEK_API_SECRET;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  upload({
    apiKey: getFleekAPIKey(),
    apiSecret: getFleekAPISecret(),
    key: `badge-documents/${uuid.v4()}`,
    data: req
  }).then(uploadedFile => {
    const url = uploadedFile.publicUrl;
    res.status(201).json({ url });
  });
}
