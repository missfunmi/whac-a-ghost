// deno-lint-ignore-file no-explicit-any
import p5 from "p5";
import { loadGame } from "./game.ts";
type SketchType = "default";

function main(rootElement: HTMLElement) {
  const canvasContainer = document.createElement("div");
  canvasContainer.className = "canvas-container";
  rootElement.appendChild(canvasContainer);

  new p5(loadGame(), canvasContainer);

  setTimeout(() => {
    const canvas = document.querySelector(".p5Canvas");
    if (canvas) {
      (canvas as any).style.margin = "0 auto";
      (canvas as any).style.display = "block";
    }
  }, 100);
}

const rootElement = document.getElementById("p5-root");
if (!rootElement) {
  throw new Error("Cannot find element root #p5-root");
}
main(rootElement);
