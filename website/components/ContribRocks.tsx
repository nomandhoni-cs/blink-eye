const ContribRocks = async () => {
  const data = await fetch(
    "https://contrib.rocks/image?repo=nomandhoni-cs/blink-eye"
  );
  const svgContent = await data.text();
  return <span dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

export default ContribRocks;
