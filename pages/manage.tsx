import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import prisma from "../lib/prismadb";
import { User } from "@prisma/client";
import { myAxios } from "@/lib/axios";
import { useRouter } from "next/router";

type Props = {
  users?: User[];
};

const ManagePage = ({ users }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session) return <p>ログインしていないです</p>;
  if (session.user?.role! !== 4) return <p>権限不足です</p>;
  const changeRole = (userId: string) => {
    const newRole = parseInt(prompt("変更するロールを入力してください")!);
    if (newRole) {
      myAxios
        .patch(`/api/manage/users/${userId}`, { role: newRole })
        .then(() => {
          alert("変更しました");
          router.reload();
        })
        .catch(() => {
          alert("変更に失敗しました");
        });
    }
  };
  return (
    <>
      <h2>ユーザー管理</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users ? (
              <>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src={u.image!} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium">{u.name}</span>
                    </td>
                    <td>
                      <span className="font-medium">{u.role}</span>
                    </td>
                    <td>
                      <span className="font-medium">{u.email}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => changeRole(u.id)}
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <></>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default ManagePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { props: {} };
  if (session.user?.role !== 4) return { props: {} };
  const users = await prisma.user.findMany();
  return { props: { users: users } };
};
