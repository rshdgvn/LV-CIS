<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Exception;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class CloudinaryService
{
  protected $cloudinary;
  protected $imageManager;

  public function __construct()
  {
    $this->cloudinary = new Cloudinary(config('cloudinary'));
    $this->imageManager = new ImageManager(new Driver());
  }

  public function upload($file, string $folder = 'uploads'): ?string
  {
    try {
      $path = is_string($file) ? $file : $file->getRealPath();

      if (!$path || !file_exists($path)) {
        throw new Exception("File not found at: {$path}");
      }

      $mime = mime_content_type($path);
      
      if (str_starts_with($mime, 'image/')) {

        $tempPath = sys_get_temp_dir() . '/img_' . uniqid() . '.jpg';

        // compress image
        $this->imageManager
          ->read($path)
          ->scaleDown(width: 1920)
          ->save($tempPath, quality: 75);

        $upload = $this->cloudinary->uploadApi()->upload($tempPath, [
          'folder' => $folder,
          'overwrite' => true,
          'resource_type' => 'image',
        ]);

        unlink($tempPath);
        return $upload['secure_url'] ?? null;
      }

      if (str_starts_with($mime, 'video/')) {
        $upload = $this->cloudinary->uploadApi()->upload($path, [
          'folder' => $folder,
          'resource_type' => 'video',
        ]);

        return $upload['secure_url'] ?? null;
      }

      throw new Exception("Unsupported file type: {$mime}");
    } catch (Exception $e) {
      logger()->error('Cloudinary upload error: ' . $e->getMessage());
      return null;
    }
  }

  public function delete(string $publicId): bool
  {
    try {
      $this->cloudinary->uploadApi()->destroy($publicId);
      return true;
    } catch (Exception $e) {
      logger()->error('Cloudinary delete error: ' . $e->getMessage());
      return false;
    }
  }
}
