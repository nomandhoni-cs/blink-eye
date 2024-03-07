import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute",
};
const Contribute = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Contribute</h2>
      <p className="text-lg mb-4">
        Contributions are welcome! Feel free to open issues or submit pull
        requests.
      </p>
      <p className="text-lg">
        If you would like to contribute to Blink Eye, please follow these steps:
      </p>
      <ol className="list-decimal ml-6 mt-4">
        <li>Fork the repository on GitHub.</li>
        <li>Create a new branch for your feature or fix.</li>
        <li>Make your changes and commit them.</li>
        <li>Push your changes to your fork.</li>
        <li>Submit a pull request to the main repository.</li>
      </ol>
      <p className="text-lg mt-4">
        Thank you for your interest in contributing to Blink Eye!
      </p>
    </div>
  );
};

export default Contribute;
