import { useState } from "react";
import ContextDialog from "./ContextDialog";

export default function DemoPage() {
  const [open, setOpen] = useState(false);
  const [contextData, setContextData] = useState(null);

  const handleSave = (data) => {
    console.log("Saved context:", data);
    setContextData(data);
  };

  return (
    <div className="text-white p-8">
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 px-4 py-2 rounded-lg"
      >
        Open Context Dialog
      </button>

      {contextData && (
        <div className="mt-6">
          <h3 className="font-bold">Saved Context</h3>
          <p>Title: {contextData.title}</p>
          <p>Text: {contextData.text}</p>
        </div>
      )}

      <ContextDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
