import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [place, setPlace] = useState("");
  const [file, setFile] = useState(null);
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

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/getblogposts/${id}`)
      .then((response) => response.json())
      .then((postInfo) => {
        setTitle(postInfo.title);
        setPlace(postInfo.place);
        setSummary(postInfo.summary);
        setContent(postInfo.content);
      })
      .catch((error) => {
        console.error("Fetch post error:", error);
      });
  }, [id]);

  const updatePost = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", title);
    data.append("place", place);
    data.append("summary", summary);
    data.append("content", stripHtmlTags(content)); 
    data.append("file", file);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/getblogposts/update/${id}`,
        {
          method: "PUT",
          body: data,
          credentials: "include",
        }
      );
      if (response.ok) {
        setRedirect(true);
      }
    } catch (error) {
      console.error("Update post error:", error);
    }
  };

  if (redirect) {
    navigate(`/getblogposts/${id}`);
  }

  function stripHtmlTags(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  return (
    <form onSubmit={updatePost} className="updatepost flex flex-col gap-3 m-8">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 focus:outline-none border-b-2 border-black montserrat"
      />
      <input
        type="text"
        placeholder="Place"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        className="p-2 focus:outline-none border-b-2 border-black montserrat"
      />
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="p-2 focus:outline-none border-b-2 border-black montserrat"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="montserrat file:text-[rgb(4,95,68)] file:border-none file:rounded-xl file:bg-[rgb(16,255,183)]"
      />
      <ReactQuill value={content} onChange={setContent} 
      className="mt-5 p-2 focus:outline-none  montserrat"
      modules={modules}
      formats={formats}/>
      <button type="submit" className="montserrat p-2 bg-[rgb(16,255,183)] w-[15rem] self-center rounded-xl border-b-4 border-[rgb(0,114,80)] hover:bg-[rgb(0,127,89)] duration-300 hover:text-white">Update Blog</button>
    </form>
  );
}

export default EditPost;
