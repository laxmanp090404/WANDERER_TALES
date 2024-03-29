import { format } from "date-fns";
import { Link } from "react-router-dom";
export default function Post({
  _id,
  title,
  place,
  summary,
  content,
  cover,
  createdAt,
  author,
}) {
  const formattedDate = format(new Date(createdAt), "MMM d,yyyy HH:mm");
  return (
    <div className="post shadow-2xl  p-6 w-[400px] h-[500px] rounded-xl">
      <div className="image">
        <Link to={`/getblogposts/${_id}`}>
          <img
            src={"https://vercel.com/laxmans-projects-b93c1af0/wanderer-tales-api/" + cover}
            className="rounded-xl"
            alt="blog"
          />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/getblogposts/${_id}`}>
          <h2 className="text-3xl edu-nsw text-center">"{title}"</h2>
        </Link>
        <div className="12cont flex justify-between gap-2">
          <div className="part1">
            <a
              href="#"
              className="author montserrat text-[rgb(18,7,88)] text-lg"
            >
              {author.username.toUpperCase().charAt(0) +
                author.username.slice(1)}
            </a>
            <div className="location font-mono font-bold">{place}</div>
          </div>
          <div className="part2">
            <time className="text-red-800 kanit-bold">{formattedDate}</time>
          </div>
        </div>

        <p className="summary font-mono">{summary}</p>
        {/* <p>{content}</p> */}
      </div>
    </div>
  );
}
