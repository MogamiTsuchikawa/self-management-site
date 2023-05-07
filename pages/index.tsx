import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  if (session) {
    return (
      <div style={{ padding: 20 }}>
        Signed in as {session.user!.email} <br />
        <button className="btn" onClick={() => router.push("/task")}>
          タスク管理ページへ
        </button>
      </div>
    );
  }
  return <>まずはログインしてください</>;
}
