export const siteConfig = {
  title: "Wallet Cluster Investigator",
  pitch: "Expand a seed EVM address into a funding graph and explainable wallet clusters — mini Arkham for analysts.",
  githubRepo: "https://github.com/osobennyj/warehouse-of-sites/tree/master/projects/wallet-cluster-investigator",
  explorerBase: {
    ethereum: "https://eth.blockscout.com/address/",
    base: "https://base.blockscout.com/address/",
    arbitrum: "https://arbitrum.blockscout.com/address/",
    optimism: "https://optimism.blockscout.com/address/",
  } as Record<string, string>,
};

export function explorerAddressUrl(chain: string, address: string): string {
  const base = siteConfig.explorerBase[chain] ?? siteConfig.explorerBase.ethereum;
  return `${base}${address}`;
}