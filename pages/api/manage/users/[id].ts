import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prismadb";
import { notionClient } from "@/lib/notion";

type RoleChangeRequest = {
  role: number;
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
  if (session.user?.role! !== 4) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  switch (req.method) {
    case "PATCH":
      const { id } = req.query;
      if (typeof id !== "string") {
        res.status(400).json({ message: "Bad Request" });
        return;
      }
      const request: RoleChangeRequest = req.body;
      const user = await prisma.user.findUnique({ where: { id: id } });
      if (!user) {
        res.status(404).json({ message: "Not Found" });
        return;
      }
      const roleUpdateRes = await prisma.user.update({
        data: { role: request.role },
        where: { id: id },
      });
      res.status(200).json(roleUpdateRes);
      return;
  }
}
