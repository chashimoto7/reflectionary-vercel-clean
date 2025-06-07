// src/services/encryptionService.js

class EncryptionService {
  constructor() {
    this.algorithm = "AES-CBC";
    this.keyLength = 256;
    this.ivLength = 16; // 16 bytes for AES-CBC
  }

  // --- NEW: Use static master key for everything! ---
  async getStaticMasterKey() {
    const hex = STATIC_MASTER_KEY_HEX;
    if (!hex || hex.length !== 64)
      throw new Error("Static master key is missing or invalid length");
    const keyBuffer = new Uint8Array(
      hex.match(/.{1,2}/g).map((b) => parseInt(b, 16))
    );
    return await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: this.algorithm },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // Generate a random data encryption key
  async generateDataKey() {
    const dataKey = await window.crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
    return dataKey;
  }

  // Encrypt text data
  async encryptText(text, key) {
    if (!text || text.trim() === "") {
      return { encryptedData: "", iv: "", tag: "" };
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: this.algorithm, iv: iv },
      key,
      data
    );
    const encryptedArray = new Uint8Array(encryptedBuffer);
    return {
      encryptedData: this.arrayBufferToBase64(encryptedArray),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  // Decrypt text data
  async decryptText(encryptedData, iv, key) {
    if (!encryptedData || encryptedData === "") {
      return "";
    }
    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: this.algorithm, iv: ivBuffer },
        key,
        encryptedBuffer
      );
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      throw new Error(
        "Failed to decrypt data. This could indicate corrupted data or wrong key."
      );
    }
  }

  // Encrypt a data encryption key with master key
  async encryptKey(dataKey, masterKey) {
    const exportedKey = await window.crypto.subtle.exportKey("raw", dataKey);
    return await this.encryptText(
      this.arrayBufferToBase64(exportedKey),
      masterKey
    );
  }

  // Decrypt and import a data encryption key
  async decryptKey(encryptedKeyData, masterKey) {
    // AES-CBC only for static-key mode
    const keyB64 = await this.decryptText(
      encryptedKeyData.encryptedData,
      encryptedKeyData.iv,
      masterKey
    );
    const keyBuffer = this.base64ToArrayBuffer(keyB64);
    return await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: this.algorithm },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // Utility functions
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Test if Web Crypto API is available
  isSupported() {
    return !!(window.crypto && window.crypto.subtle);
  }
}

export default new EncryptionService();
