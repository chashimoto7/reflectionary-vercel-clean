// src/contexts/EncryptionContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import encryptionService from "../services/encryptionService";

const EncryptionContext = createContext({});

export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryption must be used within an EncryptionProvider");
  }
  return context;
};

export const EncryptionProvider = ({ children }) => {
  const { user, session, userPassword } = useAuth();
  const [masterKey, setMasterKey] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);

  // Check if encryption is supported
  useEffect(() => {
    if (!encryptionService.isSupported()) {
      console.error("Web Crypto API not supported in this browser");
      return;
    }
    setEncryptionReady(true);
  }, []);

  // Auto-unlock encryption when user signs in with password
  useEffect(() => {
    const autoUnlock = async () => {
      if (user && userPassword && encryptionReady && !isUnlocked) {
        try {
          console.log("Auto-unlocking encryption...");
          await unlockEncryption(userPassword);
        } catch (error) {
          console.error("Auto-unlock failed:", error);
          // Don't show error - user can manually unlock
        }
      }
    };

    autoUnlock();
  }, [user, userPassword, encryptionReady]);

  // Clear encryption keys when user signs out
  useEffect(() => {
    if (!user) {
      setMasterKey(null);
      setIsUnlocked(false);
      sessionStorage.removeItem("encryption_unlocked");
    }
  }, [user]);

  // Unlock encryption with user's password
  const unlockEncryption = async (password) => {
    if (!user || !encryptionReady) {
      throw new Error("User not authenticated or encryption not ready");
    }

    try {
      console.log("Unlocking encryption for user:", user.email);
      const key = await encryptionService.generateMasterKey(
        user.email,
        password
      );
      setMasterKey(key);
      setIsUnlocked(true);

      // Store unlock status (but not the key) in sessionStorage
      sessionStorage.setItem("encryption_unlocked", "true");

      console.log("Encryption unlocked successfully");
      return true;
    } catch (error) {
      console.error("Failed to unlock encryption:", error);
      throw new Error("Failed to unlock encryption");
    }
  };

  // Lock encryption
  const lockEncryption = () => {
    setMasterKey(null);
    setIsUnlocked(false);
    sessionStorage.removeItem("encryption_unlocked");
  };

  // Encrypt journal content
  const encryptJournalEntry = async (content, htmlContent, prompt) => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    // Generate a unique data encryption key for this entry
    const dataKey = await encryptionService.generateDataKey();

    // Encrypt the content with the data key
    const [encryptedContent, encryptedHtml, encryptedPrompt, encryptedDataKey] =
      await Promise.all([
        encryptionService.encryptText(content, dataKey),
        htmlContent
          ? encryptionService.encryptText(htmlContent, dataKey)
          : { encryptedData: "", iv: "" },
        prompt
          ? encryptionService.encryptText(prompt, dataKey)
          : { encryptedData: "", iv: "" },
        encryptionService.encryptKey(dataKey, masterKey),
      ]);

    return {
      encrypted_content: encryptedContent.encryptedData,
      content_iv: encryptedContent.iv,
      encrypted_html_content: encryptedHtml.encryptedData,
      html_content_iv: encryptedHtml.iv,
      encrypted_prompt: encryptedPrompt.encryptedData,
      prompt_iv: encryptedPrompt.iv,
      encrypted_data_key: encryptedDataKey.encryptedData,
      data_key_iv: encryptedDataKey.iv,
      // Store word count unencrypted for analytics (doesn't reveal content)
      word_count: content
        ? content.split(/\s+/).filter((word) => word.length > 0).length
        : 0,
    };
  };

  // Decrypt journal content
  const decryptJournalEntry = async (encryptedEntry) => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    try {
      // Decrypt the data key first
      const dataKey = await encryptionService.decryptKey(
        {
          encryptedData: encryptedEntry.encrypted_data_key,
          iv: encryptedEntry.data_key_iv,
        },
        masterKey
      );

      // Decrypt the content with the data key
      const [content, htmlContent, prompt] = await Promise.all([
        encryptionService.decryptText(
          encryptedEntry.encrypted_content,
          encryptedEntry.content_iv,
          dataKey
        ),
        encryptedEntry.encrypted_html_content
          ? encryptionService.decryptText(
              encryptedEntry.encrypted_html_content,
              encryptedEntry.html_content_iv,
              dataKey
            )
          : "",
        encryptedEntry.encrypted_prompt
          ? encryptionService.decryptText(
              encryptedEntry.encrypted_prompt,
              encryptedEntry.prompt_iv,
              dataKey
            )
          : "",
      ]);

      return {
        ...encryptedEntry,
        content,
        html_content: htmlContent,
        prompt,
      };
    } catch (error) {
      console.error("Failed to decrypt journal entry:", error);
      throw new Error("Failed to decrypt journal entry");
    }
  };

  // Encrypt goals
  const encryptGoal = async (goalText, description = "") => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    const dataKey = await encryptionService.generateDataKey();

    const [encryptedGoal, encryptedDescription, encryptedDataKey] =
      await Promise.all([
        encryptionService.encryptText(goalText, dataKey),
        description
          ? encryptionService.encryptText(description, dataKey)
          : { encryptedData: "", iv: "" },
        encryptionService.encryptKey(dataKey, masterKey),
      ]);

    return {
      encrypted_goal: encryptedGoal.encryptedData,
      goal_iv: encryptedGoal.iv,
      encrypted_description: encryptedDescription.encryptedData,
      description_iv: encryptedDescription.iv,
      encrypted_data_key: encryptedDataKey.encryptedData,
      data_key_iv: encryptedDataKey.iv,
    };
  };

  // Decrypt goals
  const decryptGoal = async (encryptedGoal) => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    try {
      const dataKey = await encryptionService.decryptKey(
        {
          encryptedData: encryptedGoal.encrypted_data_key,
          iv: encryptedGoal.data_key_iv,
        },
        masterKey
      );

      const [goal, description] = await Promise.all([
        encryptionService.decryptText(
          encryptedGoal.encrypted_goal,
          encryptedGoal.goal_iv,
          dataKey
        ),
        encryptedGoal.encrypted_description
          ? encryptionService.decryptText(
              encryptedGoal.encrypted_description,
              encryptedGoal.description_iv,
              dataKey
            )
          : "",
      ]);

      return {
        ...encryptedGoal,
        goal,
        description,
      };
    } catch (error) {
      console.error("Failed to decrypt goal:", error);
      throw new Error("Failed to decrypt goal");
    }
  };

  const value = {
    isUnlocked,
    encryptionReady,
    unlockEncryption,
    lockEncryption,
    encryptJournalEntry,
    decryptJournalEntry,
    encryptGoal,
    decryptGoal,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};
