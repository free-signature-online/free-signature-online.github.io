import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, Undo2, Trash2, Download, ChevronDown, FolderHeart } from 'lucide-react';

export default function SignatureTool() {
  const [activeTab, setActiveTab] = useState('draw');
  
  // Draw state
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pathRef = useRef({ points: [], lastPoint: null });
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(3);
  const [history, setHistory] = useState([]);
  
  // Type state
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');
  const [showMoreFonts, setShowMoreFonts] = useState(false);
  
  const initialFonts = ['Dancing Script', 'Pacifico', 'Caveat', 'Great Vibes'];
  const moreFonts = ['Satisfy', 'Homemade Apple', 'Yellowtail', 'Sacramento', 'Allura', 'Parisienne'];
  const displayedFonts = showMoreFonts ? [...initialFonts, ...moreFonts] : initialFonts;

  // Saved Signatures state
  const [savedSignatures, setSavedSignatures] = useState([]);

  // Load saved signatures on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedSignatures');
    if (saved) {
      try {
        setSavedSignatures(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved signatures");
      }
    }
  }, []);

  // Initialize Canvas
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const ctx = canvas.getContext('2d');
      
      // Handle resizing for high DPI displays
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        // Prevent clearing if we're just resizing vertically (e.g. mobile keyboard) unless it's a significant change
        if (canvas.width !== rect.width * 2 || canvas.height !== rect.height * 2) {
            canvas.width = rect.width * 2;
            canvas.height = rect.height * 2;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(2, 2);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Restore history after resize if any
            if (history.length > 0) {
              const img = new Image();
              img.src = history[history.length - 1];
              img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
            }
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Prevent scrolling when touching the canvas
      const preventScroll = (e) => {
        if (e.target === canvas) {
          e.preventDefault();
        }
      };
      
      document.body.addEventListener('touchstart', preventScroll, { passive: false });
      document.body.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        document.body.removeEventListener('touchstart', preventScroll);
        document.body.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [activeTab]); // Removed history from dependency to avoid infinite loops on resize

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Save current state for undo
    setHistory([...history, canvas.toDataURL()]);

    const pos = getPointerPos(e, canvas);
    pathRef.current = { points: [pos], lastPoint: pos };
    
    // Draw a single dot for a click/tap
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(pos.x, pos.y, thickness / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPointerPos(e, canvas);
    
    const { points, lastPoint } = pathRef.current;
    points.push(pos);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Use quadratic curves for smooth lines instead of straight lineTo
    if (points.length >= 3) {
      const lastTwoPoints = points.slice(-2);
      const controlPoint = lastTwoPoints[0];
      const endPoint = {
        x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
        y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
      };
      
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
      ctx.stroke();
      
      pathRef.current.lastPoint = endPoint;
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      pathRef.current.lastPoint = pos;
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const getPointerPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const undoLastPath = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const previousState = history[history.length - 1];
    
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // We scale back down for the drawImage because our context is already scaled
      ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
    
    setHistory(history.slice(0, -1));
  };

  const downloadSignature = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // For drawing, we want to export the actual canvas data
      triggerDownload(canvas.toDataURL('image/png'), 'my-signature.png');
    } else {
      // For typed signature, create an off-screen canvas to render the text
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 300;
      const ctx = tempCanvas.getContext('2d');
      
      // Set background (optional, usually want transparent)
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw text
      ctx.font = `80px "${selectedFont}"`;
      ctx.fillStyle = '#000000'; // Always black for typed download by default, or could use state color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName || 'Signature', tempCanvas.width / 2, tempCanvas.height / 2);
      
      triggerDownload(tempCanvas.toDataURL('image/png'), 'typed-signature.png');
    }
  };

  const triggerDownload = (dataUrl, filename) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saveSignature = () => {
    let dataUrl = '';
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL('image/png');
    } else {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 300;
      const ctx = tempCanvas.getContext('2d');
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.font = `80px "${selectedFont}"`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName || 'Signature', tempCanvas.width / 2, tempCanvas.height / 2);
      dataUrl = tempCanvas.toDataURL('image/png');
    }
    
    const newSaved = [{ id: Date.now(), dataUrl }, ...savedSignatures];
    setSavedSignatures(newSaved);
    localStorage.setItem('savedSignatures', JSON.stringify(newSaved));
  };

  const deleteSavedSignature = (id) => {
    const newSaved = savedSignatures.filter(sig => sig.id !== id);
    setSavedSignatures(newSaved);
    localStorage.setItem('savedSignatures', JSON.stringify(newSaved));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6 sm:mb-8 w-full">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 sm:flex-none flex justify-center items-center px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              activeTab === 'draw'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PenTool className="w-4 h-4 sm:mr-2 mr-1.5" />
            <span>Draw</span><span className="hidden sm:inline">&nbsp;Signature</span>
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex-1 sm:flex-none flex justify-center items-center px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              activeTab === 'type'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Type className="w-4 h-4 sm:mr-2 mr-1.5" />
            <span>Type</span><span className="hidden sm:inline">&nbsp;Signature</span>
          </button>
        </div>
      </div>

      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all">
        
        {/* Draw Mode */}
        {activeTab === 'draw' && (
          <div className="flex flex-col">
            <div 
              ref={containerRef}
              className="w-full h-[250px] sm:h-[300px] md:h-[400px] bg-slate-50 relative cursor-crosshair border-b border-slate-200"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full touch-none block"
                aria-label="Signature drawing area"
              >
                Your browser does not support the HTML canvas tag. Please use the "Type Signature" option instead.
              </canvas>
              {history.length === 0 && !isDrawing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-slate-300 font-medium text-xl select-none">Sign here</span>
                </div>
              )}
            </div>
            
            {/* Toolbar */}
            <div className="bg-white p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setColor('#000000')} className={`w-6 h-6 rounded-full bg-black ring-2 ring-offset-2 transition-all ${color === '#000000' ? 'ring-slate-400' : 'ring-transparent hover:scale-110'}`} aria-label="Black"></button>
                  <button onClick={() => setColor('#2563eb')} className={`w-6 h-6 rounded-full bg-blue-600 ring-2 ring-offset-2 transition-all ${color === '#2563eb' ? 'ring-blue-400' : 'ring-transparent hover:scale-110'}`} aria-label="Blue"></button>
                  <button onClick={() => setColor('#dc2626')} className={`w-6 h-6 rounded-full bg-red-600 ring-2 ring-offset-2 transition-all ${color === '#dc2626' ? 'ring-red-400' : 'ring-transparent hover:scale-110'}`} aria-label="Red"></button>
                  <label className="relative overflow-hidden w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-2 ring-transparent focus-within:ring-slate-400 ml-1" aria-label="Custom Color Picker">
                    <span className="sr-only">Choose custom color</span>
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-10 h-10 p-0 cursor-pointer"
                      aria-label="Color picker input"
                    />
                  </label>
                </div>
                
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                
                {/* Thickness */}
                <div className="flex items-center gap-1">
                  <button onClick={() => setThickness(2)} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${thickness === 2 ? 'bg-slate-100' : 'hover:bg-slate-50'}`} aria-label="Thin">
                    <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                  </button>
                  <button onClick={() => setThickness(4)} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${thickness === 4 ? 'bg-slate-100' : 'hover:bg-slate-50'}`} aria-label="Medium">
                    <div className="w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
                  </button>
                  <button onClick={() => setThickness(6)} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${thickness === 6 ? 'bg-slate-100' : 'hover:bg-slate-50'}`} aria-label="Thick">
                    <div className="w-4 h-4 bg-slate-700 rounded-full"></div>
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <button 
                  onClick={undoLastPath} 
                  disabled={history.length === 0} 
                  className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 sm:border-transparent"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Undo</span>
                </button>
                <button 
                  onClick={clearCanvas} 
                  className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 sm:border-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Type Mode */}
        {activeTab === 'type' && (
          <div className="flex flex-col p-6 sm:p-8 bg-slate-50/50">
            <div className="mb-8 max-w-md mx-auto w-full">
              <label htmlFor="name-input" className="block text-sm font-semibold text-slate-700 mb-2 text-center">Enter your name</label>
              <input
                id="name-input"
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-lg shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedFonts.map((font) => (
                <button
                  key={font}
                  onClick={() => setSelectedFont(font)}
                  className={`relative p-6 sm:p-8 rounded-xl text-center transition-all group overflow-hidden ${
                    selectedFont === font
                      ? 'border-2 border-indigo-600 bg-indigo-50/50 shadow-md'
                      : 'border-2 border-slate-100 hover:border-indigo-200 hover:shadow-sm bg-white'
                  }`}
                >
                  {selectedFont === font && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-600 rounded-full shadow-sm"></div>
                  )}
                  <div 
                    style={{ fontFamily: font }} 
                    className="text-4xl sm:text-5xl text-slate-800 break-words px-2 leading-tight py-2"
                  >
                    {typedName || 'Signature'}
                  </div>
                  <div className="mt-4 text-xs text-slate-400 font-sans tracking-wide uppercase font-medium">{font}</div>
                </button>
              ))}
            </div>
            
            {!showMoreFonts && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowMoreFonts(true)}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
                  Load 6 more premium fonts
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Download CTA */}
      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={downloadSignature}
          className="group relative flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto justify-center"
        >
          <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
          Download Signature
        </button>
        <button
          onClick={saveSignature}
          className="group relative flex items-center px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto justify-center"
        >
          <FolderHeart className="w-5 h-5 mr-3 text-indigo-500 group-hover:scale-110 transition-transform" />
          Save to Browser
        </button>
      </div>

      {/* Saved Signatures Section */}
      {savedSignatures.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">My Saved Signatures</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedSignatures.map((sig) => (
              <div key={sig.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative group flex flex-col items-center hover:shadow-md transition-shadow">
                <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-4 relative overflow-hidden">
                  {/* Checkerboard background pattern for transparency */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px' }}></div>
                  <img src={sig.dataUrl} alt="Saved Signature" className="max-h-full max-w-full object-contain relative z-10" />
                </div>
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => triggerDownload(sig.dataUrl, `signature-${sig.id}.png`)}
                    className="flex-1 flex justify-center items-center py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </button>
                  <button 
                    onClick={() => deleteSavedSignature(sig.id)}
                    className="flex-none p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete saved signature"
                    aria-label="Delete saved signature"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
