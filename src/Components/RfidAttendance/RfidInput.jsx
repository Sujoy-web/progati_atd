import { FaIdCard } from "react-icons/fa";

export default function RfidInput({ rfid, setRfid, onScan, inputRef }) {
  return (
    <div className="w-full max-w-lg mb-6 flex flex-col items-center gap-20">
      <div className="w-full relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <FaIdCard className="text-gray-400" />
        </div>
        <input
          ref={inputRef}
          value={rfid}
          onChange={(e) => setRfid(e.target.value)}
          onKeyDown={onScan}
          placeholder="Scan RFID and press Enter"
          className="w-full pl-12 pr-5 py-4 text-center text-lg font-mono rounded-xl bg-white text-gray-800 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}