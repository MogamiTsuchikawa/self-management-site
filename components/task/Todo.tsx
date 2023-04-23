import { NotionTodo } from "@/interface/task";

type Props = {
  todo: NotionTodo;
};
const Todo = ({ todo }: Props) => {
  return (
    <div className="card w-80 bg-base-300 shadow-xl" style={{ margin: 10 }}>
      <div className="card-body" style={{ padding: 10 }}>
        <h2 className="card-title">{todo.title}</h2>
        {todo.tags.map((tag) => (
          <div className="badge" key={tag}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Todo;
