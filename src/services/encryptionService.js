// src/services/encryptionService.js
class EncryptionService {
  constructor() {
    this.algorithm = "AES-CBC";
    this.keyLength = 256;
    this.ivLength = 16; // 16 bytes for AES-CBC
  }

  // Generate a master key from user password + email (deterministic)
  async generateMasterKey(email, password) {
    console.log("🔑 Generating master key with AES-CBC");
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Use email as salt to make key deterministic for same user
    const salt = await window.crypto.subtle.digest(
      "SHA-256",
      encoder.encode(email)
    );

    const masterKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ["encrypt", "decrypt"]
    );

    console.log("✅ Master key generated:", masterKey);
    return masterKey;
  }

  // Generate a random data encryption key
  async generateDataKey() {
    console.log("🗝️ Generating data key with AES-CBC");
    const dataKey = await window.crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
    console.log("✅ Data key generated:", dataKey);
    return dataKey;
  }

  // Encrypt text data
  async encryptText(text, key) {
    if (!text || text.trim() === "") {
      return { encryptedData: "", iv: "", tag: "" };
    }

    console.log("🔒 Encrypting text with AES-CBC, length:", text.length);
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      data
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const result = {
      encryptedData: this.arrayBufferToBase64(encryptedArray),
      iv: this.arrayBufferToBase64(iv),
    };

    console.log(
      "✅ Text encrypted, IV length:",
      result.iv.length,
      "Data length:",
      result.encryptedData.length
    );
    return result;
  }

  // Decrypt text data
  async decryptText(encryptedData, iv, key) {
    if (!encryptedData || encryptedData === "") {
      return "";
    }

    try {
      console.log("🔓 Decrypting text with AES-CBC");
      console.log(
        "📊 Input lengths - Data:",
        encryptedData.length,
        "IV:",
        iv.length
      );

      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      const ivBuffer = this.base64ToArrayBuffer(iv);

      console.log(
        "📊 Buffer lengths - Data:",
        encryptedBuffer.byteLength,
        "IV:",
        ivBuffer.byteLength
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: ivBuffer,
        },
        key,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const result = decoder.decode(decryptedBuffer);
      console.log("✅ Text decrypted successfully, length:", result.length);
      return result;
    } catch (error) {
      console.error("❌ Text decryption failed:", error);
      throw new Error(
        "Failed to decrypt data. This could indicate corrupted data or wrong key."
      );
    }
  }

  // Encrypt a data encryption key with master key
  async encryptKey(dataKey, masterKey) {
    console.log("🔒 Encrypting data key with master key");
    const exportedKey = await window.crypto.subtle.exportKey("raw", dataKey);
    const result = await this.encryptText(
      this.arrayBufferToBase64(exportedKey),
      masterKey
    );
    console.log("✅ Data key encrypted");
    return result;
  }

  // Decrypt and import a data encryption key
  async decryptKey(encryptedKeyData, masterKey) {
    console.log("🔓 Decrypting data key with master key");
    console.log("📊 Encrypted key data:", {
      encryptedData: encryptedKeyData.encryptedData.substring(0, 20) + "...",
      encryptedDataLength: encryptedKeyData.encryptedData.length,
      iv: encryptedKeyData.iv.substring(0, 20) + "...",
      ivLength: encryptedKeyData.iv.length,
      masterKeyType: typeof masterKey,
      masterKeyAlgorithm: masterKey?.algorithm?.name,
    });

    // Try AES-CBC first (current method)
    try {
      console.log("🔄 Attempting AES-CBC decryption...");
      const keyB64 = await this.decryptText(
        encryptedKeyData.encryptedData,
        encryptedKeyData.iv,
        masterKey
      );

      console.log(
        "✅ Data key decrypted as base64 with AES-CBC, length:",
        keyB64.length
      );
      const keyBuffer = this.base64ToArrayBuffer(keyB64);
      console.log("📊 Key buffer length:", keyBuffer.byteLength);

      const importedKey = await window.crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: this.algorithm },
        false,
        ["encrypt", "decrypt"]
      );

      console.log(
        "✅ Data key imported successfully with AES-CBC:",
        importedKey
      );
      return importedKey;
    } catch (cbcError) {
      console.warn(
        "⚠️ AES-CBC decryption failed, trying AES-GCM fallback...",
        cbcError.message
      );

      // Fallback to AES-GCM for backwards compatibility
      try {
        console.log("🔄 Attempting AES-GCM fallback decryption...");

        const encryptedBuffer = this.base64ToArrayBuffer(
          encryptedKeyData.encryptedData
        );
        const ivBuffer = this.base64ToArrayBuffer(encryptedKeyData.iv);

        // For AES-GCM, we need to create a master key with GCM algorithm
        const gcmMasterKey = await window.crypto.subtle.importKey(
          "raw",
          await window.crypto.subtle.exportKey("raw", masterKey),
          { name: "AES-GCM" },
          false,
          ["encrypt", "decrypt"]
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: ivBuffer,
          },
          gcmMasterKey,
          encryptedBuffer
        );

        const decoder = new TextDecoder();
        const keyB64 = decoder.decode(decryptedBuffer);
        console.log(
          "✅ Data key decrypted as base64 with AES-GCM, length:",
          keyB64.length
        );

        const keyBuffer = this.base64ToArrayBuffer(keyB64);
        console.log("📊 Key buffer length:", keyBuffer.byteLength);

        const importedKey = await window.crypto.subtle.importKey(
          "raw",
          keyBuffer,
          { name: this.algorithm }, // Import as AES-CBC for current use
          false,
          ["encrypt", "decrypt"]
        );

        console.log(
          "✅ Data key imported successfully with AES-GCM fallback:",
          importedKey
        );
        return importedKey;
      } catch (gcmError) {
        console.error("❌ Both AES-CBC and AES-GCM decryption failed:", {
          cbcError: cbcError.message,
          gcmError: gcmError.message,
        });
        throw new Error(
          `Failed to decrypt data key with both AES-CBC and AES-GCM: CBC(${cbcError.message}), GCM(${gcmError.message})`
        );
      }
    }
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
