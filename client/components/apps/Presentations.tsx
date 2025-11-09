import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Download,
  Play,
  Copy,
  Layers,
  Type,
  Square,
  Circle,
  Palette,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Zap,
  Settings,
  Move,
  Maximize2,
} from "lucide-react";
import PptxGenJs from "pptxgenjs";
import { cn } from "@/lib/utils";

interface SlideElement {
  id: string;
  type: "text" | "shape" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
  bgColor?: string;
  fontSize?: number;
  fontFamily?: string;
  shape?: "rectangle" | "circle" | "triangle";
  animation?: "fade" | "slide" | "bounce" | "zoom" | "rotate" | "none";
  imageUrl?: string;
  rotation?: number;
}

interface Slide {
  id: string;
  title: string;
  bgColor: string;
  textColor: string;
  elements: SlideElement[];
}

const SLIDE_TEMPLATES = [
  {
    name: "Title Slide",
    bgColor: "from-purple-600 to-indigo-600",
    textColor: "text-white",
  },
  {
    name: "Content",
    bgColor: "from-gray-900 to-gray-800",
    textColor: "text-white",
  },
  {
    name: "Two Column",
    bgColor: "from-blue-900 to-purple-900",
    textColor: "text-white",
  },
];

const FONTS = ["Inter", "Georgia", "Courier", "Comic Sans MS", "Trebuchet MS"];
const ANIMATIONS = ["none", "fade", "slide", "bounce", "zoom", "rotate"];

export const Presentations: React.FC<{ windowId?: string }> = ({
  windowId,
}) => {
  const [presentations, setPresentations] = useState([
    {
      id: "1",
      name: "My Presentation",
      slides: [
        {
          id: "slide-1",
          title: "Welcome to Advanced Presentations",
          bgColor: "from-purple-600 to-indigo-600",
          textColor: "text-white",
          elements: [
            {
              id: "el-1",
              type: "text",
              x: 50,
              y: 100,
              width: 400,
              height: 100,
              content: "Click to add text",
              fontSize: 24,
              fontFamily: "Inter",
              animation: "slide",
              color: "#ffffff",
            },
          ],
        },
      ],
    },
  ]);
  const [activePresentationId, setActivePresentationId] = useState("1");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [resizingElement, setResizingElement] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePresentation = presentations.find(
    (p) => p.id === activePresentationId,
  );
  const activeSlide = activePresentation?.slides[activeSlideIndex];

  const addSlide = (templateIndex?: number) => {
    if (!activePresentation) return;

    const template =
      templateIndex !== undefined
        ? SLIDE_TEMPLATES[templateIndex]
        : SLIDE_TEMPLATES[1];
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${activePresentation.slides.length + 1}`,
      bgColor: template.bgColor,
      textColor: template.textColor,
      elements: [],
    };

    setPresentations((prev) =>
      prev.map((p) =>
        p.id === activePresentationId
          ? { ...p, slides: [...p.slides, newSlide] }
          : p,
      ),
    );
  };

  const updateSlide = (updates: Partial<Slide>) => {
    if (!activePresentation) return;

    setPresentations((prev) =>
      prev.map((p) =>
        p.id === activePresentationId
          ? {
              ...p,
              slides: p.slides.map((s, i) =>
                i === activeSlideIndex ? { ...s, ...updates } : s,
              ),
            }
          : p,
      ),
    );
  };

  const addElement = (type: "text" | "shape" | "image") => {
    if (!activePresentation || !activeSlide) return;

    const newElement: SlideElement = {
      id: `el-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === "image" ? 200 : 150,
      height: type === "image" ? 200 : 100,
      content: type === "text" ? "Click to edit" : "",
      color: "#ffffff",
      bgColor: "#6366f1",
      fontSize: 16,
      fontFamily: "Inter",
      shape: "rectangle",
      animation: "fade",
    };

    updateSlide({
      elements: [...activeSlide.elements, newElement],
    });

    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    if (!activePresentation || !activeSlide) return;

    updateSlide({
      elements: activeSlide.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el,
      ),
    });
  };

  const deleteElement = (elementId: string) => {
    if (!activePresentation || !activeSlide) return;

    updateSlide({
      elements: activeSlide.elements.filter((el) => el.id !== elementId),
    });

    setSelectedElement(null);
  };

  const deleteSlide = (index: number) => {
    if (!activePresentation || activePresentation.slides.length <= 1) return;

    setPresentations((prev) =>
      prev.map((p) =>
        p.id === activePresentationId
          ? { ...p, slides: p.slides.filter((_, i) => i !== index) }
          : p,
      ),
    );

    if (activeSlideIndex >= activePresentation.slides.length - 1) {
      setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    }
  };

  const handleImageUpload = (
    elementId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateElement(elementId, { imageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const exportAsPPTX = () => {
    const prs = new PptxGenJs();
    prs.defineLayout({ name: "LAYOUT1", width: 10, height: 5.625 });
    prs.defaultLayout = "LAYOUT1";

    activePresentation?.slides.forEach((slide) => {
      const pptSlide = prs.addSlide();

      // Add background
      const bgGradient = slide.bgColor.split(" ");
      const fromColor =
        bgGradient[1]?.replace("from-", "")?.replace(/\d+/, "AA") || "663399";
      const toColor =
        bgGradient[3]?.replace("to-", "")?.replace(/\d+/, "AA") || "6366F1";

      pptSlide.background = { fill: fromColor };

      // Add elements
      slide.elements.forEach((element) => {
        if (element.type === "text") {
          pptSlide.addText(element.content, {
            x: element.x / 100,
            y: element.y / 100,
            w: element.width / 100,
            h: element.height / 100,
            fontSize: element.fontSize || 14,
            fontFace: element.fontFamily || "Arial",
            color: element.color?.replace("#", "") || "FFFFFF",
            align: "left",
          });
        }

        if (element.type === "shape") {
          pptSlide.addShape(
            element.shape === "circle"
              ? "ellipse"
              : element.shape === "rectangle"
                ? "rect"
                : "rect",
            {
              x: element.x / 100,
              y: element.y / 100,
              w: element.width / 100,
              h: element.height / 100,
              fill: { color: element.bgColor?.replace("#", "") || "6366F1" },
            },
          );
        }

        if (element.type === "image" && element.imageUrl) {
          pptSlide.addImage({
            data: element.imageUrl,
            x: element.x / 100,
            y: element.y / 100,
            w: element.width / 100,
            h: element.height / 100,
          });
        }
      });
    });

    prs.save({
      fileName: `${activePresentation?.name || "presentation"}.pptx`,
    });
  };

  if (!activePresentation || !activeSlide) return null;

  return (
    <div className="w-full h-full flex bg-gray-900">
      {/* Left Sidebar */}
      <motion.div
        className="w-64 glass-purple-dark border-r border-purple-400/20 overflow-y-auto p-4 flex flex-col gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2">Slides</h3>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full p-2 glass-purple hover:bg-white/10 rounded text-white text-sm"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Slide
          </button>
        </div>

        {showTemplates && (
          <motion.div
            className="space-y-2 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            {SLIDE_TEMPLATES.map((template, idx) => (
              <button
                key={idx}
                onClick={() => {
                  addSlide(idx);
                  setShowTemplates(false);
                }}
                className="w-full p-2 glass-purple hover:bg-white/20 rounded text-white text-xs text-left"
              >
                {template.name}
              </button>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {activePresentation.slides.map((slide, index) => (
            <motion.button
              key={slide.id}
              onClick={() => setActiveSlideIndex(index)}
              className={cn(
                "p-3 rounded-lg transition-all group relative overflow-hidden text-left",
                activeSlideIndex === index
                  ? "ring-2 ring-purple-400 glass-purple"
                  : "glass-purple hover:bg-white/10",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-xs font-semibold text-white truncate">
                Slide {index + 1}
              </div>
              <div className="text-xs text-white/60">
                {slide.elements.length} elements
              </div>
              {activeSlideIndex === index && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(index);
                  }}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded"
                  whileHover={{ scale: 1.1 }}
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </motion.button>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Main Editor */}
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Toolbar */}
        <div className="glass-purple-dark border-b border-purple-400/20 px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => addElement("text")}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors text-xs"
            title="Add Text"
          >
            <Type className="w-4 h-4 inline mr-1" />
            Text
          </button>
          <button
            onClick={() => addElement("shape")}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors text-xs"
            title="Add Shape"
          >
            <Square className="w-4 h-4 inline mr-1" />
            Shape
          </button>
          <button
            onClick={() => addElement("image")}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors text-xs"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4 inline mr-1" />
            Image
          </button>
          <div className="w-px h-6 bg-white/20" />
          <button
            onClick={exportAsPPTX}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            title="Export as PPTX"
          >
            <Download className="w-4 h-4 inline mr-1" />
            <span className="text-xs">PPTX</span>
          </button>
          <button
            onClick={() => setIsPresenting(!isPresenting)}
            className="ml-auto p-2 bg-purple-500 hover:bg-purple-600 rounded text-white transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Present
          </button>
        </div>

        {/* Slide Editor */}
        {!isPresenting ? (
          <motion.div
            className="flex-1 p-8 overflow-auto flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={cn(
                "w-full max-w-5xl aspect-video rounded-lg shadow-2xl p-8 flex flex-col justify-center items-center relative overflow-hidden",
                `bg-gradient-to-br ${activeSlide.bgColor}`,
                activeSlide.textColor,
              )}
            >
              <AnimatePresence>
                {activeSlide.elements.map((element) => (
                  <motion.div
                    key={element.id}
                    className={cn(
                      "absolute cursor-move rounded group",
                      selectedElement === element.id &&
                        "ring-2 ring-yellow-400",
                    )}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                    }}
                    onClick={() => setSelectedElement(element.id)}
                    onDoubleClick={() => setEditingElement(element.id)}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      updateElement(element.id, {
                        x: Math.max(0, element.x + info.offset.x),
                        y: Math.max(0, element.y + info.offset.y),
                      });
                    }}
                  >
                    {/* Content */}
                    {element.type === "text" && (
                      <div
                        className="w-full h-full flex items-center justify-center p-2"
                        style={{
                          fontSize: element.fontSize,
                          fontFamily: element.fontFamily,
                          color: element.color,
                        }}
                      >
                        {editingElement === element.id ? (
                          <input
                            type="text"
                            value={element.content}
                            onChange={(e) =>
                              updateElement(element.id, {
                                content: e.target.value,
                              })
                            }
                            onBlur={() => setEditingElement(null)}
                            className="w-full h-full bg-transparent outline-none text-center"
                            autoFocus
                          />
                        ) : (
                          element.content
                        )}
                      </div>
                    )}

                    {element.type === "shape" && (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: element.bgColor,
                          borderRadius:
                            element.shape === "circle" ? "50%" : "8px",
                        }}
                      />
                    )}

                    {element.type === "image" &&
                      (element.imageUrl ? (
                        <img
                          src={element.imageUrl}
                          alt="Slide element"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full flex items-center justify-center bg-gray-700/50 rounded hover:bg-gray-700"
                        >
                          <ImageIcon className="w-6 h-6 text-white/50" />
                        </button>
                      ))}

                    {/* Resize Handles */}
                    {selectedElement === element.id && (
                      <>
                        {/* SE Corner (Main resize handle) */}
                        <motion.div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 rounded-tl cursor-se-resize"
                          style={{ transform: "translate(1.5px, 1.5px)" }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startWidth = element.width;
                            const startHeight = element.height;

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaX = moveEvent.clientX - startX;
                              const deltaY = moveEvent.clientY - startY;
                              updateElement(element.id, {
                                width: Math.max(50, startWidth + deltaX),
                                height: Math.max(50, startHeight + deltaY),
                              });
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleMouseMove,
                              );
                              document.removeEventListener(
                                "mouseup",
                                handleMouseUp,
                              );
                            };

                            document.addEventListener(
                              "mousemove",
                              handleMouseMove,
                            );
                            document.addEventListener("mouseup", handleMouseUp);
                          }}
                        />
                        {/* NW Corner */}
                        <motion.div
                          className="absolute top-0 left-0 w-3 h-3 bg-yellow-400 rounded-br cursor-nw-resize"
                          style={{ transform: "translate(-1.5px, -1.5px)" }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startX_ = element.x;
                            const startY_ = element.y;
                            const startWidth = element.width;
                            const startHeight = element.height;

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaX = moveEvent.clientX - startX;
                              const deltaY = moveEvent.clientY - startY;
                              updateElement(element.id, {
                                x: Math.max(0, startX_ + deltaX),
                                y: Math.max(0, startY_ + deltaY),
                                width: Math.max(50, startWidth - deltaX),
                                height: Math.max(50, startHeight - deltaY),
                              });
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleMouseMove,
                              );
                              document.removeEventListener(
                                "mouseup",
                                handleMouseUp,
                              );
                            };

                            document.addEventListener(
                              "mousemove",
                              handleMouseMove,
                            );
                            document.addEventListener("mouseup", handleMouseUp);
                          }}
                        />
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className={cn(
              "flex-1 flex flex-col justify-center items-center",
              `bg-gradient-to-br ${activeSlide.bgColor}`,
              activeSlide.textColor,
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {activeSlide.elements.map((element) => (
              <motion.div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {element.type === "text" && (
                  <div
                    style={{
                      fontSize: element.fontSize,
                      fontFamily: element.fontFamily,
                      color: element.color,
                    }}
                  >
                    {element.content}
                  </div>
                )}
                {element.type === "shape" && (
                  <div
                    style={{
                      backgroundColor: element.bgColor,
                      borderRadius: element.shape === "circle" ? "50%" : "0",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
                {element.type === "image" && element.imageUrl && (
                  <img
                    src={element.imageUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Navigation */}
        {!isPresenting && (
          <div className="glass-purple-dark border-t border-purple-400/20 px-6 py-3 flex items-center justify-between">
            <button
              onClick={() =>
                setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))
              }
              disabled={activeSlideIndex === 0}
              className="p-2 hover:bg-white/20 rounded text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white text-sm">
              Slide {activeSlideIndex + 1} of {activePresentation.slides.length}
            </span>
            <button
              onClick={() =>
                setActiveSlideIndex(
                  Math.min(
                    activePresentation.slides.length - 1,
                    activeSlideIndex + 1,
                  ),
                )
              }
              disabled={
                activeSlideIndex === activePresentation.slides.length - 1
              }
              className="p-2 hover:bg-white/20 rounded text-white disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const element = activeSlide?.elements.find(
            (el) => el.id === selectedElement,
          );
          if (element) {
            handleImageUpload(element.id, e);
          }
        }}
        className="hidden"
      />
    </div>
  );
};
