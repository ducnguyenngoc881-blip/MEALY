import fs from 'fs';
import path from 'path';

const screenshotPath = 'd:/New folder/Remotion/screenshots/gvos_iphone_screen.png';
const imageBuffer = fs.readFileSync(screenshotPath);
const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

function generateHtml(bgColor = '#FF007F', hasOuterShadow = false) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>iPhone Mockup for Photoshop Cutout</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${bgColor};
      padding: 60px 40px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
    }
    
    .stage {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* iPhone 16 Pro Frame - Clean Crisp Edges for 1-Click PTS Cutout */
    .iphone-case {
      position: relative;
      width: 430px;
      height: 890px;
      background: linear-gradient(135deg, #3d3b38 0%, #1f1e1d 40%, #2f2d2b 70%, #181716 100%);
      border-radius: 60px;
      padding: 14px;
      box-shadow: ${hasOuterShadow ? '0 40px 100px -20px rgba(0, 0, 0, 0.8), 0 20px 40px -15px rgba(0, 0, 0, 0.6),' : ''}
        inset 0 0 4px 2px rgba(255, 255, 255, 0.25),
        inset 0 0 0 1px rgba(0, 0, 0, 0.9);
    }

    /* Side Buttons */
    .btn {
      position: absolute;
      background: #2b2927;
      border-radius: 3px;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0,0,0,0.6);
    }
    /* Action Button (left top) */
    .btn-action {
      left: -4px;
      top: 145px;
      width: 4px;
      height: 32px;
    }
    /* Volume Up */
    .btn-vol-up {
      left: -4px;
      top: 195px;
      width: 4px;
      height: 58px;
    }
    /* Volume Down */
    .btn-vol-down {
      left: -4px;
      top: 268px;
      width: 4px;
      height: 58px;
    }
    /* Power Button (right) */
    .btn-power {
      right: -4px;
      top: 200px;
      width: 4px;
      height: 90px;
    }

    /* Inner Bezel */
    .iphone-bezel {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
      border-radius: 48px;
      overflow: hidden;
      box-shadow: 0 0 0 4px #0a0a0a, inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    /* Screen Image */
    .iphone-screen {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 48px;
    }

    /* Dynamic Island */
    .dynamic-island {
      position: absolute;
      top: 11px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 35px;
      background: #000;
      border-radius: 20px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .camera-lens {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #1c2742 0%, #0d121c 60%, #000000 100%);
      box-shadow: inset 0 0 1px 1px rgba(60, 100, 180, 0.4);
    }

    /* Home Indicator */
    .home-indicator {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 135px;
      height: 5px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 100px;
      z-index: 50;
    }

    /* Subtle Glass Glare / Sheen */
    .glass-sheen {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        125deg,
        rgba(255, 255, 255, 0.12) 0%,
        rgba(255, 255, 255, 0.04) 25%,
        transparent 50%,
        transparent 100%
      );
      pointer-events: none;
      border-radius: 48px;
      z-index: 40;
    }
  </style>
</head>
<body>
  <div class="stage" id="mockup-stage">
    <div class="iphone-case">
      <div class="btn btn-action"></div>
      <div class="btn btn-vol-up"></div>
      <div class="btn btn-vol-down"></div>
      <div class="btn btn-power"></div>
      
      <div class="iphone-bezel">
        <div class="dynamic-island">
          <div class="camera-lens"></div>
        </div>
        <img class="iphone-screen" src="${base64Image}" alt="GVOS Screen" />
        <div class="glass-sheen"></div>
        <div class="home-indicator"></div>
      </div>
    </div>
  </div>
  <script>
    const params = new URLSearchParams(window.location.search);
    const bg = params.get('bg');
    if (bg) {
      document.body.style.background = bg.startsWith('#') ? bg : '#' + bg;
    }
  </script>
</body>
</html>
`;
}

// Generate the primary High-Contrast Magenta HTML file
fs.writeFileSync('d:/New folder/Remotion/screenshots/iphone_mockup_magenta.html', generateHtml('#FF007F', false), 'utf8');
console.log('Generated iphone_mockup_magenta.html (#FF007F)');

// Also generate Chroma Green HTML file
fs.writeFileSync('d:/New folder/Remotion/screenshots/iphone_mockup_green.html', generateHtml('#00FF00', false), 'utf8');
console.log('Generated iphone_mockup_green.html (#00FF00)');
