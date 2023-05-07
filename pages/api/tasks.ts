import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../lib/prismadb";
import { notionClient } from "@/lib/notion";

type TaskRequestData = {
  title: string;
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (session.user?.role! < 2) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  switch (req.method) {
    case "POST":
      const request: TaskRequestData = req.body;
      const author = await prisma.user.findUnique({
        where: { id: session.user?.id },
      });

      const pageRes = await notionClient.pages.create({
        parent: {
          type: "database_id",
          database_id: process.env.NOTION_TASK_DATABASE_ID!,
        },
        properties: {
          Name: {
            title: [{ text: { content: request.title } }],
          },
          Property: { status: { name: "未着手" } },
          タグ: { multi_select: [{ name: "外部リクエスト" }] },
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: request.content } }],
            },
          },
        ],
      });
      const rt = await prisma.requestTodo.create({
        data: {
          title: request.title,
          content: request.content,
          notionId: pageRes.id,
          author: { connect: { id: author?.id } },
        },
      });
      res.status(200).json(rt);
      return;
  }
}
