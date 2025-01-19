import React, { useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/profile`, {
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        console.log(res, "res");
        res.json().then((userInfo) => {
          setUserInfo(userInfo.user);
        });
      } else {
        setUserInfo(null);
      }
    });
  }, [setUserInfo]);

  // Re-render the Header when userInfo changes
  useEffect(() => {
    console.log(userInfo, "userinfo");
  }, [userInfo]);

  function logout() {
    fetch(`${process.env.REACT_APP_SERVER_URL}/logout`, {
      credentials: "include",
      method: "POST",
    });

    setUserInfo(null);
    navigate("/");
  }

  const username = userInfo?.username;
  console.log(username, "username");
  return (
    <header className="tauri-regular flex items-center   h-[7rem] sticky top-0 z-10 justify-between bg-white">
      <Link to="/" className="logo w-[96px] h-[96px] p-2 ">
        <img src="assets/logo.png" className="rounded-xl" alt="logo" />
      </Link>
      <nav className="px-4 flex gap-10">
        {username ? (
          <>
            <span className="flex gap-2">
              <span className="pb-8 pt-2 ">
                <img src="/assets/person.svg" alt="profile" />
              </span>
              <span className="pb-8 pt-2 ">{username}</span>
            </span>
            <Link to="/create" className="flex gap-1 items-center ">
              <span>
                <img src="/assets/add.png" className="pb-8 pt-2 "></img>
              </span>
              <span className="hover:border-b-4   border-black pb-8 pt-2 ">
                New blog
              </span>
            </Link>
            <a onClick={logout} className="flex cursor-pointer  gap-2">
              <span className="pb-8 pt-2 ">
                <img src="/assets/logout.svg" />
              </span>
              <span className="hover:border-b-4 border-black pb-8 pt-2 ">
                Logout
              </span>
            </a>
          </>
        ) : (
          <>
            <span className="flex gap-1">
              <span className="pb-8 pt-2">
                <img src="/assets/login.svg" />
              </span>
              <Link
                to="/login"
                className="hover:border-b-4 border-black pb-8 pt-2"
              >
                Login
              </Link>
            </span>
            <span className="flex gap-1">
              <span className="pb-8 pt-2">
                <img src="/assets/register.svg" />
              </span>
              <Link
                to="/signup"
                className="hover:border-b-4 border-black pb-8 pt-2"
              >
                Register
              </Link>
            </span>
          </>
        )}
      </nav>
    </header>
  );
}
