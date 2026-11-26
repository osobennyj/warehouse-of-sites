import { useRef, useState } from "react";
import type { FormEvent } from "react";

import type { PositionType, TradeRecord, TradeResult, ViolationTag } from "@/shared/types/trading";

interface TradeFormProps {
  onAddTrade: (trade: TradeRecord) => void;
  onAddAttachments?: (files: File[]) => void;
}

const violationOptions: Array<{ label: string; value: ViolationTag }> = [
  { label: "FOMO", value: "fomo" },
  { label: "Revenge", value: "revenge" },
  { label: "Overtrade", value: "overtrade" },
  { label: "Impulse", value: "impulse" },
  { label: "Other", value: "other" },
];

export const TradeForm = ({ onAddTrade, onAddAttachments }: TradeFormProps) => {
  const [asset, setAsset] = useState("");
  const [positionType, setPositionType] = useState<PositionType>("long");
  const [result, setResult] = useState<TradeResult>("win");
  const [rr, setRr] = useState("1");
  const [byPlan, setByPlan] = useState(true);
  const [violationTag, setViolationTag] = useState<ViolationTag>("fomo");
  const [attachments, setAttachments] = useState<File[]>([]);
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedRr = Number(rr);
    if (!asset.trim() || Number.isNaN(parsedRr)) {
      return;
    }

    onAddTrade({
      id: crypto.randomUUID(),
      asset: asset.trim(),
      positionType,
      result,
      rr: parsedRr,
      byPlan,
      violationTag: byPlan ? undefined : violationTag,
    });
    if (attachments.length) {
      onAddAttachments?.(attachments);
    }

    setAsset("");
    setResult("win");
    setRr("1");
    setByPlan(true);
    setAttachments([]);
    if (attachmentsInputRef.current) {
      attachmentsInputRef.current.value = "";
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h3>Add Trade</h3>
      <label>
        Asset
        <input value={asset} onChange={(event) => setAsset(event.target.value)} placeholder="BTC" required />
      </label>
      <label>
        Type
        <select value={positionType} onChange={(event) => setPositionType(event.target.value as PositionType)}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </label>
      <label>
        Result
        <select value={result} onChange={(event) => setResult(event.target.value as TradeResult)}>
          <option value="win">Win</option>
          <option value="lose">Lose</option>
        </select>
      </label>
      <label>
        RR
        <input type="number" step="0.1" value={rr} onChange={(event) => setRr(event.target.value)} required />
      </label>
      <label className="checkbox">
        <input type="checkbox" checked={byPlan} onChange={(event) => setByPlan(event.target.checked)} />
        By-Plan Trade
      </label>
      {!byPlan && (
        <label>
          Violation Tag
          <select value={violationTag} onChange={(event) => setViolationTag(event.target.value as ViolationTag)}>
            {violationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
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
      <button type="submit">Save Trade</button>
    </form>
  );
};
