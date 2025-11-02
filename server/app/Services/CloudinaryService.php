<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Exception;

class CloudinaryService
{
  protected $cloudinary;

  public function __construct()
  {
    $this->cloudinary = new Cloudinary(config('cloudinary'));
  }

  /**
   * Upload a file to Cloudinary.
   *
   * @param  mixed  $file  — UploadedFile instance or file path
   * @param  string $folder — Destination folder on Cloudinary
   * @return string|null — Secure URL of uploaded image or null on failure
   */
  public function upload($file, string $folder = 'uploads'): ?string
  {
    try {
      $path = is_string($file) ? $file : $file->getRealPath();

      $upload = $this->cloudinary->uploadApi()->upload($path, [
        'folder' => $folder,
        'overwrite' => true,
        'resource_type' => 'image',
      ]);

      return $upload['secure_url'] ?? null;
    } catch (Exception $e) {
      logger()->error('Cloudinary upload failed: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Delete an image from Cloudinary by public ID.
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
