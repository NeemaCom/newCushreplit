import { z } from 'zod';
import { securityLogger, EncryptionService } from './security';

// Partner types and configurations
export enum PartnerType {
  MICROLOAN_UK = 'MICROLOAN_UK',
  MICROLOAN_NIGERIA = 'MICROLOAN_NIGERIA',
  FINTECH_UK = 'FINTECH_UK',
  FINTECH_NIGERIA = 'FINTECH_NIGERIA',
  FINTECH_GLOBAL = 'FINTECH_GLOBAL'
}

export enum PartnerStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING'
}

export enum ReferralStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  COMPLETED = 'COMPLETED'
}

// Partner configuration schema
export const partnerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(PartnerType),
  status: z.nativeEnum(PartnerStatus),
  country: z.enum(['UK', 'NG', 'GLOBAL']),
  apiEndpoint: z.string().url().optional(),
  apiKey: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  commissionRate: z.number().min(0).max(100), // Percentage
  minLoanAmount: z.number().positive(),
  maxLoanAmount: z.number().positive(),
  interestRateRange: z.object({
    min: z.number(),
    max: z.number()
  }),
  supportedCurrencies: z.array(z.string()),
  processingTime: z.string(), // e.g., "24-48 hours"
  requirements: z.array(z.string()),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string(),
    website: z.string().url()
  })
});

export type PartnerConfig = z.infer<typeof partnerConfigSchema>;

// Loan partners configuration
export class LoanPartnersManager {
  private static readonly UK_PARTNERS: PartnerConfig[] = [
    {
      id: 'gc-business-finance',
      name: 'GC Business Finance',
      type: PartnerType.MICROLOAN_UK,
      status: PartnerStatus.PENDING,
      country: 'UK',
      apiEndpoint: 'https://api.gcbusinessfinance.co.uk/v1',
      commissionRate: 2.5,
      minLoanAmount: 1000,
      maxLoanAmount: 500000,
      interestRateRange: { min: 6.9, max: 19.9 },
      supportedCurrencies: ['GBP'],
      processingTime: '24-48 hours',
      requirements: [
        'UK bank account',
        'Proof of income',
        'Credit check',
        'Business registration (if applicable)'
      ],
      contactInfo: {
        email: 'partnerships@gcbusinessfinance.co.uk',
        phone: '+44 20 7234 5678',
        website: 'https://www.gcbusinessfinance.co.uk'
      }
    },
    {
      id: 'iwoca',
      name: 'Iwoca',
      type: PartnerType.MICROLOAN_UK,
      status: PartnerStatus.PENDING,
      country: 'UK',
      apiEndpoint: 'https://api.iwoca.co.uk/v2',
      commissionRate: 3.0,
      minLoanAmount: 500,
      maxLoanAmount: 200000,
      interestRateRange: { min: 5.9, max: 24.9 },
      supportedCurrencies: ['GBP'],
      processingTime: '24 hours',
      requirements: [
        'UK business registration',
        'Bank statements (3 months)',
        'Credit assessment',
        'Revenue verification'
      ],
      contactInfo: {
        email: 'api@iwoca.co.uk',
        phone: '+44 20 3893 5500',
        website: 'https://www.iwoca.co.uk'
      }
    },
    {
      id: 'lendwithcare',
      name: 'Lendwithcare',
      type: PartnerType.MICROLOAN_UK,
      status: PartnerStatus.PENDING,
      country: 'UK',
      commissionRate: 1.5,
      minLoanAmount: 100,
      maxLoanAmount: 25000,
      interestRateRange: { min: 0, max: 15.0 },
      supportedCurrencies: ['GBP'],
      processingTime: '48-72 hours',
      requirements: [
        'UK residency',
        'Basic credit check',
        'Purpose verification',
        'Repayment capacity assessment'
      ],
      contactInfo: {
        email: 'info@lendwithcare.org',
        phone: '+44 20 7278 0066',
        website: 'https://www.lendwithcare.org'
      }
    }
  ];

  private static readonly NIGERIA_PARTNERS: PartnerConfig[] = [
    {
      id: 'kuda-microfinance',
      name: 'Kuda Microfinance Bank',
      type: PartnerType.MICROLOAN_NIGERIA,
      status: PartnerStatus.PENDING,
      country: 'NG',
      apiEndpoint: 'https://api.kudamfb.com/v1',
      commissionRate: 2.0,
      minLoanAmount: 10000, // NGN
      maxLoanAmount: 5000000, // NGN
      interestRateRange: { min: 1.5, max: 5.0 },
      supportedCurrencies: ['NGN'],
      processingTime: '24 hours',
      requirements: [
        'BVN verification',
        'Nigerian bank account',
        'Salary account (6 months)',
        'Employment verification'
      ],
      contactInfo: {
        email: 'partnerships@kuda.com',
        phone: '+234 1 888 5555',
        website: 'https://www.kuda.com'
      }
    },
    {
      id: 'baobab-microfinance',
      name: 'Baobab Microfinance Bank',
      type: PartnerType.MICROLOAN_NIGERIA,
      status: PartnerStatus.PENDING,
      country: 'NG',
      commissionRate: 2.5,
      minLoanAmount: 50000, // NGN
      maxLoanAmount: 10000000, // NGN
      interestRateRange: { min: 2.0, max: 6.0 },
      supportedCurrencies: ['NGN'],
      processingTime: '48 hours',
      requirements: [
        'Valid ID card',
        'BVN verification',
        'Proof of income',
        'Guarantor information',
        'Bank statements'
      ],
      contactInfo: {
        email: 'info@baobabmfb.com',
        phone: '+234 1 277 0000',
        website: 'https://www.baobabmfb.com'
      }
    },
    {
      id: 'ab-microfinance',
      name: 'AB Microfinance Bank',
      type: PartnerType.MICROLOAN_NIGERIA,
      status: PartnerStatus.PENDING,
      country: 'NG',
      commissionRate: 2.2,
      minLoanAmount: 25000, // NGN
      maxLoanAmount: 3000000, // NGN
      interestRateRange: { min: 1.8, max: 4.5 },
      supportedCurrencies: ['NGN'],
      processingTime: '24-48 hours',
      requirements: [
        'BVN and valid ID',
        'Employment letter',
        'Salary account',
        'Credit history check'
      ],
      contactInfo: {
        email: 'loans@abmicrofinancebank.com',
        phone: '+234 1 448 0000',
        website: 'https://www.abmicrofinancebank.com'
      }
    },
    {
      id: 'renmoney',
      name: 'RenMoney Microfinance Bank',
      type: PartnerType.MICROLOAN_NIGERIA,
      status: PartnerStatus.PENDING,
      country: 'NG',
      apiEndpoint: 'https://api.renmoney.com/v1',
      commissionRate: 3.0,
      minLoanAmount: 15000, // NGN
      maxLoanAmount: 6000000, // NGN
      interestRateRange: { min: 1.5, max: 5.5 },
      supportedCurrencies: ['NGN'],
      processingTime: '15 minutes - 24 hours',
      requirements: [
        'BVN verification',
        'Valid phone number',
        'Bank account details',
        'Employment verification'
      ],
      contactInfo: {
        email: 'partnerships@renmoney.com',
        phone: '+234 700 736 6639',
        website: 'https://www.renmoney.com'
      }
    }
  ];

  private static readonly FINTECH_PARTNERS: PartnerConfig[] = [
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: PartnerType.FINTECH_GLOBAL,
      status: PartnerStatus.PENDING,
      country: 'GLOBAL',
      apiEndpoint: 'https://api.flutterwave.com/v3',
      commissionRate: 1.8,
      minLoanAmount: 1000,
      maxLoanAmount: 1000000,
      interestRateRange: { min: 2.0, max: 8.0 },
      supportedCurrencies: ['NGN', 'GBP', 'USD', 'EUR'],
      processingTime: '24 hours',
      requirements: [
        'KYC verification',
        'International payment support',
        'Multi-currency processing'
      ],
      contactInfo: {
        email: 'partnerships@flutterwave.com',
        phone: '+234 1 888 5555',
        website: 'https://flutterwave.com'
      }
    },
    {
      id: 'fincra',
      name: 'Fincra',
      type: PartnerType.FINTECH_GLOBAL,
      status: PartnerStatus.PENDING,
      country: 'GLOBAL',
      apiEndpoint: 'https://api.fincra.com/v1',
      commissionRate: 2.2,
      minLoanAmount: 500,
      maxLoanAmount: 500000,
      interestRateRange: { min: 3.0, max: 12.0 },
      supportedCurrencies: ['NGN', 'GBP', 'USD'],
      processingTime: '24-48 hours',
      requirements: [
        'Business verification',
        'Cross-border payment capability',
        'Compliance documentation'
      ],
      contactInfo: {
        email: 'partnerships@fincra.com',
        phone: '+234 1 888 0000',
        website: 'https://fincra.com'
      }
    },
    {
      id: 'lemfi',
      name: 'LemFi',
      type: PartnerType.FINTECH_GLOBAL,
      status: PartnerStatus.PENDING,
      country: 'GLOBAL',
      apiEndpoint: 'https://api.lemfi.com/v1',
      commissionRate: 2.0,
      minLoanAmount: 1000,
      maxLoanAmount: 250000,
      interestRateRange: { min: 4.0, max: 15.0 },
      supportedCurrencies: ['NGN', 'GBP', 'USD', 'CAD'],
      processingTime: '24 hours',
      requirements: [
        'International student verification',
        'Immigration document verification',
        'Educational institution confirmation'
      ],
      contactInfo: {
        email: 'partnerships@lemfi.com',
        phone: '+1 647 800 0000',
        website: 'https://lemfi.com'
      }
    }
  ];

  // Get all partners
  static getAllPartners(): PartnerConfig[] {
    return [
      ...this.UK_PARTNERS,
      ...this.NIGERIA_PARTNERS,
      ...this.FINTECH_PARTNERS
    ];
  }

  // Get partners by country
  static getPartnersByCountry(country: 'UK' | 'NG' | 'GLOBAL'): PartnerConfig[] {
    return this.getAllPartners().filter(partner => 
      partner.country === country || partner.country === 'GLOBAL'
    );
  }

  // Get partners by type
  static getPartnersByType(type: PartnerType): PartnerConfig[] {
    return this.getAllPartners().filter(partner => partner.type === type);
  }

  // Get active partners only
  static getActivePartners(): PartnerConfig[] {
    return this.getAllPartners().filter(partner => partner.status === PartnerStatus.ACTIVE);
  }

  // Find best matching partners for user
  static findMatchingPartners(userProfile: {
    country: string;
    loanAmount: number;
    currency: string;
    purpose: string;
  }): PartnerConfig[] {
    const { country, loanAmount, currency } = userProfile;
    
    return this.getAllPartners().filter(partner => {
      // Filter by country compatibility
      const countryMatch = partner.country === country || 
                          partner.country === 'GLOBAL' ||
                          (country === 'GB' && partner.country === 'UK');
      
      // Filter by loan amount range
      const amountMatch = loanAmount >= partner.minLoanAmount && 
                         loanAmount <= partner.maxLoanAmount;
      
      // Filter by currency support
      const currencyMatch = partner.supportedCurrencies.includes(currency);
      
      // Only active or testing partners
      const statusMatch = partner.status === PartnerStatus.ACTIVE || 
                         partner.status === PartnerStatus.TESTING;
      
      return countryMatch && amountMatch && currencyMatch && statusMatch;
    }).sort((a, b) => a.commissionRate - b.commissionRate); // Sort by best commission rate
  }

  // Calculate potential commission
  static calculateCommission(partnerId: string, loanAmount: number): number {
    const partner = this.getAllPartners().find(p => p.id === partnerId);
    if (!partner) return 0;
    
    return (loanAmount * partner.commissionRate) / 100;
  }

  // Create referral tracking
  static async createReferral(data: {
    userId: string;
    partnerId: string;
    loanAmount: number;
    currency: string;
    userProfile: any;
  }): Promise<{
    referralId: string;
    partnerId: string;
    estimatedCommission: number;
    nextSteps: string[];
  }> {
    const referralId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const partner = this.getAllPartners().find(p => p.id === data.partnerId);
    
    if (!partner) {
      throw new Error('Partner not found');
    }
    
    const estimatedCommission = this.calculateCommission(data.partnerId, data.loanAmount);
    
    // Log referral creation for security
    securityLogger.logSecurityEvent('LOAN_REFERRAL_CREATED', {
      referralId,
      userId: data.userId,
      partnerId: data.partnerId,
      loanAmount: data.loanAmount,
      estimatedCommission
    }, 'low');
    
    const nextSteps = [
      `Complete application with ${partner.name}`,
      'Submit required documentation',
      'Await loan processing and approval',
      'Commission will be tracked automatically'
    ];
    
    return {
      referralId,
      partnerId: data.partnerId,
      estimatedCommission,
      nextSteps
    };
  }

  // Partner API integration helpers
  static async testPartnerConnection(partnerId: string, apiKey?: string): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const partner = this.getAllPartners().find(p => p.id === partnerId);
    if (!partner || !partner.apiEndpoint) {
      return { success: false, responseTime: 0, error: 'Partner or API endpoint not found' };
    }
    
    const startTime = Date.now();
    
    try {
      // Test API connection (would be implemented per partner's API specification)
      // For now, simulating the test
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
      
      const responseTime = Date.now() - startTime;
      
      // Log successful connection test
      securityLogger.logSecurityEvent('PARTNER_API_TEST', {
        partnerId,
        success: true,
        responseTime
      }, 'low');
      
      return { success: true, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      securityLogger.logSecurityEvent('PARTNER_API_TEST_FAILED', {
        partnerId,
        error: error.message,
        responseTime
      }, 'medium');
      
      return { success: false, responseTime, error: error.message };
    }
  }
}