import { Buffer } from 'buffer';

/**
 * Checks if the hex string is valid without the 0x prefix.
 * @param hex
 * @returns if the hex string is valid.
 */
export function isValidHex(hex: string): boolean {
    return /^([0-9a-fA-F]{2})+$/.test(hex);
}

/**
 * Strips the 0x prefix from a hex string.
 * @param hex
 * @returns hex string without the 0x prefix.
 */
export function stripHexPrefix(hex: string): string {
    return hex.replace(/^0x/, '');
}

export const base64ToHex = (text: string) => {
    return Buffer.from(text, 'base64').toString('hex');
};

/** Converts hex to buffer */
export const hexToBuffer = (hex: string): Buffer => {
    return Buffer.from(stripHexPrefix(hex), 'hex');
};

export const hextoBase64 = (hex: string) => {
    return hexToBuffer(hex).toString('base64');
};

export const base64ToBase64Url = (text: string) => {
    return text.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

/**
 * Converts DER signature to R and S
 * R and S are hex strings
 */
export const derToRs = (derSignature: string): { r: string; s: string } => {
    /*
      DER signature format:
      0x30 <length total> 0x02 <length r> <r> 0x02 <length s> <s>
    */
    const derBuffer = hexToBuffer(derSignature);

    const rLen = derBuffer[3]!;
    const rOffset = 4;
    const rBuffer = derBuffer.slice(rOffset, rOffset + rLen);
    const sLen = derBuffer[5 + rLen]!;
    const sOffset = 6 + rLen;
    const sBuffer = derBuffer.slice(sOffset, sOffset + sLen);

    const r = rBuffer.toString('hex').replace(/^0+/, '');
    const s = sBuffer.toString('hex').replace(/^0+/, '');

    return { r, s };
};
