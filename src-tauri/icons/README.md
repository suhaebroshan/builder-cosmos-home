# NYX OS Icons

This directory should contain the following icon files for the Tauri app:

- `32x32.png` - 32x32 pixel icon
- `128x128.png` - 128x128 pixel icon  
- `128x128@2x.png` - 256x256 pixel icon (retina)
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file

For now, Tauri will use default icons. You can replace these with custom NYX OS icons later.

## Creating Icons

You can use the Tauri icon generator to create all required formats from a single 1024x1024 PNG:

```bash
npm install --save-dev @tauri-apps/icon
npx icon generate --input icon-1024.png --output src-tauri/icons/
```
