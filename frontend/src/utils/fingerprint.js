export const getDeviceFingerprint = () => {
  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const userAgent = navigator.userAgent || "";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const language = navigator.language || "";

    // Canvas fingerprinting
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("EduAI, <canvas> 1.0", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("EduAI, <canvas> 1.0", 4, 17);
    }
    const canvasHash = canvas.toDataURL();

    // Simple hash function for string
    let hash = 0;
    const combinedString = `${screenInfo}_${userAgent}_${timezone}_${language}_${canvasHash}`;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return `df-${Math.abs(hash)}`;
  } catch (err) {
    console.error("Failed to generate device fingerprint:", err);
    return "df-fallback-unknown";
  }
};
