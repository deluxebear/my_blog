// Browser-compatible image compression using WebAssembly modules
// This is a simplified version inspired by Squoosh

class SquooshCompressor {
  constructor() {
    this.wasmModules = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // For now, we'll implement compression using Canvas API
    // In a production environment, you would load the actual Squoosh WASM modules
    this.initialized = true;
  }

  async loadImage(buffer) {
    // In worker context, we need to use different approach
    const blob = new Blob([buffer]);
    const imageBitmap = await createImageBitmap(blob);
    return imageBitmap;
  }

  async compressWithMozJPEG(imageData, options = {}) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    
    // Put image data on canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Convert to JPEG with quality setting
    const quality = (options.quality || 80) / 100;
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality
    });
    
    return {
      binary: await blob.arrayBuffer(),
      extension: 'jpg'
    };
  }

  async compressWithWebP(imageData, options = {}) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    const quality = (options.quality || 80) / 100;
    const blob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: quality
    });
    
    return {
      binary: await blob.arrayBuffer(),
      extension: 'webp'
    };
  }

  async compressWithAVIF(imageData, options = {}) {
    // AVIF support is limited, fallback to WebP
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    try {
      const quality = (options.quality || 80) / 100;
      const blob = await canvas.convertToBlob({
        type: 'image/avif',
        quality: quality
      });
      
      return {
        binary: await blob.arrayBuffer(),
        extension: 'avif'
      };
    } catch (e) {
      // Fallback to WebP if AVIF is not supported
      return this.compressWithWebP(imageData, options);
    }
  }

  async compressWithPNG(imageData, options = {}) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    const blob = await canvas.convertToBlob({
      type: 'image/png'
    });
    
    return {
      binary: await blob.arrayBuffer(),
      extension: 'png'
    };
  }

  async resize(imageData, width, height, method = 'lanczos') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Create temporary canvas with original image
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // Set image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw resized image
    ctx.drawImage(tempCanvas, 0, 0, width, height);
    
    return ctx.getImageData(0, 0, width, height);
  }

  getImageData(imageBitmap) {
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);
    return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
  }
}

// Export for use in worker
if (typeof self !== 'undefined') {
  self.SquooshCompressor = SquooshCompressor;
}