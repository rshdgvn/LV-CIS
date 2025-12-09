<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Exception;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
  protected $cloudinary;
  protected $imageManager;
  protected $maxRetries = 2;

  public function __construct()
  {
    $this->cloudinary = new Cloudinary(config('cloudinary'));
    $this->imageManager = new ImageManager(new Driver());
  }

  public function upload($file, string $folder = 'uploads', int $attempt = 1): ?string
  {
    try {
      $path = is_string($file) ? $file : $file->getRealPath();

      if (!$path || !file_exists($path)) {
        throw new Exception("File not found at: {$path}");
      }

      // Check if file is readable
      if (!is_readable($path)) {
        throw new Exception("File is not readable: {$path}");
      }

      $mime = mime_content_type($path);
      $fileSize = filesize($path);

      Log::info('Starting Cloudinary upload', [
        'mime' => $mime,
        'size' => $fileSize,
        'folder' => $folder,
        'attempt' => $attempt
      ]);

      if (str_starts_with($mime, 'image/')) {
        return $this->uploadImage($path, $folder, $fileSize);
      }

      if (str_starts_with($mime, 'video/')) {
        return $this->uploadVideo($path, $folder, $fileSize);
      }

      throw new Exception("Unsupported file type: {$mime}");
    } catch (Exception $e) {
      Log::error('Cloudinary upload error', [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'attempt' => $attempt
      ]);

      // Retry logic for transient errors
      if ($attempt < $this->maxRetries && $this->isRetryableError($e)) {
        Log::info("Retrying upload (attempt {$attempt}/{$this->maxRetries})");
        sleep(1); // Wait 1 second before retry
        return $this->upload($file, $folder, $attempt + 1);
      }

      return null;
    }
  }

  protected function uploadImage(string $path, string $folder, int $fileSize): ?string
  {
    $tempPath = null;

    try {
      // Only compress if image is larger than 1MB
      if ($fileSize > 1048576) {
        $tempPath = sys_get_temp_dir() . '/img_' . uniqid() . '.jpg';

        // Ensure temp directory is writable
        if (!is_writable(sys_get_temp_dir())) {
          throw new Exception('Temp directory is not writable: ' . sys_get_temp_dir());
        }

        Log::info('Compressing image before upload', [
          'original_size' => $fileSize,
          'temp_path' => $tempPath
        ]);

        // Increase memory limit temporarily for large images
        $originalMemoryLimit = ini_get('memory_limit');
        if ($fileSize > 2097152) { // 2MB
          ini_set('memory_limit', '256M');
        }

        $this->imageManager
          ->read($path)
          ->scaleDown(width: 1920)
          ->save($tempPath, quality: 75);

        // Restore original memory limit
        ini_set('memory_limit', $originalMemoryLimit);

        $uploadPath = $tempPath;
        $compressedSize = filesize($tempPath);
        Log::info('Image compressed', [
          'original_size' => $fileSize,
          'compressed_size' => $compressedSize,
          'reduction' => round((1 - $compressedSize / $fileSize) * 100, 2) . '%'
        ]);
      } else {
        $uploadPath = $path;
      }

      // Upload to Cloudinary with timeout
      $upload = $this->cloudinary->uploadApi()->upload($uploadPath, [
        'folder' => $folder,
        'overwrite' => true,
        'resource_type' => 'image',
        'timeout' => 60, // 60 seconds timeout
      ]);

      // Clean up temp file
      if ($tempPath && file_exists($tempPath)) {
        unlink($tempPath);
      }

      if (!isset($upload['secure_url'])) {
        throw new Exception('No secure_url in Cloudinary response');
      }

      Log::info('Image uploaded successfully', [
        'url' => $upload['secure_url'],
        'public_id' => $upload['public_id'] ?? 'unknown'
      ]);

      return $upload['secure_url'];
    } catch (Exception $e) {
      // Clean up temp file on error
      if ($tempPath && file_exists($tempPath)) {
        unlink($tempPath);
      }
      throw $e;
    }
  }

  protected function uploadVideo(string $path, string $folder, int $fileSize): ?string
  {
    try {
      Log::info('Uploading video', [
        'size' => $fileSize,
        'folder' => $folder
      ]);

      // Videos can take longer, increase timeout
      $upload = $this->cloudinary->uploadApi()->upload($path, [
        'folder' => $folder,
        'resource_type' => 'video',
        'timeout' => 120, // 2 minutes for videos
        'chunk_size' => 6000000, // 6MB chunks for large files
      ]);

      if (!isset($upload['secure_url'])) {
        throw new Exception('No secure_url in Cloudinary response');
      }

      Log::info('Video uploaded successfully', [
        'url' => $upload['secure_url'],
        'public_id' => $upload['public_id'] ?? 'unknown'
      ]);

      return $upload['secure_url'];
    } catch (Exception $e) {
      throw $e;
    }
  }

  protected function isRetryableError(Exception $e): bool
  {
    $retryableMessages = [
      'timeout',
      'connection',
      'network',
      'temporarily unavailable',
      'try again',
    ];

    $message = strtolower($e->getMessage());

    foreach ($retryableMessages as $retryable) {
      if (str_contains($message, $retryable)) {
        return true;
      }
    }

    return false;
  }

  public function delete(string $publicId): bool
  {
    try {
      $this->cloudinary->uploadApi()->destroy($publicId);
      Log::info('Cloudinary asset deleted', ['public_id' => $publicId]);
      return true;
    } catch (Exception $e) {
      Log::error('Cloudinary delete error', [
        'error' => $e->getMessage(),
        'public_id' => $publicId
      ]);
      return false;
    }
  }
}
