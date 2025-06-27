// Replace your existing Quill initialization useEffect with this improved version:

useEffect(() => {
  if (isLocked || !user) return;

  // Clean up any existing timeout
  if (initTimeoutRef.current) {
    clearTimeout(initTimeoutRef.current);
  }

  const initializeQuill = () => {
    // More robust DOM readiness check
    if (!editorRef.current || !document.body.contains(editorRef.current)) {
      console.log("📝 Editor ref not ready, retrying...");
      initTimeoutRef.current = setTimeout(initializeQuill, 100);
      return;
    }

    // Check if Quill is already properly initialized
    if (quillRef.current && quillRef.current.getModule) {
      try {
        // Test if Quill is actually functional
        quillRef.current.getText();
        console.log("✅ Quill already initialized and functional");
        setIsEditorReady(true);
        return;
      } catch (error) {
        console.log("🔄 Existing Quill not functional, reinitializing...");
        // Clear the broken instance
        quillRef.current = null;
        quillInitialized.current = false;
      }
    }

    // Clear any existing Quill content in the element
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      // Remove any Quill classes that might interfere
      editorRef.current.className = editorRef.current.className
        .split(" ")
        .filter((cls) => !cls.startsWith("ql-"))
        .join(" ");
    }

    try {
      const toolbarOptions = [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ];

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
        placeholder: selectedTemplate
          ? "Start writing based on the template prompts..."
          : "Start writing your thoughts...",
      });

      // Set up event listener
      quill.on("text-change", () => {
        setEditorContent(quill.root.innerHTML);
      });

      // Store references
      quillRef.current = quill;
      quillInitialized.current = true;
      setIsEditorReady(true);

      // Load the last saved entry
      loadLastEntry();

      console.log("✅ Quill editor initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Quill:", error);
      // Reset state and retry
      quillRef.current = null;
      quillInitialized.current = false;
      setIsEditorReady(false);
      initTimeoutRef.current = setTimeout(initializeQuill, 500);
    }
  };

  // Start initialization with a small delay to ensure DOM is ready
  initTimeoutRef.current = setTimeout(initializeQuill, 50);

  return () => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
    // Don't reset the initialized flag here - let it persist
  };
}, [isLocked, user, selectedTemplate]); // Keep the same dependencies

// ADD this new useEffect for handling visibility changes (browser tab switching):
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && editorRef.current && user && !isLocked) {
      // Page became visible again, check if Quill needs reinitialization
      setTimeout(() => {
        if (!quillRef.current || !isEditorReady) {
          console.log("🔄 Page visible again, reinitializing Quill...");
          quillInitialized.current = false; // Allow reinitialization
          // Trigger the main initialization useEffect
          setIsEditorReady(false);
        }
      }, 100);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [user, isLocked, isEditorReady]);

// ALSO ADD this useEffect to handle navigation back to the component:
useEffect(() => {
  // This runs every time the component mounts/becomes active
  if (!isLocked && user && editorRef.current) {
    // Small delay to ensure DOM is settled after navigation
    const checkTimer = setTimeout(() => {
      if (!quillRef.current || !isEditorReady) {
        console.log("🔄 Component reactivated, checking Quill status...");
        quillInitialized.current = false;
        setIsEditorReady(false);
      }
    }, 200);

    return () => clearTimeout(checkTimer);
  }
}, []); // Empty dependency array - runs on every mount
