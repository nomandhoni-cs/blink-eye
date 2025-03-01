// app/contributors/page.tsx
// import Image from "next/image";
import Link from "next/link";

// // Define TypeScript interfaces for type safety
// interface ContributorData {
//   id: number;
//   login: string; // GitHub username
//   html_url: string; // GitHub profile URL
//   avatar_url: string; // Avatar image URL
// }

// // Fetch contributors data at build time
// async function fetchContributors() {
//   try {
//     const res = await fetch(
//       "https://api.github.com/repos/nomandhoni-cs/blink-eye/contributors"
//       // { next: { revalidate: 60 * 60 } } // Revalidate every hour (ISR)
//     );

//     if (!res.ok) {
//       throw new Error(`Failed to fetch contributors: ${res.status}`);
//     }

//     const contributors: ContributorData[] = await res.json();
//     return contributors;
//   } catch (error) {
//     console.error("Error fetching contributors:", error);
//     return [];
//   }
// }

// // Server Component to display contributors
// export default async function ContributorsPage() {
//   const contributors = await fetchContributors();

//   return (
//     <section id="contributors" className="container">
//       <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
//         <h2 className="font-heading text-xl leading-[1.1] sm:text-2xl md:text-3xl">
//           Our Contributors
//         </h2>
//         <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
//           These are the people who have contributed to the development of Blink
//           Eye.
//         </p>
//         <div
//           id="contributors-list"
//           className="flex flex-wrap justify-center gap-4"
//         >
//           {contributors.length > 0 ? (
//             contributors.map((contributor) => (
//               <div key={contributor.id}>
//                 <Link
//                   href={contributor.html_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <Image
//                     src={contributor.avatar_url}
//                     alt={`${contributor.login}'s avatar`}
//                     width={50}
//                     height={50}
//                     className="rounded-full"
//                   />
//                 </Link>
//               </div>
//             ))
//           ) : (
//             <p>No contributors found.</p>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }
import React from "react";
import ContribRocks from "./ContribRocks";

const ContributorsPage = () => {
  return (
    <section id="contributors" className="container">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-heading text-xl leading-[1.1] sm:text-2xl md:text-3xl">
          Our Contributors
        </h2>
        <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          These are the people who have contributed to the development of Blink
          Eye.
        </p>
        <div
          id="contributors-list"
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="https://github.com/nomandhoni-cs/blink-eye/graphs/contributors"
            target="_blank"
          >
            {/* <Image
              src="https://contrib.rocks/image?repo=nomandhoni-cs/blink-eye"
              alt={`Contributors's avatar`}
              width={50}
              height={50}
              // className="rounded-full"
            /> */}
            <ContribRocks />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContributorsPage;
