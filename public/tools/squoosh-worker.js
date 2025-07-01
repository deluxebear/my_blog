// Advanced Image Compression Worker inspired by Squoosh
// Using browser-compatible compression methods with enhanced options

importScripts('./squoosh-browser.js');

let compressor = null;
const initialized = { value: false };

// Available encoders with advanced options
const ENCODERS = {
  mozjpeg: {
    name: 'MozJPEG',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    supportsQuality: true,
    options: {
      quality: 80,
      progressive: true,
      optimize: true,
      smoothing: 0,
      baseline: false
    }
  },
  webp: {
    name: 'WebP',
    extension: 'webp',
    mimeType: 'image/webp',
    supportsQuality: true,
    options: {
      quality: 80,
      method: 4,
      lossless: false,
      nearLossless: 100,
      autoFilter: false,
      filterStrength: 60,
      filterSharpness: 0
    }
  },
  avif: {
    name: 'AVIF',
    extension: 'avif',
    mimeType: 'image/avif',
    supportsQuality: true,
    options: {
      quality: 50,
      speed: 6,
      chromaSubsampling: 1
    }
  },
  png: {
    name: 'PNG',
    extension: 'png',
    mimeType: 'image/png',
    supportsQuality: false,
    options: {
      compressionLevel: 6,
      interlaced: false
    }
  }
};

self.onmessage = async function(e) {
  const { type, data, id } = e.data;
  
  try {
    switch (type) {
      case 'init':
        await initCompressor();
        self.postMessage({ type: 'ready', id });
        break;
        
      case 'compress':
        await compressImage(data, id);
        break;
        
      case 'getEncoders':
        self.postMessage({
          type: 'encoders',
          data: ENCODERS,
          id
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      id
    });
  }
};

async function initCompressor() {
  if (initialized.value) return;
  
  compressor = new SquooshCompressor();
  await compressor.init();
  initialized.value = true;
}

async function compressImage(data, messageId) {
  const { imageBuffer, options } = data;
  
  try {
    if (!initialized.value) {
      await initCompressor();
    }
    
    self.postMessage({
      type: 'progress',
      stage: 'loading',
      progress: 10,
      id: messageId
    });
    
    // Load the image
    const imageBitmap = await compressor.loadImage(imageBuffer);
    const imageData = compressor.getImageData(imageBitmap);
    
    const originalInfo = {
      width: imageBitmap.width,
      height: imageBitmap.height,
      size: imageBuffer.byteLength
    };
    
    self.postMessage({
      type: 'progress',
      stage: 'preprocessing',
      progress: 25,
      id: messageId
    });
    
    let processedImageData = imageData;
    
    // Apply resize if needed
    if (options.resize && (options.resize.width || options.resize.height)) {
      const targetWidth = options.resize.width || Math.round(imageBitmap.width * (options.resize.height / imageBitmap.height));
      const targetHeight = options.resize.height || Math.round(imageBitmap.height * (options.resize.width / imageBitmap.width));
      
      processedImageData = await compressor.resize(
        imageData, 
        targetWidth, 
        targetHeight, 
        options.resize.method
      );
    }
    
    self.postMessage({
      type: 'progress',
      stage: 'encoding',
      progress: 50,
      id: messageId
    });
    
    // Compress with the specified encoder
    const { encoder, encoderOptions } = options;
    
    if (!ENCODERS[encoder]) {
      throw new Error(`Unsupported encoder: ${encoder}`);
    }
    
    // Merge encoder options
    const finalOptions = {
      ...ENCODERS[encoder].options,
      ...encoderOptions
    };
    
    let result;
    switch (encoder) {
      case 'mozjpeg':
        result = await compressor.compressWithMozJPEG(processedImageData, finalOptions);
        break;
      case 'webp':
        result = await compressor.compressWithWebP(processedImageData, finalOptions);
        break;
      case 'avif':
        result = await compressor.compressWithAVIF(processedImageData, finalOptions);
        break;
      case 'png':
        result = await compressor.compressWithPNG(processedImageData, finalOptions);
        break;
      default:
        throw new Error(`Encoder ${encoder} not implemented`);
    }
    
    self.postMessage({
      type: 'progress',
      stage: 'finalizing',
      progress: 90,
      id: messageId
    });
    
    // Prepare final info
    const finalInfo = {
      width: processedImageData.width,
      height: processedImageData.height,
      size: result.binary.byteLength,
      format: encoder,
      extension: result.extension
    };
    
    self.postMessage({
      type: 'progress',
      stage: 'complete',
      progress: 100,
      id: messageId
    });
    
    // Send the result
    self.postMessage({
      type: 'compressed',
      data: {
        compressed: result.binary,
        originalInfo,
        finalInfo,
        extension: result.extension
      },
      id: messageId
    });
    
  } catch (error) {
    console.error('Compression error:', error);
    self.postMessage({
      type: 'error',
      error: error.message,
      id: messageId
    });
  }
}

// Handle worker cleanup
self.addEventListener('beforeunload', () => {
  if (compressor) {
    // Cleanup if needed
  }
});