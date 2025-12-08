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

  public function upload($file, string $folder = 'uploads'): ?string
  {
    try {
      $path = is_string($file) ? $file : $file->getRealPath();

      if (!$path || !file_exists($path)) {
        throw new Exception("File not found at path: {$path}");
      }

      $tempDir = sys_get_temp_dir();
      $compressedPath = $tempDir . '/temp_' . uniqid() . '.jpg';

      $this->imageManager
        ->read($path)
        ->scaleDown(width: 1920)
        ->save($compressedPath, quality: 75);

      $upload = $this->cloudinary->uploadApi()->upload($compressedPath, [
        'folder' => $folder,
        'overwrite' => true,
        'resource_type' => 'image',
      ]);

      if (file_exists($compressedPath)) {
        unlink($compressedPath); 
      }

      return $upload['secure_url'] ?? null;
    } catch (Exception $e) {
      logger()->error('Cloudinary upload failed: ' . $e->getMessage());
      return null;
    }
  }

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
