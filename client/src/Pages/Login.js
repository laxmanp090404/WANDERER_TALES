import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);
  const LoginFun = async (e) => {
    e.preventDefault();
    const response = await fetch("https://wanderer-tales-api.vercel.app/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-type": "application/json" },
      credentials: "include",
    });
    if (response.ok) {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
        setRedirect(true);
      });
    } else {
      alert("wrong credentials");
    }
  };
  if (redirect) {
    navigate("/");
  }

  return (
    <div className="loginpage flex items-center justify-center h-[500px]">
      <div className="company  ml-[0%] shadow-2xl w-[200px] h-[500px] bg-gradient-to-r from-[rgb(0,97,114)] to-[rgb(4,252,231)]  mr-0 rounded-lg rounded-e-none"></div>
      <div className="login-container h-[500px] ml-[0%]">
        <form
          className="login shadow-2xl rounded-xl rounded-s-none h-[500px] w-[500px]  pl-0 p-5  flex  justify-center items-center "
          onSubmit={LoginFun}
        >
          <div className="  ml-0  flex flex-col gap-3  h-[500px] w-[400px] items-center justify-center">
            <h1 className="text-4xl mb-10 font-serif">Login</h1>

            <input
              className=" p-1 w-[15rem] border-[rgb(0,97,114)] border-b-2 focus:outline-none"
              type="text"
              placeholder="UserName"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            ></input>
            <input
              className="border-[rgb(0,97,114)] border-b-2 p-1 w-[15rem] focus:outline-none"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button className="mt-7 montserrat p-2 bg-[rgb(16,255,183)] w-[15rem] self-center rounded-xl border-b-4 border-[rgb(0,114,80)] hover:bg-[rgb(0,127,89)] duration-300 hover:text-white">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
