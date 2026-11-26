import { getMonthEnd, getMonthStart } from "@/shared/lib/date";
import { assertSupabaseConfigured, supabase } from "@/shared/api/supabase/client";
import type { DayAttachment, DayRecord, MoodTag, SkippedTradeRecord, TradeRecord, TradingJournal } from "@/shared/types/trading";

interface DayRow {
  id: string;
  user_id: string;
  date: string;
  comment: string;
  mood: MoodTag | null;
  no_trade_day: boolean | null;
}

interface TradeRow {
  id: string;
  day_id: string;
  asset: string;
  position_type: "long" | "short";
  result: "win" | "lose";
  rr: number;
  by_plan: boolean;
  violation_tag: TradeRecord["violationTag"] | null;
  entry: number | null;
  stop: number | null;
  take: number | null;
}

interface SkippedTradeRow {
  id: string;
  day_id: string;
  asset: string;
  reason: string;
  hypothetical_result: "win" | "lose";
  hypothetical_rr: number;
  comment: string | null;
}

interface AttachmentRow {
  id: string;
  day_id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

const toDayRecord = (day: DayRow): DayRecord => ({
  id: day.id,
  date: day.date,
  comment: day.comment ?? "",
  mood: day.mood ?? undefined,
  noTradeDay: day.no_trade_day ?? false,
  trades: [],
  skippedTrades: [],
  attachments: [],
});

const toTradeRecord = (row: TradeRow): TradeRecord => ({
  id: row.id,
  asset: row.asset,
  positionType: row.position_type,
  result: row.result,
  rr: Number(row.rr),
  byPlan: row.by_plan,
  violationTag: row.violation_tag ?? undefined,
  entry: row.entry ?? undefined,
  stop: row.stop ?? undefined,
  take: row.take ?? undefined,
});

const toSkippedRecord = (row: SkippedTradeRow): SkippedTradeRecord => ({
  id: row.id,
  asset: row.asset,
  reason: row.reason,
  hypotheticalResult: row.hypothetical_result,
  hypotheticalRr: Number(row.hypothetical_rr),
  comment: row.comment ?? undefined,
});

const insertTradeRow = async (userId: string, dayId: string, trade: TradeRecord): Promise<TradeRecord> => {
  const { data, error } = await supabase
    .from("trades")
    .insert({
      id: trade.id,
      day_id: dayId,
      user_id: userId,
      asset: trade.asset,
      position_type: trade.positionType,
      result: trade.result,
      rr: trade.rr,
      by_plan: trade.byPlan,
      violation_tag: trade.violationTag ?? null,
      entry: trade.entry ?? null,
      stop: trade.stop ?? null,
      take: trade.take ?? null,
    })
    .select("id,day_id,asset,position_type,result,rr,by_plan,violation_tag,entry,stop,take")
    .single();

  if (error) throw new Error(error.message);
  return toTradeRecord(data as TradeRow);
};

const insertSkippedRow = async (userId: string, dayId: string, record: SkippedTradeRecord): Promise<SkippedTradeRecord> => {
  const { data, error } = await supabase
    .from("skipped_trades")
    .insert({
      id: record.id,
      day_id: dayId,
      user_id: userId,
      asset: record.asset,
      reason: record.reason,
      hypothetical_result: record.hypotheticalResult,
      hypothetical_rr: record.hypotheticalRr,
      comment: record.comment ?? null,
    })
    .select("id,day_id,asset,reason,hypothetical_result,hypothetical_rr,comment")
    .single();

  if (error) throw new Error(error.message);
  return toSkippedRecord(data as SkippedTradeRow);
};

const attachUrls = async (rows: AttachmentRow[]): Promise<DayAttachment[]> => {
  if (!rows.length) return [];

  const paths = rows.map((item) => item.file_path);
  const { data, error } = await supabase.storage.from("trade-screenshots").createSignedUrls(paths, 60 * 60);
  if (error) throw new Error(error.message);

  const urlByPath = new Map<string, string>();
  data.forEach((item) => {
    if (item.path && item.signedUrl) {
      urlByPath.set(item.path, item.signedUrl);
    }
  });

  return rows.map((row) => ({
    id: row.id,
    path: row.file_path,
    name: row.file_name,
    url: urlByPath.get(row.file_path) ?? "",
    createdAt: row.created_at,
  }));
};

const ensureDay = async (userId: string, date: string): Promise<DayRow> => {
  const { data, error } = await supabase
    .from("days")
    .upsert(
      {
        user_id: userId,
        date,
      },
      {
        onConflict: "user_id,date",
        ignoreDuplicates: false,
      },
    )
    .select("id,user_id,date,comment,mood,no_trade_day")
    .single();

  if (error) throw new Error(error.message);
  return data as DayRow;
};

export const fetchJournalForMonth = async (userId: string, monthDate: Date): Promise<TradingJournal> => {
  assertSupabaseConfigured();
  const start = getMonthStart(monthDate).toISOString().slice(0, 10);
  const end = getMonthEnd(monthDate).toISOString().slice(0, 10);

  const { data: dayRows, error: dayError } = await supabase
    .from("days")
    .select("id,user_id,date,comment,mood,no_trade_day")
    .eq("user_id", userId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });
  if (dayError) throw new Error(dayError.message);

  const days = (dayRows ?? []) as DayRow[];
  const journal = days.reduce<TradingJournal>((acc, row) => {
    acc[row.date] = toDayRecord(row);
    return acc;
  }, {});

  if (!days.length) return journal;

  const dayIds = days.map((day) => day.id);

  const [{ data: tradeRows, error: tradeError }, { data: skippedRows, error: skippedError }, { data: attachmentRows, error: attachmentError }] =
    await Promise.all([
      supabase.from("trades").select("id,day_id,asset,position_type,result,rr,by_plan,violation_tag,entry,stop,take").in("day_id", dayIds),
      supabase.from("skipped_trades").select("id,day_id,asset,reason,hypothetical_result,hypothetical_rr,comment").in("day_id", dayIds),
      supabase.from("day_attachments").select("id,day_id,file_name,file_path,created_at").in("day_id", dayIds),
    ]);

  if (tradeError) throw new Error(tradeError.message);
  if (skippedError) throw new Error(skippedError.message);
  if (attachmentError) throw new Error(attachmentError.message);

  const dayById = new Map(days.map((day) => [day.id, day.date]));

  ((tradeRows ?? []) as TradeRow[]).forEach((row) => {
    const date = dayById.get(row.day_id);
    if (date && journal[date]) {
      journal[date].trades.push(toTradeRecord(row));
    }
  });

  ((skippedRows ?? []) as SkippedTradeRow[]).forEach((row) => {
    const date = dayById.get(row.day_id);
    if (date && journal[date]) {
      journal[date].skippedTrades.push(toSkippedRecord(row));
    }
  });

  const attachmentList = await attachUrls((attachmentRows ?? []) as AttachmentRow[]);
  attachmentList.forEach((attachment) => {
    const row = (attachmentRows as AttachmentRow[]).find((item) => item.id === attachment.id);
    if (!row) return;
    const date = dayById.get(row.day_id);
    if (date && journal[date]) {
      journal[date].attachments.push(attachment);
    }
  });

  return journal;
};

export const saveDayMeta = async (
  userId: string,
  date: string,
  fields: { comment?: string; mood?: MoodTag | undefined; noTradeDay?: boolean },
): Promise<DayRecord> => {
  assertSupabaseConfigured();
  const day = await ensureDay(userId, date);
  const { data, error } = await supabase
    .from("days")
    .update({
      comment: fields.comment ?? day.comment,
      mood: fields.mood ?? null,
      no_trade_day: fields.noTradeDay ?? day.no_trade_day ?? false,
    })
    .eq("id", day.id)
    .select("id,user_id,date,comment,mood,no_trade_day")
    .single();

  if (error) throw new Error(error.message);
  return toDayRecord(data as DayRow);
};

export const addTrade = async (userId: string, date: string, trade: TradeRecord): Promise<TradeRecord> => {
  assertSupabaseConfigured();
  const day = await ensureDay(userId, date);
  return insertTradeRow(userId, day.id, trade);
};

export const addSkippedTrade = async (
  userId: string,
  date: string,
  record: SkippedTradeRecord,
): Promise<SkippedTradeRecord> => {
  assertSupabaseConfigured();
  const day = await ensureDay(userId, date);
  return insertSkippedRow(userId, day.id, record);
};

export const updateTrade = async (userId: string, trade: TradeRecord): Promise<TradeRecord> => {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("trades")
    .update({
      asset: trade.asset,
      position_type: trade.positionType,
      result: trade.result,
      rr: trade.rr,
      by_plan: trade.byPlan,
      violation_tag: trade.violationTag ?? null,
      entry: trade.entry ?? null,
      stop: trade.stop ?? null,
      take: trade.take ?? null,
    })
    .eq("id", trade.id)
    .eq("user_id", userId)
    .select("id,day_id,asset,position_type,result,rr,by_plan,violation_tag,entry,stop,take")
    .single();

  if (error) throw new Error(error.message);
  return toTradeRecord(data as TradeRow);
};

export const updateSkippedTrade = async (userId: string, record: SkippedTradeRecord): Promise<SkippedTradeRecord> => {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("skipped_trades")
    .update({
      asset: record.asset,
      reason: record.reason,
      hypothetical_result: record.hypotheticalResult,
      hypothetical_rr: record.hypotheticalRr,
      comment: record.comment ?? null,
    })
    .eq("id", record.id)
    .eq("user_id", userId)
    .select("id,day_id,asset,reason,hypothetical_result,hypothetical_rr,comment")
    .single();

  if (error) throw new Error(error.message);
  return toSkippedRecord(data as SkippedTradeRow);
};

export const deleteTrade = async (userId: string, tradeId: string): Promise<TradeRecord> => {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("trades")
    .delete()
    .eq("id", tradeId)
    .eq("user_id", userId)
    .select("id,day_id,asset,position_type,result,rr,by_plan,violation_tag,entry,stop,take")
    .single();

  if (error) throw new Error(error.message);
  return toTradeRecord(data as TradeRow);
};

export const deleteSkippedTrade = async (userId: string, skippedId: string): Promise<SkippedTradeRecord> => {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("skipped_trades")
    .delete()
    .eq("id", skippedId)
    .eq("user_id", userId)
    .select("id,day_id,asset,reason,hypothetical_result,hypothetical_rr,comment")
    .single();

  if (error) throw new Error(error.message);
  return toSkippedRecord(data as SkippedTradeRow);
};

export const restoreTrade = async (userId: string, date: string, trade: TradeRecord): Promise<TradeRecord> => {
  assertSupabaseConfigured();
  const day = await ensureDay(userId, date);
  return insertTradeRow(userId, day.id, trade);
};

export const restoreSkippedTrade = async (
  userId: string,
  date: string,
  record: SkippedTradeRecord,
): Promise<SkippedTradeRecord> => {
  assertSupabaseConfigured();
  const day = await ensureDay(userId, date);
  return insertSkippedRow(userId, day.id, record);
};

export const addDayAttachment = async (userId: string, date: string, file: File): Promise<DayAttachment> => {
  assertSupabaseConfigured();
  const day = await ensureDay(userId, date);

  const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const objectPath = `${userId}/${day.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("trade-screenshots").upload(objectPath, file, {
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: attachmentRow, error: insertError } = await supabase
    .from("day_attachments")
    .insert({
      day_id: day.id,
      user_id: userId,
      file_path: objectPath,
      file_name: file.name,
    })
    .select("id,day_id,file_name,file_path,created_at")
    .single();
  if (insertError) throw new Error(insertError.message);

  const { data: signed, error: signedError } = await supabase.storage
    .from("trade-screenshots")
    .createSignedUrl(objectPath, 60 * 60);
  if (signedError) throw new Error(signedError.message);

  return {
    id: (attachmentRow as AttachmentRow).id,
    path: objectPath,
    name: file.name,
    url: signed.signedUrl,
    createdAt: (attachmentRow as AttachmentRow).created_at,
  };
};

export const removeDayAttachment = async (attachment: DayAttachment): Promise<void> => {
  assertSupabaseConfigured();
  const { error: removeStorageError } = await supabase.storage.from("trade-screenshots").remove([attachment.path]);
  if (removeStorageError) throw new Error(removeStorageError.message);

  const { error: removeDbError } = await supabase.from("day_attachments").delete().eq("id", attachment.id);
  if (removeDbError) throw new Error(removeDbError.message);
};

export const clearDay = async (userId: string, date: string): Promise<void> => {
  assertSupabaseConfigured();

  const { data: day, error: dayError } = await supabase
    .from("days")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (dayError) throw new Error(dayError.message);
  if (!day?.id) return;

  const dayId = day.id as string;

  const { data: attachmentRows, error: attachmentRowsError } = await supabase
    .from("day_attachments")
    .select("file_path")
    .eq("day_id", dayId)
    .eq("user_id", userId);
  if (attachmentRowsError) throw new Error(attachmentRowsError.message);

  const attachmentPaths = ((attachmentRows ?? []) as Array<{ file_path: string }>).map((item) => item.file_path);
  if (attachmentPaths.length > 0) {
    const { error: removeStorageError } = await supabase.storage.from("trade-screenshots").remove(attachmentPaths);
    if (removeStorageError) throw new Error(removeStorageError.message);
  }

  const [{ error: removeAttachmentsError }, { error: removeTradesError }, { error: removeSkippedError }] = await Promise.all([
    supabase.from("day_attachments").delete().eq("day_id", dayId).eq("user_id", userId),
    supabase.from("trades").delete().eq("day_id", dayId).eq("user_id", userId),
    supabase.from("skipped_trades").delete().eq("day_id", dayId).eq("user_id", userId),
  ]);

  if (removeAttachmentsError) throw new Error(removeAttachmentsError.message);
  if (removeTradesError) throw new Error(removeTradesError.message);
  if (removeSkippedError) throw new Error(removeSkippedError.message);

  const { error: removeDayError } = await supabase.from("days").delete().eq("id", dayId).eq("user_id", userId);
  if (removeDayError) throw new Error(removeDayError.message);
};
