// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { listFiles } from '@fleekhq/fleek-storage-js';
import { getFleekAPIKey, getFleekAPISecret } from '../../../utils/fleek';

interface NodeDescriptor {
	url: string;
}
interface RootNodesResponse {
  nodes: NodeDescriptor[];
}

interface ErrorResponse {
  msg: string;
}

type GetRootNodesResponse = RootNodesResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetRootNodesResponse>
) {

  const { limit } = req.query;

  let limitNum = 0;

  limitNum = parseInt(limit as string, 10);

  try {
    let files = await listFiles({
        apiKey: getFleekAPIKey(),
        apiSecret: getFleekAPISecret(),
        bucket: 'lesson-index-bucket',
    });

    if (limitNum !== 0) {
      files = files.slice(0, limitNum);
    }
    const nodes = files.map(file => ({ url: file.publicUrl as string }));

    res.status(200).json({ nodes });
  } catch (err) {
    console.error(err);
    res.status(500).json( { msg: "Internal Server Error" });
  }
}
