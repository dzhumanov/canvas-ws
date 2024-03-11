import { useState, useEffect, useRef } from "react";
import { Pixel } from "./types";

function App() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const isDrawing = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/canvas");

    ws.current.onopen = () => {
      console.log("Connected to canvas server");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_DATA") {
        setPixels(data.payload);
      } else if (data.type === "CURRENT") {
        setPixels(data.payload);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleDraw = (newPixels: Pixel[]) => {
    if (!ws.current) return;
    const action = { type: "DRAW", payload: newPixels };
    ws.current.send(JSON.stringify(action));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      isDrawing.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setPixels([...pixels, { x, y }]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setPixels([...pixels, { x, y }]);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    handleDraw(pixels);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pixels.forEach((pixel) => {
          ctx.fillRect(pixel.x, pixel.y, 10, 10);
        });
      }
    }
  }, [pixels]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="paint"
        width="1000"
        height="800"
        style={{ border: "1px solid black" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </>
  );
}

export default App;
