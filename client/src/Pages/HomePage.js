import React, { useEffect, useState } from "react";
import Post from "../Components/Post";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/getblogposts")
      .then((response) => response.json())
      .then((posts) => {
        setPosts(posts);
        setFilteredPosts(posts); // Set filtered posts initially
      })
      .catch((error) => console.error("Error fetching blog posts:", error));
  }, []);

 

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    const newFilteredPosts = posts.filter((post) =>
      post.place.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredPosts(newFilteredPosts);
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex  justify-between w-[30%] self-center bg-green-100 focus-within:border-green-600  focus-within:bg-white duration-500 ease-out px-3 py-2 rounded-full border-green-200 border">
        {true && (
          <input
            onChange={handleInputChange}
            type="text"
            placeholder="Search your story..."
            className="bg-transparent w-full outline-none mx-2 text-green-800 placeholder-green-500"
          />
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="bg-green-400 rounded-full p-1 self-center cursor-pointer w-8 h-8 text-white"
           onClick={handleSearch}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <div className="max-w-[1400px] flex example overflow-scroll mx-10 my-5 p-5 px-4">
        {filteredPosts.map((post, index) => (
          <div key={index} className="postcontainer mx-2 flex-shrink-0 h-full my-0">
            <Post {...post} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
