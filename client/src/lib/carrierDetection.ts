export function detectCarrier(trackingNumber: string): string {
  const cleaned = trackingNumber.replace(/\s/g, '');

  if (/^1Z[0-9A-Z]{16}$/i.test(cleaned)) {
    return 'ups';
  }

  if (
    /^\d{12}$/.test(cleaned) ||
    /^\d{15}$/.test(cleaned) ||
    /^\d{20}$/.test(cleaned) ||
    /^\d{22}$/.test(cleaned)
  ) {
    return 'fedex';
  }

  if (
    /^94\d{20}$/.test(cleaned) ||
    /^92\d{20}$/.test(cleaned) ||
    /^93\d{20}$/.test(cleaned) ||
    /^(94|92|93|82)\d{20}$/.test(cleaned) ||
    /^[A-Z]{2}\d{9}US$/.test(cleaned)
  ) {
    return 'usps';
  }

  if (
    /^\d{10}$/.test(cleaned) ||
    /^\d{11}$/.test(cleaned) ||
    /^[A-Z]{3}\d{7}$/.test(cleaned)
  ) {
    return 'dhl';
  }

  if (/^C\d{14}$/.test(cleaned)) {
    return 'ontrac';
  }

  if (/^L[A-Z]\d{8}$/.test(cleaned)) {
    return 'lasership';
  }

  if (/^TBA\d{12}$/.test(cleaned)) {
    return 'amazon';
  }

  return 'unknown';
}

export function getCarrierDisplayName(carrier: string): string {
  const carriers: Record<string, string> = {
    ups: 'UPS',
    usps: 'USPS',
    fedex: 'FedEx',
    dhl: 'DHL',
    ontrac: 'OnTrac',
    lasership: 'LaserShip',
    amazon: 'Amazon Logistics',
    unknown: 'Unknown Carrier'
  };

  return carriers[carrier.toLowerCase()] || carrier.toUpperCase();
}

export function validateTrackingNumber(trackingNumber: string, selectedCarrier: string): { valid: boolean; message?: string } {
  if (selectedCarrier === 'auto') {
    const detected = detectCarrier(trackingNumber);
    if (detected === 'unknown') {
      return {
        valid: false,
        message: 'Unable to detect carrier from tracking number. Please select a carrier manually.'
      };
    }
    return { valid: true };
  }

  const detected = detectCarrier(trackingNumber);

  if (detected !== 'unknown' && detected !== selectedCarrier.toLowerCase()) {
    return {
      valid: false,
      message: `This appears to be a ${getCarrierDisplayName(detected)} tracking number, not ${getCarrierDisplayName(selectedCarrier)}. Please enter a proper tracking number for ${getCarrierDisplayName(selectedCarrier)} or use auto-detect.`
    };
  }

  return { valid: true };
}
