"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Undo,
  Redo,
  Palette,
  ChevronDown,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  id?: string;
  name?: string;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  command: string;
  value?: string;
}

// Couleurs disponibles pour le texte
const TEXT_COLORS = [
  { name: "Par défaut", color: "#ffffff" },
  { name: "Orange", color: "#f97316" },
  { name: "Jaune", color: "#eab308" },
  { name: "Vert", color: "#22c55e" },
  { name: "Bleu", color: "#3b82f6" },
  { name: "Rouge", color: "#ef4444" },
];

// Helper to save current selection
function saveSelection(): Range | null {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    return selection.getRangeAt(0).cloneRange();
  }
  return null;
}

// Helper to restore selection
function restoreSelection(range: Range | null) {
  if (range) {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
  id,
  name,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const isInternalChange = useRef(false);
  const lastSelectionRef = useRef<Range | null>(null);
  const isInitialized = useRef(false);

  // Initialize content only once on mount or when value changes externally
  useEffect(() => {
    if (editorRef.current) {
      // Only set innerHTML if:
      // 1. This is the first initialization, OR
      // 2. The change came from external source (not user input)
      if (!isInitialized.current) {
        editorRef.current.innerHTML = value || "";
        isInitialized.current = true;
      } else if (!isInternalChange.current) {
        // External change - need to update content
        // Save selection before update
        const savedRange = saveSelection();
        editorRef.current.innerHTML = value || "";
        // Try to restore selection if editor is focused
        if (isFocused && savedRange) {
          restoreSelection(savedRange);
        }
      }
      // Reset internal change flag
      isInternalChange.current = false;
    }
  }, [value, isFocused]);

  // Sync content to parent without triggering re-render loop
  const syncToParent = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Execute document command with selection preservation
  const execCommand = useCallback(
    (command: string, commandValue: string | undefined = undefined) => {
      // Save current selection
      const savedRange = saveSelection();
      lastSelectionRef.current = savedRange;

      // Focus editor first
      editorRef.current?.focus();

      // Restore selection if we have one
      if (savedRange) {
        restoreSelection(savedRange);
      }

      // Execute the command
      document.execCommand(command, false, commandValue);

      // Sync content to parent
      syncToParent();
    },
    [syncToParent],
  );

  // Handle input changes
  const handleInput = useCallback(() => {
    syncToParent();
  }, [syncToParent]);

  // Insert heading
  const insertHeading = useCallback(
    (level: number) => {
      execCommand("formatBlock", `h${level}`);
    },
    [execCommand],
  );

  // Insert link
  const insertLink = useCallback(() => {
    // Save selection before prompt (prompt loses focus)
    const savedRange = saveSelection();
    const url = prompt("Entrez l'URL du lien:", "https://");
    if (url) {
      // Restore selection
      editorRef.current?.focus();
      if (savedRange) {
        restoreSelection(savedRange);
      }
      document.execCommand("createLink", false, url);
      syncToParent();
    }
  }, [syncToParent]);

  // Insert image
  const insertImage = useCallback(() => {
    // Save selection before prompt
    const savedRange = saveSelection();
    const url = prompt("Entrez l'URL de l'image:", "https://");
    if (url) {
      // Restore selection
      editorRef.current?.focus();
      if (savedRange) {
        restoreSelection(savedRange);
      }
      document.execCommand("insertImage", false, url);
      syncToParent();
    }
  }, [syncToParent]);

  // Apply text color
  const applyColor = useCallback(
    (color: string) => {
      execCommand("foreColor", color);
      setCurrentColor(color);
      setShowColorMenu(false);
    },
    [execCommand],
  );

  // Close color menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorMenuRef.current &&
        !colorMenuRef.current.contains(event.target as Node)
      ) {
        setShowColorMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toolbar buttons configuration
  const toolbarButtons: ToolbarButton[][] = [
    // Formatting
    [
      { icon: <Bold className="w-4 h-4" />, label: "Gras", command: "bold" },
      {
        icon: <Italic className="w-4 h-4" />,
        label: "Italique",
        command: "italic",
      },
      {
        icon: <Underline className="w-4 h-4" />,
        label: "Souligné",
        command: "underline",
      },
    ],
    // Headings
    [
      {
        icon: <Heading1 className="w-4 h-4" />,
        label: "Titre 1",
        command: "heading1",
      },
      {
        icon: <Heading2 className="w-4 h-4" />,
        label: "Titre 2",
        command: "heading2",
      },
      {
        icon: <Heading3 className="w-4 h-4" />,
        label: "Titre 3",
        command: "heading3",
      },
    ],
    // Lists
    [
      {
        icon: <List className="w-4 h-4" />,
        label: "Liste à puces",
        command: "insertUnorderedList",
      },
      {
        icon: <ListOrdered className="w-4 h-4" />,
        label: "Liste numérotée",
        command: "insertOrderedList",
      },
    ],
    // Block elements
    [
      {
        icon: <Quote className="w-4 h-4" />,
        label: "Citation",
        command: "formatBlock",
        value: "blockquote",
      },
      {
        icon: <Code className="w-4 h-4" />,
        label: "Code",
        command: "formatBlock",
        value: "pre",
      },
    ],
    // Insert
    [
      {
        icon: <Link className="w-4 h-4" aria-label="Link" />,
        label: "Lien",
        command: "link",
      },
      {
        icon: <Image className="w-4 h-4" aria-label="Image" />,
        label: "Image",
        command: "image",
      },
    ],
    // History
    [
      { icon: <Undo className="w-4 h-4" />, label: "Annuler", command: "undo" },
      {
        icon: <Redo className="w-4 h-4" />,
        label: "Rétablir",
        command: "redo",
      },
    ],
  ];

  // Handle toolbar button click with mousedown to prevent focus loss
  const handleToolbarMouseDown = useCallback(
    (e: React.MouseEvent, command: string, commandValue?: string) => {
      e.preventDefault(); // Prevent focus loss from editor

      switch (command) {
        case "heading1":
          insertHeading(1);
          break;
        case "heading2":
          insertHeading(2);
          break;
        case "heading3":
          insertHeading(3);
          break;
        case "link":
          insertLink();
          break;
        case "image":
          insertImage();
          break;
        case "formatBlock":
          execCommand(command, commandValue);
          break;
        default:
          execCommand(command, commandValue);
      }
    },
    [execCommand, insertHeading, insertLink, insertImage],
  );

  // Handle paste with sanitization
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text =
        e.clipboardData.getData("text/html") ||
        e.clipboardData.getData("text/plain");
      // Sanitize pasted content
      const sanitized = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/javascript:/gi, "");
      document.execCommand("insertHTML", false, sanitized);
      syncToParent();
    },
    [syncToParent],
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur - save selection for later restoration
  const handleBlur = useCallback(() => {
    lastSelectionRef.current = saveSelection();
    setIsFocused(false);
  }, []);

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 p-2 bg-accent/50 border border-border rounded-t-lg"
        role="toolbar"
        aria-label="Barre d'outils de l'éditeur"
      >
        {toolbarButtons.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="flex gap-1 items-center"
            role="group"
          >
            {group.map((button) => (
              <button
                key={button.command + (button.value || "")}
                type="button"
                onMouseDown={(e) =>
                  handleToolbarMouseDown(e, button.command, button.value)
                }
                className="p-2 rounded hover:bg-primary/20 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                title={button.label}
                aria-label={button.label}
              >
                {button.icon}
              </button>
            ))}
            {groupIndex < toolbarButtons.length - 1 && (
              <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />
            )}
          </div>
        ))}

        {/* Color picker */}
        <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />
        <div ref={colorMenuRef} className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowColorMenu(!showColorMenu);
            }}
            className="flex items-center gap-1 p-2 rounded hover:bg-primary/20 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            title="Couleur du texte"
            aria-label="Couleur du texte"
            aria-expanded={showColorMenu}
            aria-haspopup="true"
          >
            <Palette className="w-4 h-4" />
            <div
              className="w-3 h-3 rounded-sm border border-white/30"
              style={{ backgroundColor: currentColor }}
            />
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Color dropdown menu */}
          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-accent border border-border rounded-lg shadow-lg z-50 min-w-[120px]">
              <div className="flex flex-wrap gap-1">
                {TEXT_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyColor(colorOption.color);
                    }}
                    className={`w-7 h-7 rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary ${
                      currentColor === colorOption.color
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                    aria-label={colorOption.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        className={`min-h-[300px] p-4 bg-background border border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary prose prose-invert max-w-none ${
          error ? "border-destructive" : "border-border"
        } ${isFocused ? "ring-2 ring-primary" : ""}`}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder || "Éditeur de contenu"}
        data-placeholder={placeholder}
        style={{
          minHeight: "300px",
        }}
      />

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Editor styles */}
      <style jsx global>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }

        .rich-text-editor [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
          color: hsl(var(--primary));
        }

        .rich-text-editor [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          color: hsl(var(--primary));
        }

        .rich-text-editor [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .rich-text-editor [contenteditable] blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .rich-text-editor [contenteditable] pre {
          background: hsl(var(--accent));
          padding: 1em;
          border-radius: 0.5em;
          font-family: "IBM Plex Mono", monospace;
          overflow-x: auto;
        }

        .rich-text-editor [contenteditable] code {
          background: hsl(var(--accent));
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: "IBM Plex Mono", monospace;
        }

        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] ol {
          padding-left: 2em;
          margin: 0.5em 0;
        }

        .rich-text-editor [contenteditable] li {
          margin: 0.25em 0;
        }

        .rich-text-editor [contenteditable] a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }

        .rich-text-editor [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 1em 0;
        }

        .rich-text-editor [contenteditable] p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
