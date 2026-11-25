import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { GalleryView } from "@/views/gallery/GalleryView";
import { InvestigationView } from "@/views/investigation/InvestigationView";

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-surface text-slate-100">
        <Routes>
          <Route path="/" element={<GalleryView />} />
          <Route path="/investigation/:slug" element={<InvestigationView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}