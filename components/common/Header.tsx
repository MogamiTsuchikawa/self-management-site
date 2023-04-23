import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};
const Header = ({ children }: Props) => {
  const { data: session } = useSession();
  return (
    <>
      <div>
        <div className="drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <Navbar />
            {children}
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay"></label>
            {session ? (
              <>
                <ul className="menu p-4 w-80 bg-base-100 text-base-content">
                  <li>
                    <Link href="/">トップ</Link>
                  </li>
                  <li>
                    <Link href="/task">タスク管理</Link>
                  </li>
                  <li>
                    <Link href="/room">土川家状態</Link>
                  </li>
                </ul>
              </>
            ) : (
              <label className="menu p-4 w-80 bg-base-100 text-base-content">
                ログインしてください
              </label>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

const Navbar = () => {
  const { data: session } = useSession();
  return (
    <div className="navbar bg-base-300">
      <div className="flex-none">
        <label
          htmlFor="my-drawer"
          className="btn btn-square btn-ghost drawer-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
      </div>
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">daisyUI</a>
      </div>
      <div className="flex-none">
        {session ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={session.user?.image!} />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-300 rounded-box w-52"
            >
              <li>
                <a className="justify-between">Profile</a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a onClick={() => signOut()}>Logout</a>
              </li>
            </ul>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => signIn()}>
            ログイン
          </button>
        )}
      </div>
    </div>
  );
};
