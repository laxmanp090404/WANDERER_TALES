import React, { useEffect, useState } from "react";
import Post from "../Components/Post";

function HomePage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/getblogposts")
      .then((response) => response.json())
      .then((posts) => setPosts(posts))
      .catch((error) => console.error("Error fetching blog posts:", error));
  }, []);
  return (
    // overflow-x-scroll no-scrollbar
    <div className="flex items-center justify-center flex-wrap m-5 p-5 w-[1440px] px-4">
      {posts.length > 0 &&
        posts.map((post, index) => (
          <div key={index} className="postcontainer mx-2 flex-shrink-0">
            <Post {...post} />
          </div>
        ))}
    </div>
  );
}

export default HomePage;
