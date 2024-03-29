import React, { useEffect, useState } from "react";
import Post from "../Components/Post";

function HomePage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("https://wanderer-tales-api.vercel.app/getblogposts")
      .then((response) => response.json())
      .then((posts) => setPosts(posts))
      .catch((error) => console.error("Error fetching blog posts:", error));
  }, []);
  return (
    <div className="flex items-center justify-center overflow-x-scroll no-scrollbar m-5 p-5 w-[1440px] px-4">
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
