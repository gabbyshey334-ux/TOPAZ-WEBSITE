#!/usr/bin/env node

/**
 * TOPAZ Website Media Downloader
 * Downloads images and videos from Wix to local public folder
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  imagesJsonPath: path.join(__dirname, '..', 'topaz-images.json'),
  publicDir: path.join(__dirname, '..', 'public'),
  imagesDir: path.join(__dirname, '..', 'public', 'images'),
  videosDir: path.join(__dirname, '..', 'public', 'videos'),
  manifestPath: path.join(__dirname, '..', 'public', 'images', 'manifest.json'),
  errorLogPath: path.join(__dirname, '..', 'download-errors.log'),
  maxRetries: 3,
  timeout: 30000,
  concurrency: 3
};

// Image data from the provided JSON
const IMAGES_DATA = [
  {
    "index": 1,
    "src": "https://static.wixstatic.com/media/187f75_a536ad47a98747f99ccec44e0e0b3d6f~mv2.jpg/v1/fill/w_320,h_238,q_90,enc_avif,quality_auto/187f75_a536ad47a98747f99ccec44e0e0b3d6f~mv2.jpg",
    "alt": "Gallery Image 1",
    "category": "gallery",
    "filename": "topaz-import-gallery-01.jpg"
  },
  {
    "index": 2,
    "src": "https://static.wixstatic.com/media/187f75_2240f8ab41234ff49258d404bb6bc179~mv2.jpg/v1/fill/w_320,h_215,q_90,enc_avif,quality_auto/187f75_2240f8ab41234ff49258d404bb6bc179~mv2.jpg",
    "alt": "Gallery Image 2",
    "category": "gallery",
    "filename": "topaz-import-gallery-02.jpg"
  },
  {
    "index": 3,
    "src": "https://static.wixstatic.com/media/187f75_c8e05c66becf4997bcd14bffdadcca85~mv2.jpg/v1/fill/w_320,h_430,q_90,enc_avif,quality_auto/187f75_c8e05c66becf4997bcd14bffdadcca85~mv2.jpg",
    "alt": "Gallery Image 3",
    "category": "gallery",
    "filename": "topaz-import-gallery-03.jpg"
  },
  {
    "index": 4,
    "src": "https://static.wixstatic.com/media/187f75_c5f8d9aa9ddb4d81a653acaf95551b39~mv2.jpg/v1/fill/w_320,h_254,q_90,enc_avif,quality_auto/187f75_c5f8d9aa9ddb4d81a653acaf95551b39~mv2.jpg",
    "alt": "Gallery Image 4",
    "category": "gallery",
    "filename": "topaz-import-gallery-04.jpg"
  },
  {
    "index": 5,
    "src": "https://static.wixstatic.com/media/187f75_6e4e918b9ad64de58d7043943fd1a190~mv2.jpg/v1/fill/w_320,h_444,q_90,enc_avif,quality_auto/187f75_6e4e918b9ad64de58d7043943fd1a190~mv2.jpg",
    "alt": "Gallery Image 5",
    "category": "gallery",
    "filename": "topaz-import-gallery-05.jpg"
  },
  {
    "index": 6,
    "src": "https://static.wixstatic.com/media/187f75_1e9e85500e3d403cb0f6405d5a19ccf6~mv2.jpg/v1/fill/w_320,h_212,q_90,enc_avif,quality_auto/187f75_1e9e85500e3d403cb0f6405d5a19ccf6~mv2.jpg",
    "alt": "Gallery Image 6",
    "category": "gallery",
    "filename": "topaz-import-gallery-06.jpg"
  },
  {
    "index": 7,
    "src": "https://static.wixstatic.com/media/187f75_8f1abb5c72134b6887dbd359ed1e0547~mv2.jpg/v1/fill/w_320,h_253,q_90,enc_avif,quality_auto/187f75_8f1abb5c72134b6887dbd359ed1e0547~mv2.jpg",
    "alt": "Gallery Image 7",
    "category": "gallery",
    "filename": "topaz-import-gallery-07.jpg"
  },
  {
    "index": 8,
    "src": "https://static.wixstatic.com/media/187f75_ce1b8a54147244b586d8a2b037f66e53~mv2.png/v1/fill/w_320,h_148,q_90,enc_avif,quality_auto/187f75_ce1b8a54147244b586d8a2b037f66e53~mv2.png",
    "alt": "Logo Image",
    "category": "logos",
    "filename": "topaz-logo.png"
  },
  {
    "index": 9,
    "src": "https://static.wixstatic.com/media/187f75_99817ddadd2043b5b86128885318f541~mv2.jpg/v1/fill/w_320,h_222,q_90,enc_avif,quality_auto/187f75_99817ddadd2043b5b86128885318f541~mv2.jpg",
    "alt": "About Image 1",
    "category": "about",
    "filename": "about-01.jpg"
  },
  {
    "index": 10,
    "src": "https://static.wixstatic.com/media/187f75_7cdad5e9b19044e99f787eaba269d6ac~mv2.jpg/v1/fill/w_320,h_586,q_90,enc_avif,quality_auto/187f75_7cdad5e9b19044e99f787eaba269d6ac~mv2.jpg",
    "alt": "About Image 2",
    "category": "about",
    "filename": "about-02.jpg"
  },
  {
    "index": 11,
    "src": "https://static.wixstatic.com/media/8bb438_5ae585140ab442d49138ef3ccbf8fdb8~mv2_d_3000_3000_s_4_2.jpg/v1/fill/w_320,h_320,q_90,enc_avif,quality_auto/8bb438_5ae585140ab442d49138ef3ccbf8fdb8~mv2_d_3000_3000_s_4_2.jpg",
    "alt": "Event Image 1",
    "category": "events",
    "filename": "event-01.jpg"
  },
  {
    "index": 12,
    "src": "https://static.wixstatic.com/media/8bb438_0ab7a3ec93cf434cb89081f5272b5dac~mv2_d_3000_1941_s_2.jpg/v1/fill/w_320,h_207,q_90,enc_avif,quality_auto/8bb438_0ab7a3ec93cf434cb89081f5272b5dac~mv2_d_3000_1941_s_2.jpg",
    "alt": "Event Image 2",
    "category": "events",
    "filename": "event-02.jpg"
  },
  {
    "index": 13,
    "src": "https://static.wixstatic.com/media/8bb438_98999c7be5814da8a012bb8d32aa6a47~mv2_d_3000_1965_s_2.jpg/v1/fill/w_320,h_210,q_90,enc_avif,quality_auto/8bb438_98999c7be5814da8a012bb8d32aa6a47~mv2_d_3000_1965_s_2.jpg",
    "alt": "Event Image 3",
    "category": "events",
    "filename": "event-03.jpg"
  }
];

// Video data
const VIDEO_DATA = {
  resolutions: ['1080p', '720p', '480p'],
  baseUrl: 'https://video.wixstatic.com/video/187f75_27990c00a54e450aa41497ecc3f40b68',
  filename: 'hero-dance.mp4',
  category: 'videos'
};

// Stats tracking
const stats = {
  imagesDownloaded: 0,
  imagesSkipped: 0,
  imagesFailed: 0,
  videoDownloaded: false,
  videoSkipped: false,
  videoFailed: false,
  totalBytes: 0,
  errors: []
};

/**
 * Transform URL to high resolution
 */
function getHighResUrl(url) {
  // Remove existing parameters and replace with high-res ones
  const baseUrl = url.split('/v1/')[0];
  const filename = url.split('/').pop().split('~')[0] + '~mv2' + (url.includes('.png') ? '.png' : '.jpg');
  return `${baseUrl}/v1/fill/w_1920,h_1920,q_100/${filename}`;
}

/**
 * Format file size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Log error to file
 */
async function logError(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  stats.errors.push(logEntry);
  try {
    await fs.appendFile(CONFIG.errorLogPath, logEntry);
  } catch (err) {
    console.error('Failed to write to error log:', err.message);
  }
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Download file with retry logic
 */
async function downloadFile(url, outputPath, retries = 0) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const request = client.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, outputPath, retries)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          await fs.writeFile(outputPath, buffer);
          resolve({ size: buffer.length, success: true });
        } catch (err) {
          reject(err);
        }
      });
    });

    request.on('error', async (err) => {
      if (retries < CONFIG.maxRetries) {
        console.log(`  ⚠ Retry ${retries + 1}/${CONFIG.maxRetries}...`);
        await new Promise(r => setTimeout(r, 1000 * (retries + 1)));
        try {
          const result = await downloadFile(url, outputPath, retries + 1);
          resolve(result);
        } catch (retryErr) {
          reject(retryErr);
        }
      } else {
        reject(err);
      }
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Download a single image
 */
async function downloadImage(imageData, index, total) {
  const highResUrl = getHighResUrl(imageData.src);
  const categoryDir = path.join(CONFIG.imagesDir, imageData.category);
  const outputPath = path.join(categoryDir, imageData.filename);

  console.log(`[${index}/${total}] Downloading ${imageData.filename}...`);

  try {
    // Check if already exists
    try {
      const existing = await fs.stat(outputPath);
      console.log(`  ⓘ Already exists (${formatBytes(existing.size)}) - skipping`);
      stats.imagesSkipped++;
      stats.totalBytes += existing.size;
      return {
        success: true,
        skipped: true,
        originalUrl: imageData.src,
        localPath: `/images/${imageData.category}/${imageData.filename}`,
        filename: imageData.filename,
        category: imageData.category,
        fileSize: formatBytes(existing.size)
      };
    } catch {
      // File doesn't exist, proceed with download
    }

    const result = await downloadFile(highResUrl, outputPath);
    stats.imagesDownloaded++;
    stats.totalBytes += result.size;
    console.log(`  ✓ Downloaded (${formatBytes(result.size)})`);

    return {
      success: true,
      skipped: false,
      originalUrl: imageData.src,
      localPath: `/images/${imageData.category}/${imageData.filename}`,
      filename: imageData.filename,
      category: imageData.category,
      fileSize: formatBytes(result.size)
    };
  } catch (err) {
    stats.imagesFailed++;
    const errorMsg = `Failed to download ${imageData.filename}: ${err.message}`;
    await logError(errorMsg);
    console.error(`  ✗ ${errorMsg}`);
    return {
      success: false,
      error: err.message,
      originalUrl: imageData.src,
      filename: imageData.filename,
      category: imageData.category
    };
  }
}

/**
 * Download hero video
 */
async function downloadVideo() {
  console.log('\n📹 Downloading hero video...\n');

  const videoPath = path.join(CONFIG.videosDir, VIDEO_DATA.filename);

  // Check if already exists
  try {
    const existing = await fs.stat(videoPath);
    console.log(`  ⓘ Video already exists (${formatBytes(existing.size)}) - skipping`);
    stats.videoSkipped = true;
    stats.totalBytes += existing.size;
    return {
      success: true,
      skipped: true,
      originalUrl: `${VIDEO_DATA.baseUrl}/480p/mp4/file.mp4`,
      localPath: `/videos/${VIDEO_DATA.filename}`,
      filename: VIDEO_DATA.filename,
      resolution: '480p',
      fileSize: formatBytes(existing.size)
    };
  } catch {
    // File doesn't exist
  }

  // Try different resolutions
  for (const resolution of VIDEO_DATA.resolutions) {
    const videoUrl = `${VIDEO_DATA.baseUrl}/${resolution}/mp4/file.mp4`;
    console.log(`  Trying ${resolution}...`);

    try {
      const result = await downloadFile(videoUrl, videoPath);
      stats.videoDownloaded = true;
      stats.totalBytes += result.size;
      console.log(`  ✓ Downloaded ${resolution} video (${formatBytes(result.size)})`);
      return {
        success: true,
        skipped: false,
        originalUrl: videoUrl,
        localPath: `/videos/${VIDEO_DATA.filename}`,
        filename: VIDEO_DATA.filename,
        resolution,
        fileSize: formatBytes(result.size)
      };
    } catch (err) {
      console.log(`  ⚠ ${resolution} not available`);
      continue;
    }
  }

  const errorMsg = 'Failed to download video in any resolution';
  await logError(errorMsg);
  stats.videoFailed = true;
  console.error(`  ✗ ${errorMsg}`);
  return {
    success: false,
    error: errorMsg,
    filename: VIDEO_DATA.filename
  };
}

/**
 * Create manifest file
 */
async function createManifest(imageResults, videoResult) {
  const manifest = {
    images: imageResults.filter(r => r.success),
    videos: videoResult.success ? [videoResult] : [],
    downloadDate: new Date().toISOString(),
    totalImages: IMAGES_DATA.length,
    totalVideos: 1,
    downloadedImages: stats.imagesDownloaded,
    skippedImages: stats.imagesSkipped,
    failedImages: stats.imagesFailed,
    videoDownloaded: stats.videoDownloaded,
    videoSkipped: stats.videoSkipped,
    totalSize: formatBytes(stats.totalBytes)
  };

  await fs.writeFile(CONFIG.manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📝 Manifest saved to: ${CONFIG.manifestPath}`);
}

/**
 * Main function
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     TOPAZ Media Downloader v1.0        ║');
  console.log('║  Downloading from Wix to local assets    ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Setup directories
  console.log('📁 Setting up directories...');
  await ensureDir(CONFIG.publicDir);
  await ensureDir(CONFIG.imagesDir);
  await ensureDir(CONFIG.videosDir);

  // Create category directories
  const categories = [...new Set(IMAGES_DATA.map(img => img.category))];
  for (const category of categories) {
    await ensureDir(path.join(CONFIG.imagesDir, category));
  }
  console.log(`  ✓ Created ${categories.length} category directories\n`);

  // Download images
  console.log('🖼️  Downloading images in high resolution...\n');
  const imageResults = [];
  for (let i = 0; i < IMAGES_DATA.length; i++) {
    const result = await downloadImage(IMAGES_DATA[i], i + 1, IMAGES_DATA.length);
    imageResults.push(result);
  }

  // Download video
  const videoResult = await downloadVideo();

  // Create manifest
  await createManifest(imageResults, videoResult);

  // Summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           DOWNLOAD SUMMARY             ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n✓ Images downloaded: ${stats.imagesDownloaded}`);
  console.log(`ⓘ Images skipped: ${stats.imagesSkipped}`);
  console.log(`✗ Images failed: ${stats.imagesFailed}`);
  console.log(`✓ Video: ${stats.videoDownloaded ? 'Downloaded' : stats.videoSkipped ? 'Skipped' : 'Failed'}`);
  console.log(`\n📊 Total size: ${formatBytes(stats.totalBytes)}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠ ${stats.errors.length} errors logged to: ${CONFIG.errorLogPath}`);
  }

  console.log('\n✅ Download complete!\n');
}

// Run main function
main().catch(async (err) => {
  console.error('Fatal error:', err);
  await logError(`Fatal error: ${err.message}`);
  process.exit(1);
});
