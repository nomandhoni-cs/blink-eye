import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};
const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Privacy</h2>
      <p className="text-lg mb-4">
        MIT License: Open-source use. MIT License Details
      </p>
      <p className="text-lg mb-4">
        Commercial License: For business purposes. Contact Noman Dhoni at{" "}
        <a href="mailto:alnoman.dhoni@gmail.com">alnoman.dhoni@gmail.com</a> for
        licensing options.
      </p>
      <h3 className="text-xl font-bold mb-2">Contact</h3>
      <p className="text-lg mb-4">
        For inquiries and support, please contact Noman Dhoni:
      </p>
      <ul className="list-disc ml-6">
        <li>
          Email:{" "}
          <a href="mailto:alnoman.dhoni@gmail.com">alnoman.dhoni@gmail.com</a>
        </li>
        <li>
          Twitter: <a href="https://twitter.com/nomandhoni">@nomandhoni</a>
        </li>
      </ul>
      <p className="text-lg mt-4">
        Contributing: Contributions are welcome! Feel free to open issues or
        submit pull requests.
      </p>
    </div>
  );
};

export default Privacy;
