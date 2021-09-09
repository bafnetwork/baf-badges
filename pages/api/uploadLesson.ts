// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { upload } from '@fleekhq/fleek-storage-js';
import { getFleekAPIKey, getFleekAPISecret } from '../../utils/fleek';
import { v4 } from 'uuid';

interface UploadOkResponse {
  url: string;
  lessonID: string;
}

interface ErrorResponse {
  msg: string;
}

type UploadResponse = UploadOkResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {

  let lessonID = v4();

  try {
    const uploadedFile = await upload({
      apiKey: getFleekAPIKey(),
      apiSecret: getFleekAPISecret(),
      key: `lesson-documents/${lessonID}`,
      bucket: 'baf-bucket',
      data: req.body
    });

    const url = uploadedFile.publicUrl;
    res.status(201).json({ url, lessonID });
  } catch (err) {
    console.error(err);
    res.status(500).json( { msg: "Internal Server Error" });
  }
}
