import { useRef, useState } from "react";
import type { FormEvent } from "react";

import type { SkippedTradeRecord, TradeResult } from "@/shared/types/trading";

interface SkipFormProps {
  onAddSkipped: (record: SkippedTradeRecord) => void;
  onAddAttachments?: (files: File[]) => void;
}

export const SkipForm = ({ onAddSkipped, onAddAttachments }: SkipFormProps) => {
  const [asset, setAsset] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<TradeResult>("lose");
  const [rr, setRr] = useState("-1");
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedRr = Number(rr);
    if (!asset.trim() || !reason.trim() || Number.isNaN(parsedRr)) {
      return;
    }

    onAddSkipped({
      id: crypto.randomUUID(),
      asset: asset.trim(),
      reason: reason.trim(),
      hypotheticalResult: result,
      hypotheticalRr: parsedRr,
      comment: comment.trim(),
    });
    if (attachments.length) {
      onAddAttachments?.(attachments);
    }

    setAsset("");
    setReason("");
    setResult("lose");
    setRr("-1");
    setComment("");
    setAttachments([]);
    if (attachmentsInputRef.current) {
      attachmentsInputRef.current.value = "";
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h3>Add skipped trade</h3>
      <label>
        Asset
        <input value={asset} onChange={(event) => setAsset(event.target.value)} placeholder="BTC" required />
      </label>
      <label>
        Skip Reason
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Not aligned with strategy rules"
          required
        />
      </label>
      <label>
        Hypothetical Result
        <select value={result} onChange={(event) => setResult(event.target.value as TradeResult)}>
          <option value="win">Win</option>
          <option value="lose">Loss</option>
        </select>
      </label>
      <label>
        Hypothetical RR
        <input type="number" step="0.1" value={rr} onChange={(event) => setRr(event.target.value)} required />
      </label>
      <label>
        Comment
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={2} />
      </label>
      <label>
        Trade Screenshots (optional)
        <input
          ref={attachmentsInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
        />
      </label>
      <button type="submit">Save skip</button>
    </form>
  );
};
