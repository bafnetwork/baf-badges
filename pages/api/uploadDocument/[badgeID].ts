// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { upload } from '@fleekhq/fleek-storage-js';
import { getFleekAPIKey, getFleekAPISecret } from '../../../utils/fleek';
import bodyParser from 'body-parser';

interface UploadOkResponse {
  url: string;
}

interface ErrorResponse {
  msg: string;
}

type UploadResponse = UploadOkResponse | ErrorResponse;

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {

  await runMiddleware(req, res, bodyParser.json());

  const { badgeID } = req.query;


  try {
    const uploadedFile = await upload({
      apiKey: getFleekAPIKey(),
      apiSecret: getFleekAPISecret(),
      key: `badge-documents/${badgeID}`,
      bucket: 'baf-bucket',
      data: req.body
    });

    const url = uploadedFile.publicUrl;
    res.status(201).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json( { msg: "Internal Server Error" });
  }
}
