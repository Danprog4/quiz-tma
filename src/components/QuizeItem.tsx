export const QuizeItem = () => {
  return (
    <div className="x relative w-full border-2 border-white">
      <div className="h-6 w-full bg-[#010089]">
        <p className="px-2 py-1 text-xs uppercase">Музыка</p>
      </div>
      <img
        className="h-40 object-cover"
        src={"/item.png"}
        alt={""}
        width={1000}
        height={100}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)]" />
      <div className="absolute bottom-2 left-2">
        <h3 className="text-xs text-[#F97316] uppercase">Новинка</h3>
        <h3 className="text-md mt-1 uppercase">LUCKI - GEMINI</h3>
      </div>
    </div>
  );
};
