export const affiliateLinks = {
  yendo: "https://clc.li/YendoCard",
  credit: "https://clc.li/YendoCard",
  sweepstakes: "https://clc.li/PojZL",
  offer: "https://clc.li/PojZL",
};

export const getAffiliateUrl = (type: keyof typeof affiliateLinks): string => {
  return affiliateLinks[type];
};

export const trackClick = async (linkType: string) => {
  try {
    console.log('Affiliate click tracked:', linkType);
  } catch (error) {
    console.error('Failed to track click:', error);
  }
};
