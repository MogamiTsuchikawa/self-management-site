import { GetServerSideProps } from "next";
import { useSession, getSession } from "next-auth/react";
import prisma from "../lib/prismadb";
import { RequestTodo } from "@prisma/client";
import { NotionTodo } from "@/interface/task";
import Todo from "@/components/task/Todo";
import { getCurrentTodoList, getTodoStatus } from "@/apis/notion";
import TaskRequestForm from "@/components/task/RequestForm";

type Props = {
  requestTodos?: (RequestTodo & { status: string })[];
  notionTodos?: NotionTodo[];
};

const statusList = [
  { name: "未着手", css: "badge-error" },
  { name: "着手中", css: "badge-info" },
  { name: "保留", css: "badge-warning" },
];

const h2Style = {
  fontSize: 25,
  marginBottom: 10,
};

const TaskPage = ({ requestTodos, notionTodos }: Props) => {
  const { data: session } = useSession();
  if (!session) return <p>ログインしていないです</p>;
  if (session.user?.role! === 0) return <p>権限不足です</p>;
  return (
    <div style={{ padding: 20 }}>
      <h2 style={h2Style}>現状タスク</h2>
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
                      <li key={todo.id}>
                        <Todo todo={todo} />
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>閲覧権限がありません</p>
        )}
      </div>
      <div style={{ marginTop: 20 }}>
        <h2 style={h2Style}>リクエスト済みタスク一覧</h2>
        <div>
          {requestTodos ? (
            requestTodos.length !== 0 ? (
              <table>
                <tbody>
                  {requestTodos.map((todo) => (
                    <tr key={todo.id}>
                      <td>
                        <div
                          className={
                            "badge gap-2 " +
                            statusList.find(
                              (status) => status.name === todo.status
                            )?.css
                          }
                          style={{ marginLeft: 10 }}
                        >
                          {todo.status}
                        </div>
                      </td>
                      <td>{todo.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>リクエスト済みタスクはありません</p>
            )
          ) : (
            <p>権限がありません</p>
          )}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <h2 style={h2Style}>タスクのリクエスト</h2>
        {session.user?.role! === 1 ? (
          <p>リクエスト権限がありません</p>
        ) : (
          <TaskRequestForm />
        )}
      </div>
    </div>
  );
};
export default TaskPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { props: {} };
  const requestTodos: (RequestTodo & { status: string })[] = await Promise.all(
    (
      await prisma?.requestTodo.findMany({
        where: { authorId: session.user?.id },
      })
    ).map(async (todo) => ({
      ...todo,
      status: await getTodoStatus(todo.notionId!),
    }))
  );
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
