import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Browser Compatibility: crypto.randomUUID polyfill (important for non-secure contexts or older browsers)
if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
    (window.crypto as any).randomUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
} else if (typeof window !== 'undefined' && !window.crypto) {
    (window as any).crypto = {
        randomUUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };
}

createRoot(document.getElementById("root")!).render(<App />);
