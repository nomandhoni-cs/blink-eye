import Image from "next/image";
import Link from "next/link";
interface ContributorData {
  id: number;
  html_url: string;
  avatar_url: string;
}
const fromApi = async () => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/contributors",
    { next: { revalidate: 86400 } }
  );
  const data: ContributorData[] = await res.json();
  return data;
};
const Contributors = async () => {
  const data = await fromApi();
  return (
    <>
      <section id="contributors" className="container">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-bold text-xl leading-[1.1] sm:text-2xl md:text-3xl">
            Our Contributors
          </h2>
          <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            These are the people who have contributed to the development of
            Blink Eye.
          </p>
          <div
            id="contributors-list"
            className="flex flex-wrap justify-center gap-4"
          >
            {data.map((contributor: ContributorData) => {
              return (
                <div key={contributor.id}>
                  <Link href={contributor.html_url} target={`_blank`}>
                    <Image
                      src={contributor.avatar_url + "&s=50"}
                      className="rounded-full"
                      alt="Contributors Image"
                      width={50}
                      height={50}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contributors;
