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

/**
 * Converts a hex string to a base64url encoded string.
 * @param `hex` Hex string to convert.
 * @returns Base64url encoded string.
 */
export function hexToBase64Url(hex: string): string {
    hex = stripHexPrefix(hex);
    if (!isValidHex(hex)) {
        throw new Error('Invalid hex string');
    }
    return Buffer.from(hex, 'hex')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
