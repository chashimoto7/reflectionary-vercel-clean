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
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    if (!encryptionService.isSupported()) {
      console.error("Web Crypto API not supported in this browser");
      return;
    }
    setEncryptionReady(true);
  }, []);

  useEffect(() => {
    const autoUnlock = async () => {
      if (user && userPassword && encryptionReady && !isUnlocked) {
        try {
          console.log("Auto-unlocking encryption...");
          await unlockEncryption(userPassword);
        } catch (error) {
          console.error("Auto-unlock failed:", error);
        }
      }
    };

    autoUnlock();
  }, [user, userPassword, encryptionReady]);

  useEffect(() => {
    if (!user) {
      setMasterKey(null);
      setIsUnlocked(false);
      sessionStorage.removeItem("encryption_unlocked");
    }
  }, [user]);

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
      sessionStorage.setItem("encryption_unlocked", "true");
      console.log("Encryption unlocked successfully");
      return true;
    } catch (error) {
      console.error("Failed to unlock encryption:", error);
      throw new Error("Failed to unlock encryption");
    }
  };

  const lockEncryption = () => {
    setMasterKey(null);
    setIsUnlocked(false);
    sessionStorage.removeItem("encryption_unlocked");
  };

  const encryptJournalEntry = async (content, htmlContent, prompt) => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    const dataKey = await encryptionService.generateDataKey();

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
      word_count: content
        ? content.split(/\s+/).filter((word) => word.length > 0).length
        : 0,
    };
  };

  // In your EncryptionContext.jsx, replace the decryptJournalEntry function with:

  const decryptJournalEntry = async (encryptedEntry) => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    try {
      console.log("🔓 Starting decryption for entry:", encryptedEntry.id);
      console.log("🔍 Entry data check:", {
        hasEncryptedContent: !!encryptedEntry.encrypted_content,
        hasContentIv: !!encryptedEntry.content_iv,
        hasEncryptedDataKey: !!encryptedEntry.encrypted_data_key,
        hasDataKeyIv: !!encryptedEntry.data_key_iv,
        encryptedContentLength: encryptedEntry.encrypted_content?.length,
        contentIvLength: encryptedEntry.content_iv?.length,
        encryptedDataKeyLength: encryptedEntry.encrypted_data_key?.length,
        dataKeyIvLength: encryptedEntry.data_key_iv?.length,
      });

      console.log("🔑 Decrypting data key...");
      const dataKey = await encryptionService.decryptKey(
        {
          encryptedData: encryptedEntry.encrypted_data_key,
          iv: encryptedEntry.data_key_iv,
        },
        masterKey
      );
      console.log("✅ Data key decrypted successfully");

      console.log("📝 Decrypting content...");
      const content = await encryptionService.decryptText(
        encryptedEntry.encrypted_content,
        encryptedEntry.content_iv,
        dataKey
      );
      console.log("✅ Content decrypted successfully, length:", content.length);

      let htmlContent = "";
      if (
        encryptedEntry.encrypted_html_content &&
        encryptedEntry.html_content_iv
      ) {
        console.log("🌐 Decrypting HTML content...");
        htmlContent = await encryptionService.decryptText(
          encryptedEntry.encrypted_html_content,
          encryptedEntry.html_content_iv,
          dataKey
        );
        console.log("✅ HTML content decrypted successfully");
      } else {
        console.log("⏭️ Skipping HTML content (null values)");
      }

      let prompt = "";
      if (encryptedEntry.encrypted_prompt && encryptedEntry.prompt_iv) {
        console.log("💭 Decrypting prompt...");
        prompt = await encryptionService.decryptText(
          encryptedEntry.encrypted_prompt,
          encryptedEntry.prompt_iv,
          dataKey
        );
        console.log("✅ Prompt decrypted successfully");
      } else {
        console.log("⏭️ Skipping prompt (null values)");
      }

      console.log(
        "🎉 All decryption completed successfully for entry:",
        encryptedEntry.id
      );

      return {
        ...encryptedEntry,
        content,
        html_content: htmlContent,
        prompt,
      };
    } catch (error) {
      console.error(
        "❌ Decryption failed for entry:",
        encryptedEntry.id,
        error
      );
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to decrypt journal entry: ${error.message}`);
    }
  };

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
    showUnlockModal,
    setShowUnlockModal,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};
