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
  Type,
  Maximize2,
  GalleryHorizontal,
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

// Font options
const fontOptions = [
  { label: "Par défaut", value: "" },
  { label: "Libre Baskerville", value: "'Libre Baskerville', Georgia, serif" },
  { label: "Poppins", value: "'Poppins', system-ui, sans-serif" },
  { label: "IBM Plex Mono", value: "'IBM Plex Mono', monospace" },
  { label: "Press Start 2P", value: "'Press Start 2P', monospace" },
];

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
  const lastClickedImageRef = useRef<HTMLImageElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [showImageResize, setShowImageResize] = useState(false);
  const [imageWidth, setImageWidth] = useState("300");
  // Use ref instead of state for selected image to avoid stale references
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const isInternalChange = useRef(false);
  const lastSelectionRef = useRef<Range | null>(null);
  const isInitialized = useRef(false);

  // Initialize content only once on mount or when value changes externally
  // IMPORTANT: Do NOT include isFocused in dependencies - it would cause
  // content to be overwritten when focus changes after internal edits
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
        if (savedRange) {
          restoreSelection(savedRange);
        }
      }
      // Reset internal change flag
      isInternalChange.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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

  // Apply font
  const applyFont = useCallback(
    (fontFamily: string) => {
      if (fontFamily) {
        document.execCommand("fontName", false, fontFamily);
      } else {
        // Remove font styling by setting to inherit
        document.execCommand("removeFormat", false, undefined);
      }
      syncToParent();
      setShowFontDropdown(false);
    },
    [syncToParent],
  );

  // Handle image resize - find selected image or prompt user
  const handleImageResize = useCallback(() => {
    let img: HTMLImageElement | null = null;

    // First, check if user clicked on an image (stored in ref)
    if (lastClickedImageRef.current) {
      img = lastClickedImageRef.current;
    }

    // If no clicked image, try to find from selection
    if (!img) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;

        if (container.nodeType === Node.ELEMENT_NODE) {
          const element = container as Element;
          if (element.tagName === "IMG") {
            img = element as HTMLImageElement;
          } else {
            img = element.querySelector("img");
          }
        } else if (container.parentElement) {
          const parent = container.parentElement;
          if (parent.tagName === "IMG") {
            img = parent as HTMLImageElement;
          }
        }
      }
    }

    // Last resort: check for single image in editor
    if (!img && editorRef.current) {
      const images = editorRef.current.querySelectorAll("img");
      if (images.length === 1) {
        img = images[0] as HTMLImageElement;
      } else if (images.length > 1) {
        alert("Cliquez d'abord sur l'image que vous souhaitez redimensionner");
        return;
      } else {
        alert("Aucune image trouvée dans l'éditeur");
        return;
      }
    }

    if (img) {
      selectedImageRef.current = img;
      // Get current width or natural width or default
      const currentWidth =
        img.getAttribute("width") ||
        img.style.width?.replace("px", "") ||
        img.naturalWidth ||
        300;
      setImageWidth(String(parseInt(String(currentWidth), 10)));
      setShowImageResize(true);
    }
  }, []);

  // Apply the resize
  const applyImageResize = useCallback(() => {
    const img = selectedImageRef.current;
    if (img && imageWidth) {
      const width = parseInt(imageWidth, 10);
      if (width > 0 && width <= 1200) {
        img.setAttribute("width", String(width));
        img.removeAttribute("height"); // Let height auto-adjust
        img.style.width = `${width}px`;
        img.style.height = "auto";
        img.style.outline = ""; // Clear selection outline
        syncToParent();
      }
    }
    // Clear refs and state
    lastClickedImageRef.current = null;
    selectedImageRef.current = null;
    setShowImageResize(false);
  }, [imageWidth, syncToParent]);

  // Toggle image inline/block display
  const toggleImageInline = useCallback(() => {
    let img: HTMLImageElement | null = null;

    // First, check if user clicked on an image (stored in ref)
    if (lastClickedImageRef.current) {
      img = lastClickedImageRef.current;
    }

    // If no clicked image, try to find from selection
    if (!img) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;

        if (container.nodeType === Node.ELEMENT_NODE) {
          const element = container as Element;
          if (element.tagName === "IMG") {
            img = element as HTMLImageElement;
          } else {
            img = element.querySelector("img");
          }
        } else if (container.parentElement) {
          const parent = container.parentElement;
          if (parent.tagName === "IMG") {
            img = parent as HTMLImageElement;
          }
        }
      }
    }

    // Last resort: check for single image in editor
    if (!img && editorRef.current) {
      const images = editorRef.current.querySelectorAll("img");
      if (images.length === 1) {
        img = images[0] as HTMLImageElement;
      } else if (images.length > 1) {
        alert("Cliquez d'abord sur l'image que vous souhaitez basculer");
        return;
      } else {
        alert("Aucune image trouvée dans l'éditeur");
        return;
      }
    }

    if (img) {
      // Toggle inline-image class
      img.classList.toggle("inline-image");
      syncToParent();
    }
  }, [syncToParent]);

  // Track clicked image in editor for resize feature
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleEditorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG") {
        lastClickedImageRef.current = target as HTMLImageElement;
        // Add visual selection indicator
        editor.querySelectorAll("img").forEach((img) => {
          img.style.outline = "";
        });
        (target as HTMLImageElement).style.outline =
          "2px solid hsl(var(--primary))";
      } else {
        // Clear selection when clicking elsewhere
        lastClickedImageRef.current = null;
        editor.querySelectorAll("img").forEach((img) => {
          img.style.outline = "";
        });
      }
    };

    editor.addEventListener("click", handleEditorClick);
    return () => editor.removeEventListener("click", handleEditorClick);
  }, []);

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

  // Close font dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showFontDropdown) {
        setShowFontDropdown(false);
      }
    };

    if (showFontDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFontDropdown]);

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
      {
        icon: <Maximize2 className="w-4 h-4" />,
        label: "Redimensionner image",
        command: "imageResize",
      },
      {
        icon: <GalleryHorizontal className="w-4 h-4" />,
        label: "Image en ligne",
        command: "imageInline",
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
        case "imageResize":
          handleImageResize();
          break;
        case "imageInline":
          toggleImageInline();
          break;
        case "formatBlock":
          execCommand(command, commandValue);
          break;
        default:
          execCommand(command, commandValue);
      }
    },
    [
      execCommand,
      insertHeading,
      insertLink,
      insertImage,
      handleImageResize,
      toggleImageInline,
    ],
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
        {/* Font selector dropdown */}
        <div className="relative flex gap-1 items-center" role="group">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowFontDropdown(!showFontDropdown);
            }}
            className="p-2 rounded hover:bg-primary/20 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-1"
            title="Police"
            aria-label="Sélectionner une police"
            aria-expanded={showFontDropdown}
            aria-haspopup="listbox"
          >
            <Type className="w-4 h-4" />
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showFontDropdown && (
            <div
              className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[180px]"
              role="listbox"
            >
              {fontOptions.map((font) => (
                <button
                  key={font.label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFont(font.value);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-primary/20 hover:text-primary transition-colors first:rounded-t-lg last:rounded-b-lg"
                  style={{ fontFamily: font.value || "inherit" }}
                  role="option"
                  aria-selected="false"
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
          <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />
        </div>

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

      {/* Image resize modal */}
      {showImageResize && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Redimensionner l&apos;image
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Largeur (pixels)
                </label>
                <input
                  type="number"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                  min="20"
                  max="1200"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="300"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  La hauteur s&apos;ajustera automatiquement
                </p>
              </div>

              {/* Quick size buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setImageWidth("40")}
                  className="px-3 py-1 text-sm bg-accent rounded hover:bg-primary/20"
                >
                  40px
                </button>
                <button
                  type="button"
                  onClick={() => setImageWidth("60")}
                  className="px-3 py-1 text-sm bg-accent rounded hover:bg-primary/20"
                >
                  60px
                </button>
                <button
                  type="button"
                  onClick={() => setImageWidth("80")}
                  className="px-3 py-1 text-sm bg-accent rounded hover:bg-primary/20"
                >
                  80px
                </button>
                <button
                  type="button"
                  onClick={() => setImageWidth("150")}
                  className="px-3 py-1 text-sm bg-accent rounded hover:bg-primary/20"
                >
                  150px
                </button>
                <button
                  type="button"
                  onClick={() => setImageWidth("300")}
                  className="px-3 py-1 text-sm bg-accent rounded hover:bg-primary/20"
                >
                  300px
                </button>
                <button
                  type="button"
                  onClick={() => setImageWidth("500")}
                  className="px-3 py-1 text-sm bg-accent rounded hover:bg-primary/20"
                >
                  500px
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImageResize(false);
                  selectedImageRef.current = null;
                }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={applyImageResize}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

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

        .rich-text-editor [contenteditable] img[width] {
          height: auto;
        }

        .rich-text-editor [contenteditable] img.inline-image {
          display: inline;
          margin: 0 0.5em;
          vertical-align: middle;
        }

        .rich-text-editor [contenteditable] p {
          margin: 0.5em 0;
        }

        .rich-text-editor [contenteditable] [style*="font-family"] {
          /* Allow inline font styles */
        }

        .rich-text-editor [contenteditable] font {
          /* Support legacy font tags from execCommand */
        }
      `}</style>
    </div>
  );
}
