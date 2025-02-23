import React, { useState } from "react";
import Post from "../Components/Post";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const signUp = async (e) => {
    e.preventDefault();

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-type": "application/json" },
    });

    if (response.status === 201) {
      alert("User created successfully");
      console.log(response)
      navigate("/login");
    } else if(response.status === 200){ 
      alert("User already exists");
    }
    else{
      alert("error signing up")
    }
  };
  return (
    <div className="signinpage flex items-center justify-center h-[500px]">
      <div className="company  ml-[0%] shadow-2xl w-[200px] h-[500px] bg-gradient-to-r from-[rgb(0,97,114)] to-[rgb(4,252,231)]  mr-0 rounded-lg rounded-e-none"></div>
      <div className="sign-container h-[500px] ml-[0%]">
        <form
          className="login shadow-2xl rounded-xl rounded-s-none h-[500px] w-[500px]  pl-0 p-5  flex  justify-center items-center "
          onSubmit={signUp}
        >
          <div className="  ml-0  flex flex-col gap-3  h-[500px] w-[400px] items-center justify-center">
            <h1 className="text-4xl mb-10 font-serif">SignUp</h1>

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
            <button className=" mt-7 montserrat p-2 bg-[rgb(16,255,183)] w-[15rem] self-center rounded-xl border-b-4 border-[rgb(0,114,80)] hover:bg-[rgb(0,127,89)] duration-300 hover:text-white">
              SignUp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
