import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { UserContext } from "../UserContext";

function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { id } = useParams();
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/getblogposts/${id}`).then((response) => {
      response
        .json()
        .then((postInfo) => {
          setPostInfo(postInfo);
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }, [id]);

  if (!postInfo) return "";
  return (
    <div className="post-page">
      <h1 className="text-5xl edu-nsw text-center">{postInfo.title}</h1>

      <div className="flex justify-between m-6">
        <div>
          <time className="text-red-800 kanit-bold text-xl ml-[20rem]">
            {format(new Date(postInfo.createdAt), "MMM d,yyyy HH:mm")}
          </time>
        </div>
        <div>
          <div className="author montserrat text-[rgb(18,7,88)] text-2xl mr-[20rem]">
            by {postInfo.author.username}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center gap-8">
        <div className="location font-mono font-bold text-2xl">
          My Experience @ {postInfo.place}
        </div>
        {userInfo && userInfo.id === postInfo.author._id && (
          <div className="edit">
            <Link
              to={`/edit/${postInfo._id}`}
              className=" editbtn text-xl  text-center flex justify-around montserrat p-2 bg-[rgb(122,122,122)] w-[10rem] self-center rounded-xl border-b-4 border-[rgb(0,0,0)] hover:bg-[rgb(165,165,165)] duration-300 hover:text-white"
            >
              <img src="/assets/edit.png"></img>
              <p>Edit</p>
            </Link>
          </div>
        )}
        <div className="image">
          <img
            src={`${process.env.REACT_APP_SERVER_URL}/${postInfo.cover}`}
            alt="post"
            className="self-center w-[900px] h-[500px] rounded-xl shadow-2xl m-3"
          />
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: postInfo.content }}
          className="content font-mono text-xl w-[60%] m-10"
        />
      </div>
    </div>
  );
}

export default PostPage;
