import crypto from 'node:crypto';

// Master key derived from environment or secure local fallback seed
const MASTER_SECRET = process.env.AEGIS_MASTER_KEY || 'aegis-enterprise-iso42001-master-salt-2026';
// Derive a 32-byte (256-bit) key using PBKDF2
const ENCRYPTION_KEY = crypto.scryptSync(MASTER_SECRET, 'aegis-salt-vault', 32);

export class CryptoService {
  /**
   * Cryptographically hashes an API Key using SHA-256 with salt.
   * Irreversible one-way hash.
   */
  hashApiKey(apiKey: string): string {
    const salted = `aegis_salt_${apiKey}_${MASTER_SECRET.substring(0, 16)}`;
    return `sha256-${crypto.createHash('sha256').update(salted).digest('hex')}`;
  }

  /**
   * Verifies a provided API key against a stored hash using constant-time comparison.
   * Prevents side-channel timing attacks.
   */
  verifyApiKey(providedApiKey: string, storedHash: string): boolean {
    if (!providedApiKey || !storedHash) return false;
    const computedHash = this.hashApiKey(providedApiKey);
    
    // Constant-time buffer comparison
    const bufA = Buffer.from(computedHash, 'utf-8');
    const bufB = Buffer.from(storedHash, 'utf-8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Extracts a safe non-sensitive prefix for UI display (e.g., 'aegis_live_9941...')
   */
  getApiKeyPrefix(apiKey: string): string {
    if (!apiKey) return '';
    if (apiKey.length <= 14) return `${apiKey.substring(0, 8)}...`;
    return `${apiKey.substring(0, 14)}...`;
  }

  /**
   * Encrypts sensitive credentials or database passwords using AES-256-GCM.
   * Returns formatted string: aes-256-gcm:<iv_hex>:<tag_hex>:<ciphertext_hex>
   */
  encryptSecret(plaintext: string): string {
    if (!plaintext) return '';
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `aes-256-gcm:${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts an AES-256-GCM encrypted payload with authentication tag validation.
   */
  decryptSecret(encryptedPayload: string): string {
    if (!encryptedPayload || !encryptedPayload.startsWith('aes-256-gcm:')) {
      return encryptedPayload; // Not encrypted
    }

    const parts = encryptedPayload.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted payload format');
    }

    const [, ivHex, tagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  /**
   * Masks passwords inside database URIs or connection strings.
   * e.g. postgresql://user:my_secret_pass@db.corp:5432/db -> postgresql://user:***@db.corp:5432/db
   */
  maskConnectionString(uri: string): { maskedUri: string; extractedPassword?: string } {
    if (!uri) return { maskedUri: uri };

    // 1. Try standard URL parsing
    try {
      const parsed = new URL(uri);
      if (parsed.password) {
        const extractedPassword = parsed.password;
        parsed.password = '***';
        return {
          maskedUri: parsed.toString(),
          extractedPassword
        };
      }
    } catch {
      // Fallback for custom protocol strings (e.g. snowflake://, arn:aws:...)
    }

    // 2. Fallback regex matching protocol://user:pass@host (handles last '@' before host)
    const uriRegex = /^([a-zA-Z0-9+.-]+:\/\/[^:@]+):(.*)@([^/@]+(?:\/.*)?)$/;
    const match = uri.match(uriRegex);

    if (match) {
      const [, prefix, password, suffix] = match;
      return {
        maskedUri: `${prefix}:***@${suffix}`,
        extractedPassword: password
      };
    }

    // 3. Matches query parameters like ?password=secret or &password=secret
    const queryRegex = /([?&](?:password|pwd|secret|token)=)([^&]+)/gi;
    let extracted: string | undefined;
    const masked = uri.replace(queryRegex, (_full, prefix, pass) => {
      extracted = pass;
      return `${prefix}***`;
    });

    return {
      maskedUri: masked,
      extractedPassword: extracted
    };
  }

  /**
   * Computes an irreversible SHA-256 hash of a database password/secret for change detection.
   */
  hashSecret(secret: string): string {
    if (!secret) return '';
    return `sha256-${crypto.createHash('sha256').update(secret).digest('hex')}`;
  }
}

export const cryptoService = new CryptoService();
