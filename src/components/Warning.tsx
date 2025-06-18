import { useSnapshot } from "valtio";
import { setShowWarning, store } from "~/store";

interface WarningProps {
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const Warning = ({ onConfirm, onCancel }: WarningProps) => {
  const { showWarning } = useSnapshot(store);

  const handleConfirm = () => {
    onConfirm?.();
    setShowWarning(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="absolute inset-0 z-[10000] flex h-screen w-full flex-col items-center justify-center gap-4 bg-black/50 px-4">
      {/* Main Warning Content */}
      <div className="flex w-72 flex-col items-center justify-center gap-6 rounded-none border-2 border-black bg-[#D9D9D9] p-3">
        {/* Warning Text */}
        <div className="flex w-full flex-col items-center gap-4 pt-6">
          {/* Main Title */}
          <h2 className="text-center text-lg leading-[1.05] font-normal text-[#0100BE]">
            Точно выйти?
          </h2>

          {/* Warning Header */}
          <h3 className="text-center text-base leading-[1.05] font-normal text-black">
            Выход из квиза
          </h3>

          {/* Warning Description */}
          <p className="text-center text-sm leading-[1.05] font-normal text-black">
            Весь прогресс будет утерян
          </p>
        </div>

        {/* Buttons */}
        <div className="flex w-full items-center gap-1.5 pb-3">
          {/* Yes Button */}
          <button
            onClick={handleConfirm}
            className="relative flex flex-1 items-center justify-center gap-2.5 bg-[#C0C0C0] px-6 py-3.5"
            style={{
              borderTop: "2px solid #E6E6E6",
              borderLeft: "4px solid #E6E6E6",
              borderRight: "2px solid #2A2927",
              borderBottom: "2px solid #2A2927",
            }}
          >
            <span className="text-center text-base leading-[1.05] font-normal text-black">
              Да
            </span>
            {/* Inner shadow borders */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                borderTop: "1px solid #F2F2F2",
                borderLeft: "3px solid #F2F2F2",
                borderRight: "1px solid #4C4C4C",
                borderBottom: "1px solid #4C4C4C",
              }}
            />
          </button>

          {/* No Button */}
          <button
            onClick={handleCancel}
            className="relative flex flex-1 items-center justify-center gap-2.5 bg-[#C0C0C0] px-6 py-3.5"
            style={{
              borderTop: "2px solid #E6E6E6",
              borderLeft: "4px solid #E6E6E6",
              borderRight: "2px solid #2A2927",
              borderBottom: "2px solid #2A2927",
            }}
          >
            <span className="text-center text-base leading-[1.05] font-normal text-black">
              Нет
            </span>
            {/* Inner shadow borders */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                borderTop: "1px solid #F2F2F2",
                borderLeft: "3px solid #F2F2F2",
                borderRight: "1px solid #4C4C4C",
                borderBottom: "1px solid #4C4C4C",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
