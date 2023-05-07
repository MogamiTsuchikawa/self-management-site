import { GetServerSideProps } from "next";
import { useSession, getSession } from "next-auth/react";
import prisma from "../lib/prismadb";
import { RequestTodo } from "@prisma/client";
import { notionClient } from "@/lib/notion";
import { NotionTodo } from "@/interface/task";
import Todo from "@/components/task/Todo";
import { getCurrentTodoList } from "@/apis/notion";

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
  const notionTodos = await getCurrentTodoList();
  //console.log(notionTodos);
  props = { ...props, notionTodos: notionTodos };
  return {
    props: props,
  };
};
