import { isDemoMode } from "@/shared/config/demo";

import * as demo from "@/shared/api/demo/demo-journal";
import * as live from "./journal-api.supabase";

const impl = isDemoMode ? demo : live;

export const fetchJournalForMonth = impl.fetchJournalForMonth;
export const saveDayMeta = impl.saveDayMeta;
export const addTrade = impl.addTrade;
export const addSkippedTrade = impl.addSkippedTrade;
export const updateTrade = impl.updateTrade;
export const updateSkippedTrade = impl.updateSkippedTrade;
export const deleteTrade = impl.deleteTrade;
export const deleteSkippedTrade = impl.deleteSkippedTrade;
export const restoreTrade = impl.restoreTrade;
export const restoreSkippedTrade = impl.restoreSkippedTrade;
export const addDayAttachment = impl.addDayAttachment;
export const removeDayAttachment = impl.removeDayAttachment;
export const clearDay = impl.clearDay;
