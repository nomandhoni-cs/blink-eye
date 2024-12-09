const ProductHuntWidget = async () => {
  const data = await fetch(
    "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=445267&theme=light"
  );
  const svgContent = await data.text();
  return <span dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

export default ProductHuntWidget;
