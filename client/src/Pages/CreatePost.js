import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [place, setPlace] = useState("");
  const [redirect, setRedirect] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  async function createNewPost(e) {
    e.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", stripHtmlTags(content)); // Strip HTML tags before storing
    data.set("file", files[0]);
    data.set("place", place);
    const response = await fetch("http://localhost:4000/createblog", {
      method: "POST",
      body: data,
      credentials: "include",
    });
    if (response.ok) {
      setRedirect(true);
      alert("created post successfully");
    }
  }

  function stripHtmlTags(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  if (redirect) {
    navigate("/");
  }

  return (
    <form
      onSubmit={createNewPost}
      className="createblogform flex flex-col gap-3 m-8"
    >
      <input
        type="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 focus:outline-none border-b-2 border-black montserrat"
      />
      <input
        type="text"
        placeholder="Place"
        className="p-2 focus:outline-none border-b-2 border-black montserrat"
        value={place}
        onChange={(e) => {
          setPlace(e.target.value);
        }}
      />
      <input
        type="summary"
        placeholder="Description"
        className="p-2 focus:outline-none border-b-2 border-black montserrat"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setFiles(e.target.files)}
        className="montserrat file:text-[rgb(4,95,68)] file:border-none file:rounded-xl file:bg-[rgb(16,255,183)]"
      />
      <ReactQuill
        onChange={(value) => setContent(value)}
        modules={modules}
        formats={formats}
        placeholder="Share your experiences..."
        className="mt-5 p-2 focus:outline-none  montserrat"
        style={{ fontFamily: "Montserrat" }}
        value={content}
      />
      <button className="montserrat p-2 bg-[rgb(16,255,183)] w-[15rem] self-center rounded-xl border-b-4 border-[rgb(0,114,80)] hover:bg-[rgb(0,127,89)] duration-300 hover:text-white">
        Create Blog
      </button>
    </form>
  );
}

export default CreatePost;
