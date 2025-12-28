"use client";

import { useState, useRef, useCallback } from "react";
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

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
  id,
  name,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Execute document command
  const execCommand = useCallback(
    (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      // Sync content to parent
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange],
  );

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Insert heading
  const insertHeading = useCallback(
    (level: number) => {
      execCommand("formatBlock", `h${level}`);
    },
    [execCommand],
  );

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt("Entrez l'URL du lien:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  // Insert image
  const insertImage = useCallback(() => {
    const url = prompt("Entrez l'URL de l'image:", "https://");
    if (url) {
      execCommand("insertImage", url);
    }
  }, [execCommand]);

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
      { icon: <Link className="w-4 h-4" />, label: "Lien", command: "link" },
      { icon: <Image className="w-4 h-4" />, label: "Image", command: "image" },
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

  // Handle toolbar button click
  const handleToolbarClick = useCallback(
    (command: string, value?: string) => {
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
          execCommand(command, value);
          break;
        default:
          execCommand(command, value);
      }
    },
    [execCommand, insertHeading, insertLink, insertImage],
  );

  // Set initial content when value changes externally
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
      handleInput();
    },
    [handleInput],
  );

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
                onClick={() => handleToolbarClick(button.command, button.value)}
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
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
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
