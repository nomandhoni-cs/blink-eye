const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#FE4C55] text-white text-base p-3 text-center rounded-md mb-4">
      <p className="font-semibold">
        Want the full experience? Support the developer and unlock all features
        with a license! <br />
        <a
          href="https://blinkeye.vercel.app/pricing"
          target="_blank"
          className="ml-2 underline font-bold hover:text-[#FFD700] transition-colors"
        >
          Get your license here!
        </a>
      </p>
    </div>
  );
};

export default AnnouncementBar;
