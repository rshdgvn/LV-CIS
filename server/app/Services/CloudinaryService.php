<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Exception;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\File;

class CloudinaryService
{
  protected $cloudinary;
  protected $imageManager;

  public function __construct()
  {
    $this->cloudinary = new Cloudinary(config('cloudinary'));
    $this->imageManager = new ImageManager(new Driver());
  }

  /**
   * Upload an image to Cloudinary with compression and resizing.
   *
   * @param  mixed  $file  UploadedFile instance or file path
   * @param  string $folder  Destination folder on Cloudinary
   * @return string|null  Secure URL of uploaded image or null on failure
   */
  public function upload($file, string $folder = 'uploads'): ?string
  {
    try {
      $path = is_string($file) ? $file : $file->getRealPath();

      if (!$path || !file_exists($path)) {
        throw new Exception("File not found at path: {$path}");
      }

      // Create a temporary compressed image path
      $compressedPath = storage_path('app/temp_' . uniqid() . '.jpg');

      // Compress and resize image
      $this->imageManager
        ->read($path)
        ->scaleDown(width: 1920) // Resize to max width 1920px
        ->save($compressedPath, quality: 75); // Compress to 75% quality

      // Upload to Cloudinary
      $upload = $this->cloudinary->uploadApi()->upload($compressedPath, [
        'folder' => $folder,
        'overwrite' => true,
        'resource_type' => 'image',
      ]);

      // Clean up temp file
      if (File::exists($compressedPath)) {
        File::delete($compressedPath);
      }

      return $upload['secure_url'] ?? null;
    } catch (Exception $e) {
      logger()->error('Cloudinary upload failed: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Delete an image from Cloudinary by public ID.
   *
   * @param string $publicId
   * @return bool
   */
  public function delete(string $publicId): bool
  {
    try {
      $this->cloudinary->uploadApi()->destroy($publicId);
      return true;
    } catch (Exception $e) {
      logger()->error('Cloudinary delete failed: ' . $e->getMessage());
      return false;
    }
  }
}
