/**
 * Calculates the price for gutter clearing based on bedrooms.
 * Starts at £80 for 2-3 bed and goes up from there.
 * @param bedrooms - The number of bedrooms (e.g., '1-2 Bed', '2-3 Bed', '4 Bed', '5 Bed').
 * @returns The calculated price for gutter clearing.
 */
export const calculateGutterClearingPrice = (bedrooms: string): number => {
    switch (bedrooms) {
        case '1-2 Bed':
            return 70;
        case '2-3 Bed':
            return 80;
        case '4 Bed':
            return 100;
        case '5 Bed':
            return 120;
        case '6+ Bed':
            return 150;
        default:
            return 80; // Default for unknown property sizes
    }
};

/**
 * Pricing configuration for standard residential window cleaning services
 * New pricing: £20 (1-2 bed), £25 (3 bed), £30 (4 bed), +£5 for detached
 */
export const PRICING_CONFIG = {
    residential: {
        'Semi-Detached House': {
            '1-2 Bed': { base: 20, frequency: { '4-weekly': 20, '8-weekly': 23, '12-weekly': 25, 'adhoc': 25 } },
            '2-3 Bed': { base: 25, frequency: { '4-weekly': 25, '8-weekly': 28, '12-weekly': 30, 'adhoc': 30 } },
            '4 Bed': { base: 30, frequency: { '4-weekly': 30, '8-weekly': 33, '12-weekly': 35, 'adhoc': 35 } },
            '5 Bed': { base: 35, frequency: { '4-weekly': 35, '8-weekly': 38, '12-weekly': 40, 'adhoc': 40 } }
        },
        'Detached House': {
            '1-2 Bed': { base: 25, frequency: { '4-weekly': 25, '8-weekly': 28, '12-weekly': 30, 'adhoc': 30 } },
            '2-3 Bed': { base: 30, frequency: { '4-weekly': 30, '8-weekly': 33, '12-weekly': 35, 'adhoc': 35 } },
            '4 Bed': { base: 35, frequency: { '4-weekly': 35, '8-weekly': 38, '12-weekly': 40, 'adhoc': 40 } },
            '5 Bed': { base: 40, frequency: { '4-weekly': 40, '8-weekly': 43, '12-weekly': 45, 'adhoc': 45 } }
        },
        'Other': {
            '1-2 Bed': { base: 20, frequency: { '4-weekly': 20, '8-weekly': 23, '12-weekly': 25, 'adhoc': 25 } },
            '2-3 Bed': { base: 25, frequency: { '4-weekly': 25, '8-weekly': 28, '12-weekly': 30, 'adhoc': 30 } },
            '4 Bed': { base: 30, frequency: { '4-weekly': 30, '8-weekly': 33, '12-weekly': 35, 'adhoc': 35 } }
        }
    }
};

/**
 * Calculate window cleaning price based on property type, bedrooms, and frequency
 */
export const calculateWindowCleaningPrice = (
    propertyType: string,
    bedrooms: string,
    frequency: string
): number => {
    const config = PRICING_CONFIG.residential[propertyType as keyof typeof PRICING_CONFIG.residential];
    if (!config) return 0;

    const bedroomConfig = config[bedrooms as keyof typeof config];
    if (!bedroomConfig) return 0;

    const frequencyPricing = bedroomConfig.frequency;
    return frequencyPricing[frequency as keyof typeof frequencyPricing] || bedroomConfig.base;
};

/**
 * Calculate addon service prices
 */
export const calculateAddonPrice = (addonId: string, propertyType: string, bedrooms: string): number => {
    switch (addonId) {
        case 'gutterClearing':
            return calculateGutterClearingPrice(bedrooms);
        case 'fasciaSoffitGutter':
            // Fascia pricing is £20 more than gutter clearing prices
            const gutterPrice = calculateGutterClearingPrice(bedrooms);
            return gutterPrice + 20;
        case 'conservatoryRoof':
            // This is typically a quote request, return 0 for calculation
            return 0;
        default:
            return 0;
    }
};

/**
 * Form data structure types
 */
export interface WindowCleaningData {
    propertyType: string;
    bedrooms: string;
    frequency: string;
    serviceId: string;
    price: number;
}

export interface AddonService {
    id: string;
    selected: boolean;
    price: number;
}

export interface PropertyDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postcode: string;
    accessInfo: string;
    additionalInfo: string;
}

export interface BookingFormData {
    windowCleaning: WindowCleaningData;
    addons: Record<string, AddonService>;
    quoteRequests: string[];
    generalEnquiry: {
        services: string[];
        frequency: string;
        additionalInfo: string;
    };
    customResidential: {
        propertyStyle: string;
        services: string[];
        frequency: string;
        additionalInfo: string;
    };
    commercial: {
        propertyType: string;
        size: string;
        services: string[];
        frequency: string;
        additionalInfo: string;
    };
    propertyDetails: PropertyDetails;
    totalPrice: number;
    isCommercialEnquiry: boolean;
    isGeneralEnquiry: boolean;
    isCustomResidential: boolean;
}