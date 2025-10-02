

// import React, { FC, useEffect, useRef, useState, ChangeEvent } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Square,
//   Circle as CircleIcon,
//   Type,
//   Image as ImageIcon,
//   Save,
//   Download,
//   Shapes, // New Icon
//   Bold,   // New Icon
//   Underline, // New Icon
//   Palette, // New Icon
// } from "lucide-react";
// import toast from "react-hot-toast";
// import * as fabric from "fabric";

// // Helper to get the text object from a group
// const getTextFromGroup = (group: fabric.Group): fabric.IText | undefined => {
//   return group.getObjects().find((o) => o.type === "i-text") as fabric.IText;
// };

// // Helper to get the shape object from a group
// const getShapeFromGroup = (group: fabric.Group): fabric.Object | undefined => {
//     return group.getObjects().find((o) => o.type !== "i-text");
// };


// interface Design {
//   _id?: string;
//   title: string;
//   jsonData: any;
//   s3Url: string;
// }

// interface AuthContextType {
//   addDesign: (newDesign: Design) => void;
//   updateDesign: (id: string, updatedDesignData: Partial<Design>) => void;
//   getDesignById: (id: string) => Design | undefined;
//   authUser?: any;
// }

// export const CanvasEditor: FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const imageInputRef = useRef<HTMLInputElement>(null);
//   const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
//   const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
//     null
//   );

//   const { designId } = useParams<{ designId?: string }>();
//   const navigate = useNavigate();
//   const { addDesign, updateDesign, getDesignById } = useAuth() as AuthContextType;

//   // Initialize Fabric canvas and load design if any
//   useEffect(() => {
//     if (!canvasRef.current) return;
//     const canvas = new fabric.Canvas(canvasRef.current, {
//       width: 800,
//       height: 600,
//       backgroundColor: "#ffffff",
//     });
//     setFabricCanvas(canvas);

//     // --- NEW: Event listeners for object selection ---
//     const updateSelection = (e: fabric.IEvent) => {
//         setSelectedObject(e.selected ? e.selected[0] : null);
//     };
//     const clearSelection = () => {
//         setSelectedObject(null);
//     }
    
//     canvas.on("selection:created", updateSelection);
//     canvas.on("selection:updated", updateSelection);
//     canvas.on("selection:cleared", clearSelection);


//     const loadDesign = async () => {
//       if (!designId) return;

//       let existingDesign = getDesignById(designId);

//       if (!existingDesign) {
//         try {
//           const token = JSON.parse(
//             localStorage.getItem("chat-user") || "{}"
//           ).token;
//           if (!token) throw new Error("Not authorized");
//           const res = await fetch(
//             `http://localhost:5000/api/designs/${designId}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
//           if (res.ok) {
//             existingDesign = await res.json();
//             if ("design" in existingDesign) {
//               existingDesign = (existingDesign as any).design;
//             }
//           } else {
//             console.warn("Failed to fetch design from server");
//           }
//         } catch (err) {
//           console.error("Error fetching design:", err);
//         }
//       }

//       if (existingDesign?.jsonData) {
//         const parsed =
//           typeof existingDesign.jsonData === "string"
//             ? JSON.parse(existingDesign.jsonData)
//             : existingDesign.jsonData;

//         canvas.loadFromJSON(parsed, () => {
//           canvas.renderAll();
//           canvas.requestRenderAll();
//         });
//       } else {
//         toast("No design data found to load.");
//       }
//     };

//     loadDesign();

//     return () => {
//       // --- NEW: Cleanup event listeners ---
//       canvas.off("selection:created", updateSelection);
//       canvas.off("selection:updated", updateSelection);
//       canvas.off("selection:cleared", clearSelection);
//       if (canvas && typeof canvas.dispose === "function") canvas.dispose();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [designId, getDesignById]);

//   // --- MODIFIED: Add various shapes ---
//   const addShape = (shapeType: string) => {
//     if (!fabricCanvas) return;
//     let shape: fabric.Object | null = null;
//     const commonProps = {
//         left: 100,
//         top: 100,
//         fill: "#8B5CF6", // Default color
//         cornerColor: "blue",
//         cornerSize: 8,
//     };

//     switch (shapeType) {
//         case "rectangle":
//             shape = new fabric.Rect({ ...commonProps, width: 100, height: 100 });
//             break;
//         case "circle":
//             shape = new fabric.Circle({ ...commonProps, radius: 50 });
//             break;
//         case "triangle":
//             shape = new fabric.Triangle({ ...commonProps, width: 100, height: 100 });
//             break;
//         case "ellipse":
//             shape = new fabric.Ellipse({ ...commonProps, rx: 75, ry: 50 });
//             break;
//         // Add more shapes here...
//         default:
//             break;
//     }
    
//     if (shape) {
//       fabricCanvas.add(shape);
//       fabricCanvas.setActiveObject(shape);
//       fabricCanvas.renderAll();
//     }
//   };

//   const addText = () => {
//     if (!fabricCanvas) return;
//     const text = new fabric.IText("Type here...", {
//       left: 100,
//       top: 100,
//       fill: "#000000",
//       fontSize: 32,
//       fontFamily: "Inter",
//       cornerColor: "blue",
//       cornerSize: 8,
//     });
//     fabricCanvas.add(text);
//     fabricCanvas.setActiveObject(text);
//     fabricCanvas.renderAll();
//   };
  
//   // --- NEW: Add text inside a selected shape ---
//   const addTextToShape = () => {
//     if (!fabricCanvas || !selectedObject || !['rect', 'circle', 'triangle', 'ellipse'].includes(selectedObject.type || '')) return;

//     const shape = selectedObject as fabric.Object;
//     const text = new fabric.IText("Text", {
//         fontSize: 20,
//         fill: '#FFFFFF',
//         originX: 'center',
//         originY: 'center',
//         top: shape.top,
//         left: shape.left,
//         textAlign: 'center',
//     });

//     const group = new fabric.Group([shape, text], {
//         left: shape.left,
//         top: shape.top
//     });

//     fabricCanvas.remove(shape);
//     fabricCanvas.add(group);
//     fabricCanvas.setActiveObject(group);
//     fabricCanvas.renderAll();
//   };

//   const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !fabricCanvas) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const imgData = event.target?.result as string;
//       if (!imgData) return;

//       const imgElement = new Image();
//       imgElement.src = imgData;
//       imgElement.onload = () => {
//         const fabricImg = new fabric.Image(imgElement, {
//           left: 100,
//           top: 100,
//           // Preserving small image size logic
//           scaleX: Math.min(1, 200 / imgElement.width),
//           scaleY: Math.min(1, 200 / imgElement.height),
//           cornerColor: "blue",
//           cornerSize: 8,
//         });
//         fabricCanvas.add(fabricImg);
//         fabricCanvas.centerObject(fabricImg);
//         fabricCanvas.setActiveObject(fabricImg);
//         fabricCanvas.renderAll();
//       };
//     };
//     reader.readAsDataURL(file);
//     e.target.value = "";
//   };
  
//     // --- NEW: Functions to modify selected object properties ---
//     const updateObjectColor = (color: string) => {
//         if (!fabricCanvas || !selectedObject) return;
//         if (selectedObject.type === 'group') {
//             const shape = getShapeFromGroup(selectedObject as fabric.Group);
//             shape?.set('fill', color);
//         } else {
//             selectedObject.set("fill", color);
//         }
//         fabricCanvas.renderAll();
//     };

//     const updateTextProperty = (prop: keyof fabric.IText, value: any) => {
//         if (!fabricCanvas || !selectedObject) return;
//         let textObject: fabric.IText | undefined;

//         if (selectedObject.type === 'i-text') {
//             textObject = selectedObject as fabric.IText;
//         } else if (selectedObject.type === 'group') {
//             textObject = getTextFromGroup(selectedObject as fabric.Group);
//         }

//         if (textObject) {
//             textObject.set(prop, value);
//             fabricCanvas.renderAll();
//         }
//     };

//     const toggleTextStyle = (style: 'fontWeight' | 'underline') => {
//         if (!fabricCanvas || !selectedObject) return;
//         let textObject: fabric.IText | undefined;

//         if (selectedObject.type === 'i-text') {
//             textObject = selectedObject as fabric.IText;
//         } else if (selected_object.type === 'group') {
//             textObject = getTextFromGroup(selected_object as fabric.Group);
//         }

//         if (textObject) {
//             if (style === 'fontWeight') {
//                 const isBold = textObject.get('fontWeight') === 'bold';
//                 textObject.set('fontWeight', isBold ? 'normal' : 'bold');
//             }
//             if (style === 'underline') {
//                 const isUnderlined = textObject.get('underline');
//                 textObject.set('underline', !isUnderlined);
//             }
//             fabricCanvas.renderAll();
//         }
//     };


//   // UNCHANGED: Save and Export functions
//   const handleSave = async () => {
//     if (!fabricCanvas) return;
//     const canvasJSON = fabricCanvas.toJSON();
//     const fullImage = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
//     const currentTitle = designId ? getDesignById(designId)?.title : "Untitled Design";
//     const designName = prompt("Enter a name for your design:", currentTitle || "Untitled Design");
//     if (!designName) return;
//     const token = JSON.parse(localStorage.getItem("chat-user") || "{}").token;
//     if (!token) { toast.error("Not authorized"); return; }
//     try {
//       let res;
//       if (designId) {
//         res = await fetch(`http://localhost:5000/api/designs/${designId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//           body: JSON.stringify({ name: designName, image: fullImage, data: canvasJSON }),
//         });
//       } else {
//         res = await fetch("http://localhost:5000/api/designs/upload", {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//           body: JSON.stringify({ name: designName, image: fullImage, data: canvasJSON }),
//         });
//       }
//       if (!res.ok) throw new Error("Save failed");
//       const resJson = await res.json();
//       const returnedDesign = resJson.design || resJson;
//       if (designId) {
//         updateDesign(designId, { title: designName, jsonData: canvasJSON, s3Url: returnedDesign.s3Url });
//         toast.success("Design updated successfully!");
//       } else {
//         const newDesign: Design = { _id: returnedDesign._id, title: designName, jsonData: canvasJSON, s3Url: returnedDesign.s3Url };
//         addDesign(newDesign);
//         toast.success("Design saved successfully!");
//       }
//       navigate("/dashboard");
//     } catch (err: any) {
//       toast.error(err.message || "Failed to save design");
//     }
//   };
//   const handleExport = () => {
//     if (!fabricCanvas) return;
//     const dataURL = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
//     const link = document.createElement("a");
//     link.download = `matty-design-${Date.now()}.png`;
//     link.href = dataURL;
//     link.click();
//     toast.success("Design exported as PNG!");
//   };

//   const fonts = ["Inter", "Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana"];
//   const colorPalette = ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E", "#14B8A6", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899"];

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Left Toolbar */}
//       <Card className="w-24 m-4 mr-2 shadow-lg flex-shrink-0">
//         <CardContent className="p-2 space-y-2">
//             {/* --- MODIFIED: Shape Dropdown --- */}
//            <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                  <Button title="Shapes" variant="ghost" size="icon" className="w-full h-12 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600">
//                     <Shapes />
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//                 <DropdownMenuItem onClick={() => addShape("rectangle")}>Rectangle</DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => addShape("circle")}>Circle</DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => addShape("triangle")}>Triangle</DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => addShape("ellipse")}>Ellipse</DropdownMenuItem>
//             </DropdownMenuContent>
//            </DropdownMenu>

//           <Button title="Text" onClick={addText} variant="ghost" size="icon" className="w-full h-12 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600" >
//             <Type />
//           </Button>
//           <Button title="Image" onClick={() => imageInputRef.current?.click()} variant="ghost" size="icon" className="w-full h-12 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600" >
//             <ImageIcon />
//           </Button>
//           <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
//         </CardContent>
//       </Card>

//       {/* Main Canvas Area */}
//       <div className="flex-1 flex flex-col m-4 ml-2">
//         <Card className="mb-4 shadow-lg">
//           <CardContent className="p-3 flex justify-between items-center">
//             <h2 className="text-lg font-semibold text-gray-700">Editor</h2>
//             {/* --- NEW: Contextual Editing Toolbar --- */}
//             {selectedObject && (
//                 <div className="flex items-center gap-2">
//                     {/* Color controls for shapes */}
//                     {['rect', 'circle', 'triangle', 'ellipse', 'group'].includes(selectedObject.type || '') && (
//                         <>
//                             <input type="color" className="w-8 h-8" onChange={(e) => updateObjectColor(e.target.value)} />
//                             <div className="flex gap-1">
//                                 {colorPalette.map(color => (
//                                     <button key={color} onClick={() => updateObjectColor(color)} className="w-5 h-5 rounded-full border" style={{ backgroundColor: color }} />
//                                 ))}
//                             </div>
//                             <Button size="sm" variant="outline" onClick={addTextToShape}>Add Text</Button>
//                         </>
//                     )}
//                     {/* Text controls */}
//                     {(selectedObject.type === 'i-text' || selectedObject.type === 'group') && (
//                         <>
//                             <select onChange={(e) => updateTextProperty('fontFamily', e.target.value)} className="p-1 border rounded">
//                                 {fonts.map(font => <option key={font} value={font}>{font}</option>)}
//                             </select>
//                             <Button onClick={() => toggleTextStyle('fontWeight')} variant="outline" size="icon" className="w-8 h-8"><Bold className="w-4 h-4" /></Button>
//                             <Button onClick={() => toggleTextStyle('underline')} variant="outline" size="icon" className="w-8 h-8"><Underline className="w-4 h-4" /></Button>
//                         </>
//                     )}
//                 </div>
//             )}
//             <div className="space-x-2">
//               <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
//                 <Save className="w-4 h-4 mr-2" /> Save
//               </Button>
//               <Button onClick={handleExport} variant="outline" className="text-gray-600 hover:bg-gray-100">
//                 <Download className="w-4 h-4 mr-2" /> Export
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-lg">
//           <canvas ref={canvasRef} className="border border-gray-300 rounded-md" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CanvasEditor;

import React, { FC, useEffect, useRef, useState, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // <-- Import Input
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // <-- Import Dialog components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Square,
  Circle as CircleIcon,
  Type,
  Image as ImageIcon,
  Save,
  Download,
  Shapes,
  Bold,
  Underline,
} from "lucide-react";
import toast from "react-hot-toast";
import * as fabric from "fabric";

// Helper functions (unchanged)
const getTextFromGroup = (group: fabric.Group): fabric.IText | undefined => {
  return group.getObjects().find((o) => o.type === "i-text") as fabric.IText;
};
const getShapeFromGroup = (group: fabric.Group): fabric.Object | undefined => {
  return group.getObjects().find((o) => o.type !== "i-text");
};

// Interfaces (unchanged)
interface Design {
  _id?: string;
  title: string;
  jsonData: any;
  s3Url: string;
}
interface AuthContextType {
  addDesign: (newDesign: Design) => void;
  updateDesign: (id: string, updatedDesignData: Partial<Design>) => void;
  getDesignById: (id: string) => Design | undefined;
  authUser?: any;
}

export const CanvasEditor: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  
  // --- NEW: State for the custom save dialog ---
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");


  const { designId } = useParams<{ designId?: string }>();
  const navigate = useNavigate(); // Re-enabled for saving
  const { addDesign, updateDesign, getDesignById } = useAuth() as AuthContextType;

  // All useEffect, addShape, addText, etc. functions remain unchanged...
    // Initialize Fabric canvas and load design if any
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });
    setFabricCanvas(canvas);

    const updateSelection = (e: fabric.IEvent) => {
        setSelectedObject(e.selected ? e.selected[0] : null);
    };
    const clearSelection = () => {
        setSelectedObject(null);
    }
    
    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", clearSelection);


    const loadDesign = async () => {
      if (!designId) return;
      let existingDesign = getDesignById(designId);
      if (!existingDesign) {
        try {
          const token = JSON.parse(localStorage.getItem("chat-user") || "{}").token;
          if (!token) throw new Error("Not authorized");
          const res = await fetch(`http://localhost:5000/api/designs/${designId}`,{ headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            existingDesign = await res.json();
            if ("design" in existingDesign) existingDesign = (existingDesign as any).design;
          } else { console.warn("Failed to fetch design from server"); }
        } catch (err) { console.error("Error fetching design:", err); }
      }
      if (existingDesign?.jsonData) {
        const parsed = typeof existingDesign.jsonData === "string" ? JSON.parse(existingDesign.jsonData) : existingDesign.jsonData;
        canvas.loadFromJSON(parsed, () => {
          canvas.renderAll();
          canvas.requestRenderAll();
        });
      } else { toast("No design data found to load."); }
    };
    loadDesign();
    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared", clearSelection);
      if (canvas && typeof canvas.dispose === "function") canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designId, getDesignById]);

  const addShape = (shapeType: string) => {
    if (!fabricCanvas) return;
    let shape: fabric.Object | null = null;
    const commonProps = { left: 100, top: 100, fill: "#8B5CF6", cornerColor: "blue", cornerSize: 8 };
    switch (shapeType) {
        case "rectangle": shape = new fabric.Rect({ ...commonProps, width: 100, height: 100 }); break;
        case "circle": shape = new fabric.Circle({ ...commonProps, radius: 50 }); break;
        case "triangle": shape = new fabric.Triangle({ ...commonProps, width: 100, height: 100 }); break;
        case "ellipse": shape = new fabric.Ellipse({ ...commonProps, rx: 75, ry: 50 }); break;
        default: break;
    }
    if (shape) { fabricCanvas.add(shape); fabricCanvas.setActiveObject(shape); fabricCanvas.renderAll(); }
  };
  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText("Type here...", { left: 100, top: 100, fill: "#000000", fontSize: 32, fontFamily: "Inter", cornerColor: "blue", cornerSize: 8 });
    fabricCanvas.add(text); fabricCanvas.setActiveObject(text); fabricCanvas.renderAll();
  };
  const addTextToShape = () => {
    if (!fabricCanvas || !selectedObject || !['rect', 'circle', 'triangle', 'ellipse'].includes(selectedObject.type || '')) return;
    const shape = selectedObject as fabric.Object;
    const text = new fabric.IText("Text", { fontSize: 20, fill: '#FFFFFF', originX: 'center', originY: 'center', top: shape.top, left: shape.left, textAlign: 'center' });
    const group = new fabric.Group([shape, text], { left: shape.left, top: shape.top });
    fabricCanvas.remove(shape); fabricCanvas.add(group); fabricCanvas.setActiveObject(group); fabricCanvas.renderAll();
  };
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !fabricCanvas) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgData = event.target?.result as string; if (!imgData) return;
      const imgElement = new Image(); imgElement.src = imgData;
      imgElement.onload = () => {
        const fabricImg = new fabric.Image(imgElement, { left: 100, top: 100, scaleX: Math.min(1, 200 / imgElement.width), scaleY: Math.min(1, 200 / imgElement.height), cornerColor: "blue", cornerSize: 8 });
        fabricCanvas.add(fabricImg); fabricCanvas.centerObject(fabricImg); fabricCanvas.setActiveObject(fabricImg); fabricCanvas.renderAll();
      };
    };
    reader.readAsDataURL(file); e.target.value = "";
  };
  const updateObjectColor = (color: string) => {
    if (!fabricCanvas || !selectedObject) return;
    if (selectedObject.type === 'group') {
      const shape = getShapeFromGroup(selectedObject as fabric.Group); shape?.set('fill', color);
    } else { selectedObject.set("fill", color); }
    fabricCanvas.renderAll();
  };
  const updateTextProperty = (prop: keyof fabric.IText, value: any) => {
    if (!fabricCanvas || !selectedObject) return;
    let textObject: fabric.IText | undefined;
    if (selectedObject.type === 'i-text') textObject = selectedObject as fabric.IText;
    else if (selectedObject.type === 'group') textObject = getTextFromGroup(selectedObject as fabric.Group);
    if (textObject) { textObject.set(prop, value); fabricCanvas.renderAll(); }
  };
  const toggleTextStyle = (style: 'fontWeight' | 'underline') => {
    if (!fabricCanvas || !selectedObject) return;
    let textObject: fabric.IText | undefined;
    if (selectedObject.type === 'i-text') textObject = selectedObject as fabric.IText;
    else if (selectedObject.type === 'group') textObject = getTextFromGroup(selectedObject as fabric.Group);
    if (textObject) {
      if (style === 'fontWeight') textObject.set('fontWeight', textObject.get('fontWeight') === 'bold' ? 'normal' : 'bold');
      if (style === 'underline') textObject.set('underline', !textObject.get('underline'));
      fabricCanvas.renderAll();
    }
  };

  // --- MODIFIED: This function now executes the save after the user confirms in the dialog ---
  const handleSaveConfirm = async () => {
    if (!fabricCanvas || !designName) {
        toast.error("Design name cannot be empty.");
        return;
    };

    const canvasJSON = fabricCanvas.toJSON();
    const fullImage = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
    const token = JSON.parse(localStorage.getItem("chat-user") || "{}").token;
    if (!token) { toast.error("Not authorized"); return; }
    
    try {
      let res;
      if (designId) {
        res = await fetch(`http://localhost:5000/api/designs/${designId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: designName, image: fullImage, data: canvasJSON }),
        });
      } else {
        res = await fetch("http://localhost:5000/api/designs/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: designName, image: fullImage, data: canvasJSON }),
        });
      }
      if (!res.ok) throw new Error("Save failed");
      const resJson = await res.json();
      const returnedDesign = resJson.design || resJson;
      if (designId) {
        updateDesign(designId, { title: designName, jsonData: canvasJSON, s3Url: returnedDesign.s3Url });
        toast.success("Design updated successfully!");
      } else {
        const newDesign: Design = { _id: returnedDesign._id, title: designName, jsonData: canvasJSON, s3Url: returnedDesign.s3Url };
        addDesign(newDesign);
        toast.success("Design saved successfully!");
      }
      setIsSaveDialogOpen(false); // Close dialog on success
      navigate("/dashboard"); // <-- NAVIGATION IS RESTORED
    } catch (err: any) {
      toast.error(err.message || "Failed to save design");
    }
  };
  
  const handleExport = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
    const link = document.createElement("a");
    link.download = `matty-design-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    toast.success("Design exported as PNG!");
  };

  // --- NEW: This function opens the dialog and sets the initial design name ---
  const onSaveClick = () => {
      const currentTitle = designId ? getDesignById(designId)?.title : "Untitled Design";
      setDesignName(currentTitle || "Untitled Design");
      setIsSaveDialogOpen(true);
  }

  const fonts = ["Inter", "Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana"];
  const colorPalette = ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E", "#14B8A6", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899"];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Toolbar (unchanged) */}
      <Card className="w-24 m-4 mr-2 shadow-lg flex-shrink-0">
        <CardContent className="p-2 space-y-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild><Button title="Shapes" variant="ghost" size="icon" className="w-full h-12 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"><Shapes /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addShape("rectangle")}>Rectangle</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addShape("circle")}>Circle</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addShape("triangle")}>Triangle</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addShape("ellipse")}>Ellipse</DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
          <Button title="Text" onClick={addText} variant="ghost" size="icon" className="w-full h-12 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600" ><Type /></Button>
          <Button title="Image" onClick={() => imageInputRef.current?.click()} variant="ghost" size="icon" className="w-full h-12 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600" ><ImageIcon /></Button>
          <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </CardContent>
      </Card>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col m-4 ml-2">
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Editor</h2>
            {selectedObject && (
                <div className="flex items-center gap-2">
                    {['rect', 'circle', 'triangle', 'ellipse', 'group'].includes(selectedObject.type || '') && (
                        <>
                            <label title="Shape Color"><input type="color" className="w-8 h-8" onChange={(e) => updateObjectColor(e.target.value)} /></label>
                            <div className="flex gap-1">{colorPalette.map(color => (<button key={color} onClick={() => updateObjectColor(color)} className="w-5 h-5 rounded-full border" style={{ backgroundColor: color }} />))}</div>
                           {selectedObject.type !== 'group' && <Button size="sm" variant="outline" onClick={addTextToShape}>Add Text</Button>}
                        </>
                    )}
                    {(selectedObject.type === 'i-text' || selectedObject.type === 'group') && (
                        <>
                            <label title="Text Color"><input type="color" className="w-8 h-8" onChange={(e) => updateTextProperty('fill', e.target.value)} /></label>
                            <select onChange={(e) => updateTextProperty('fontFamily', e.target.value)} className="p-1 border rounded">{fonts.map(font => <option key={font} value={font}>{font}</option>)}</select>
                            <Button onClick={() => toggleTextStyle('fontWeight')} variant="outline" size="icon" className="w-8 h-8"><Bold className="w-4 h-4" /></Button>
                            <Button onClick={() => toggleTextStyle('underline')} variant="outline" size="icon" className="w-8 h-8"><Underline className="w-4 h-4" /></Button>
                        </>
                    )}
                </div>
            )}
            <div className="space-x-2">
                {/* --- MODIFIED: Save button now opens the dialog --- */}
                <Button onClick={onSaveClick} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" /> Save
                </Button>
              <Button onClick={handleExport} variant="outline" className="text-gray-600 hover:bg-gray-100">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-lg">
          <canvas ref={canvasRef} className="border border-gray-300 rounded-md" />
        </div>
      </div>

       {/* --- NEW: The Save Dialog component --- */}
       <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Your Design</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <label htmlFor="design-name" className="text-sm font-medium">Design Name</label>
                    <Input
                        id="design-name"
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                        className="mt-2"
                        placeholder="Enter a name..."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white">Confirm Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default CanvasEditor;