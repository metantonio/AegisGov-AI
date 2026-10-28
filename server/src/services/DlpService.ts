export interface DlpScanResult {
  hasSensitiveData: boolean;
  detectedEntities: string[];
  sanitizedText: string;
  redactedCount: number;
}

export class DlpService {
  private patterns: Array<{ name: string; regex: RegExp; replacement: string }> = [
    {
      name: 'Credit Card / PAN',
      regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
      replacement: '[REDACTED_CREDIT_CARD]'
    },
    {
      name: 'Email Address',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
      replacement: '[REDACTED_EMAIL]'
    },
    {
      name: 'API Key / Secret Token',
      regex: /(?:sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|Bearer\s+[a-zA-Z0-9._-]{20,}|aegis_[a-z0-9_]{16,})/gi,
      replacement: '[REDACTED_SECRET_KEY]'
    },
    {
      name: 'IBAN / Bank Account',
      regex: /\b[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4,7}\b/g,
      replacement: '[REDACTED_IBAN]'
    },
    {
      name: 'Proprietary Source Code / Hardware Schema',
      regex: /(?:class\s+[A-Za-z0-9_]+Architecture|func\s+semiconductor_yield|patent_pending_logic|PROPRIETARY_ALGO_SOURCE)/gi,
      replacement: '[RESTRICTED_SOURCE_CODE_BLOCKED]'
    }
  ];

  scanAndSanitize(input: string): DlpScanResult {
    let sanitized = input;
    const detected: string[] = [];
    let count = 0;

    for (const pattern of this.patterns) {
      const matches = input.match(pattern.regex);
      if (matches && matches.length > 0) {
        detected.push(pattern.name);
        count += matches.length;
        sanitized = sanitized.replace(pattern.regex, pattern.replacement);
      }
    }

    return {
      hasSensitiveData: detected.length > 0,
      detectedEntities: detected,
      sanitizedText: sanitized,
      redactedCount: count
    };
  }

  scanObjectAndSanitize(obj: Record<string, any>): { sanitizedObj: Record<string, any>; detectedEntities: string[] } {
    const jsonStr = JSON.stringify(obj);
    const result = this.scanAndSanitize(jsonStr);
    try {
      return {
        sanitizedObj: JSON.parse(result.sanitizedText),
        detectedEntities: result.detectedEntities
      };
    } catch {
      return {
        sanitizedObj: obj,
        detectedEntities: result.detectedEntities
      };
    }
  }
}

export const dlpService = new DlpService();
