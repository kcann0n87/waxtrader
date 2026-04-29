"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

export function ReplyComposer({ with_, onSend }: { with_: string; onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="border-t border-slate-100 p-4">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder={`Reply to ${with_}...`}
          className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <div className="flex flex-col gap-1.5">
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-md bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
          <button
            className="rounded-md border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Attach file"
          >
            <Paperclip size={16} />
          </button>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-slate-400">
        Press ⌘↵ to send. Be respectful — abusive messages can result in account suspension.
      </div>
    </div>
  );
}
