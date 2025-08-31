
import React from "react";

export default function DeveloperAttribution() {
  return (
    <div className="w-full flex justify-center items-center bg-neutral-900 py-6 border-t border-neutral-800">
      <div className="flex flex-col items-center">
        <img
          src="https://files.catbox.moe/urnjdz.jpg"
          alt="Developer Maxwell"
          className="h-20 w-20 rounded-full border-4 border-green-600 object-cover shadow-md mb-3"
        />
        <span className="text-lg font-semibold text-white">Developer: Maxwell</span>
        <span className="text-gray-400 text-sm mt-1">This site was built by Maxwell.</span>
      </div>
    </div>
  );
}
