import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  pdfUrl: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { query } = req;
  const { file_url } = query;
  try {
    const response = await fetch(`${file_url}`);
    const pdfBytes = await response.arrayBuffer();
    const base64 = Buffer.from(pdfBytes).toString("base64");
    res.status(200).json({ pdfUrl: `data:application/pdf;base64,${base64}` });
  } catch (error) {
    console.error("Error fetching PDF:", error);
  }
}
