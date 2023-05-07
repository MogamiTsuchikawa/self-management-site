import { NotionTodo } from "@/interface/task";
import { notionClient } from "@/lib/notion";

export const getCurrentTodoList = async (): Promise<NotionTodo[]> => {
  const currentTodos = await notionClient.databases.query({
    database_id: process.env.NOTION_TASK_DATABASE_ID!,
    filter: {
      and: [
        {
          or: [
            {
              property: "Property",
              status: {
                equals: "未着手",
              },
            },
            {
              property: "Property",
              status: {
                equals: "着手中",
              },
            },
            {
              property: "Property",
              status: {
                equals: "保留",
              },
            },
          ],
        },
        {
          or: [
            { property: "タグ", multi_select: { contains: "個人" } },
            { property: "タグ", multi_select: { contains: "大学課題" } },
            { property: "タグ", multi_select: { contains: "サークル" } },
            { property: "タグ", multi_select: { contains: "就活" } },
            { property: "タグ", multi_select: { contains: "真鍋研" } },
            { property: "タグ", multi_select: { contains: "仕事" } },
          ],
        },
      ],
    },
  });
  const results: any = currentTodos.results;
  //console.log(results);
  const notionTodos: NotionTodo[] = results.map((result: any) => {
    return {
      id: result.id,
      title: result.properties!.Name.title[0].plain_text,
      tags: result.properties["タグ"].multi_select.map((tag: any) => tag.name),
      status: result.properties.Property.status.name,
      url: result.url,
    };
  });
  return notionTodos;
};
