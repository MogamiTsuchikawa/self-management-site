import React, { useState } from "react";
import { myAxios } from "../../lib/axios";

const TaskRequestForm = () => {
  const [titleText, setTitleText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const errors = [];
    if (titleText === "") errors.push("タイトルが空です");
    if (descriptionText.length > 140) errors.push("内容が長すぎます");
    if (titleText.length > 40) errors.push("タイトルが長すぎます");
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
    myAxios
      .post("/api/tasks", { title: titleText, content: descriptionText })
      .then((res) => {
        alert("リクエストしました");
        setTitleText("");
        setDescriptionText("");
      })
      .catch((err) => {
        alert("リクエストに失敗しました");
      });
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">タスクのタイトル</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
          />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">タスクの内容</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-md"
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
          />
        </div>
        <ul>
          {errors.map((e) => (
            <li>{e}</li>
          ))}
        </ul>

        <button className="btn" style={{ marginTop: 10 }} type="submit">
          リクエスト
        </button>
      </form>
    </div>
  );
};
export default TaskRequestForm;
