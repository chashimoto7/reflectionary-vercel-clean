// src/utils/exportUtils.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  pdf,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #8B5CF6",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  entry: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: "1px solid #E5E7EB",
  },
  entryHeader: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  prompt: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#6B7280",
    marginBottom: 8,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#333333",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#E0E7FF",
    color: "#4F46E5",
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  followUp: {
    backgroundColor: "#FEF3C7",
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
  },
  followUpText: {
    fontSize: 10,
    color: "#92400E",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#6B7280",
  },
});

// PDF Document Component
const ExportDocument = ({ entries, options }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Reflectionary Journal Export</Text>
        <Text style={styles.subtitle}>
          Export Date: {new Date().toLocaleDateString()} | Total Entries:{" "}
          {entries.length}
        </Text>
      </View>

      {entries.map((entry, index) => {
        const date = new Date(entry.created_at);

        return (
          <View key={entry.id || index} style={styles.entry} wrap={false}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>
                Entry {index + 1} - {date.toLocaleDateString()}{" "}
                {date.toLocaleTimeString()}
              </Text>
            </View>

            {options.includePrompts && entry.prompt_text && (
              <Text style={styles.prompt}>Prompt: {entry.prompt_text}</Text>
            )}

            <Text style={styles.content}>{entry.content}</Text>

            {entry.tags && entry.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {entry.tags.map((tag, tagIndex) => (
                  <Text key={tagIndex} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            )}

            {options.includeFollowUps && entry.metadata?.follow_up_prompt && (
              <View style={styles.followUp}>
                <Text style={styles.followUpText}>
                  Follow-up: {entry.metadata.follow_up_prompt}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

// Generate PDF function
export const generatePDF = async (exportData) => {
  try {
    const { entries, options } = exportData;

    // Create the PDF document
    const doc = <ExportDocument entries={entries} options={options} />;

    // Generate the PDF blob
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reflectionary-export-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Keep the Word export function
export const generateWord = async (exportData) => {
  try {
    const { entries, options } = exportData;

    // Create HTML content that Word can understand
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reflectionary Journal Export</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            h1 { color: #8B5CF6; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
            h2 { color: #6B7280; margin-top: 30px; }
            .entry { margin-bottom: 40px; page-break-inside: avoid; }
            .entry-header { background-color: #F3F4F6; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            .entry-date { font-weight: bold; color: #8B5CF6; }
            .prompt { font-style: italic; color: #6B7280; margin: 10px 0; }
            .content { margin: 15px 0; white-space: pre-wrap; }
            .tags { margin-top: 10px; }
            .tag { display: inline-block; background-color: #E0E7FF; color: #4F46E5; padding: 3px 8px; border-radius: 12px; margin-right: 5px; font-size: 0.875em; }
            .follow-up { background-color: #FEF3C7; padding: 10px; border-radius: 5px; margin-top: 10px; }
            .divider { border-bottom: 1px solid #E5E7EB; margin: 30px 0; }
          </style>
        </head>
        <body>
          <h1>Reflectionary Journal Export</h1>
          <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Entries:</strong> ${entries.length}</p>
          <hr>
    `;

    entries.forEach((entry, index) => {
      const date = new Date(entry.created_at);

      htmlContent += `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-date">Entry ${
              index + 1
            } - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
          </div>
      `;

      if (options.includePrompts && entry.prompt_text) {
        htmlContent += `<div class="prompt">Prompt: ${entry.prompt_text}</div>`;
      }

      // Escape HTML and preserve line breaks
      const escapedContent = entry.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>");

      htmlContent += `<div class="content">${escapedContent}</div>`;

      if (entry.tags && entry.tags.length > 0) {
        htmlContent += `<div class="tags">`;
        entry.tags.forEach((tag) => {
          htmlContent += `<span class="tag">${tag}</span>`;
        });
        htmlContent += `</div>`;
      }

      if (options.includeFollowUps && entry.metadata?.follow_up_prompt) {
        htmlContent += `<div class="follow-up"><strong>Follow-up:</strong> ${entry.metadata.follow_up_prompt}</div>`;
      }

      htmlContent += `</div>`;

      if (index < entries.length - 1) {
        htmlContent += `<div class="divider"></div>`;
      }
    });

    htmlContent += `
        </body>
      </html>
    `;

    // Create blob with Word-compatible MIME type
    const blob = new Blob([htmlContent], {
      type: "application/msword",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reflectionary-export-${
      new Date().toISOString().split("T")[0]
    }.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw error;
  }
};

// Additional export formats for future use
export const generateJSON = async (exportData) => {
  try {
    const { entries } = exportData;

    const jsonData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      totalEntries: entries.length,
      entries: entries.map((entry) => ({
        id: entry.id,
        date: entry.created_at,
        content: entry.content,
        prompt: entry.prompt_text || null,
        tags: entry.tags || [],
        metadata: entry.metadata || {},
      })),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reflectionary-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating JSON:", error);
    throw error;
  }
};

export const generateCSV = async (exportData) => {
  try {
    const { entries } = exportData;

    // Create CSV header
    let csvContent = "Date,Time,Prompt,Content,Tags,Word Count\n";

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const prompt = entry.prompt_text || "";
      const content = entry.content
        .replace(/,/g, ";")
        .replace(/\n/g, " ")
        .replace(/"/g, '""');
      const tags = (entry.tags || []).join(";");
      const wordCount = entry.content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      csvContent += `"${dateStr}","${timeStr}","${prompt}","${content}","${tags}",${wordCount}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reflectionary-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw error;
  }
};
