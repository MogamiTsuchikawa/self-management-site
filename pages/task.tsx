import { GetServerSideProps } from "next";
import { useSession, getSession } from "next-auth/react";
import prisma from "../lib/prismadb";
import { RequestTodo } from "@prisma/client";
import { notionClient } from "@/lib/notion";
import { NotionTodo } from "@/interface/task";
import Todo from "@/components/task/Todo";

type Props = {
  requestTodos?: RequestTodo[];
  notionTodos?: NotionTodo[];
};

const statusList = [
  { name: "未着手", css: "badge-error" },
  { name: "着手中", css: "badge-info" },
  { name: "保留", css: "badge-warning" },
];
const TaskPage = ({ requestTodos, notionTodos }: Props) => {
  const { data: session } = useSession();
  if (!session) return <p>ログインしていないです</p>;
  if (session.user?.role! === 0) return <p>権限不足です</p>;
  return (
    <>
      <h2>現状タスク</h2>
      <div style={{ overflow: "auto", height: 500, width: "100%" }}>
        {notionTodos ? (
          <ul style={{ display: "flex" }}>
            {statusList.map((status) => (
              <li key={status.name}>
                <div
                  className={"badge gap-2 " + status.css}
                  style={{ marginLeft: 10 }}
                >
                  {status.name}
                </div>
                <ul>
                  {notionTodos
                    .filter((todo) => todo.status === status.name)
                    .map((todo) => (
                      <li>
                        <Todo todo={todo} />
                      </li>
                    ))}
                </ul>
              </li>
            ))}

            <li></li>
            <li></li>
          </ul>
        ) : (
          <p>閲覧権限がありません</p>
        )}
      </div>
      <h2>リクエスト済みタスク一覧</h2>
      <div>
        {requestTodos ? (
          <ul>
            {requestTodos.map((todo) => (
              <div>{todo.title}</div>
            ))}
          </ul>
        ) : (
          <p>権限がありません</p>
        )}
      </div>
      <h2>タスクのリクエスト</h2>
    </>
  );
};
export default TaskPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { props: {} };
  const requestTodos = await prisma?.requestTodo.findMany({
    where: { authorId: session.user?.id },
  });
  let props: Props = {
    requestTodos: requestTodos,
  };
  if (session.user?.role! < 2) return { props: props };
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
  //console.log(notionTodos);
  props = { ...props, notionTodos: notionTodos };
  return {
    props: props,
  };
};
