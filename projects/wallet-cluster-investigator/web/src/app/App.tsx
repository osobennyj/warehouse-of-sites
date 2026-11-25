import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortfolioTopBar } from "@/widgets/portfolio-chrome/PortfolioTopBar";
import { AnalyzeWalletView } from "@/views/analyze/AnalyzeWalletView";
import { GalleryView } from "@/views/gallery/GalleryView";
import { InvestigationView } from "@/views/investigation/InvestigationView";

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-zinc-950 pt-16 text-zinc-100">
        <PortfolioTopBar />
        <Routes>
          <Route path="/" element={<GalleryView />} />
          <Route path="/analyze" element={<AnalyzeWalletView />} />
          <Route path="/investigation/:slug" element={<InvestigationView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}