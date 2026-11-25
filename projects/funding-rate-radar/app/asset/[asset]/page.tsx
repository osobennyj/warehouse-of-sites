import { AssetDetailsView, STATIC_ASSET_SLUGS } from "@/views/asset-details";

export function generateStaticParams() {
  return STATIC_ASSET_SLUGS.map((asset) => ({ asset }));
}

export default async function AssetPage({ params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  return <AssetDetailsView asset={asset} />;
}