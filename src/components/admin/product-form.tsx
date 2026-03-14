'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/features/products/actions';
import { uploadProductImage, deleteProductImage, setPrimaryImage } from '@/features/products/image-actions';
import type { ProductWithDetails, Category } from '@/types';
import Image from 'next/image';
import { ButtonSpinner } from '@/components/ui/spinner';

interface ProductFormProps {
  product?: ProductWithDetails;
  categories: Category[];
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  price?: string;
  discountPrice?: string;
  categoryId?: string;
  sku?: string;
  general?: string;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || '',
    discountPrice: product?.discountPrice || '',
    discountStartDate: product?.discountStartDate ? new Date(product.discountStartDate).toISOString().slice(0, 16) : '',
    discountEndDate: product?.discountEndDate ? new Date(product.discountEndDate).toISOString().slice(0, 16) : '',
    categoryId: product?.categoryId || '',
    sku: product?.sku || '',
    isActive: product?.isActive ?? true,
  });

  const [images, setImages] = useState(product?.images || []);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  // Handle form field changes
  const handleChange = (field: string, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Product name must be less than 255 characters';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase with hyphens only';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = 'Price must be a valid decimal with max 2 decimal places';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be positive';
    }

    if (formData.discountPrice) {
      if (!/^\d+(\.\d{1,2})?$/.test(formData.discountPrice)) {
        newErrors.discountPrice = 'Discount price must be a valid decimal with max 2 decimal places';
      } else if (parseFloat(formData.discountPrice) <= 0) {
        newErrors.discountPrice = 'Discount price must be positive';
      } else if (parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
        newErrors.discountPrice = 'Discount price must be less than regular price';
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      const data = {
        ...formData,
        discountPrice: formData.discountPrice || null,
        discountStartDate: formData.discountStartDate || null,
        discountEndDate: formData.discountEndDate || null,
        sku: formData.sku || null,
      };

      let result;
      if (product) {
        result = await updateProduct({ id: product.id, ...data });
      } else {
        result = await createProduct(data);
      }

      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setErrors({ general: result.error || 'Failed to save product' });
      }
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    setUploadingImage(true);
    setErrors(prev => ({ ...prev, general: undefined }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', product.id);

      const result = await uploadProductImage(formData);

      if (result.success && result.data) {
        setImages(prev => [...prev, result.data]);
      } else {
        setErrors(prev => ({ ...prev, general: result.error || 'Failed to upload image' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, general: 'Failed to upload image' }));
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const result = await deleteProductImage(imageId);

    if (result.success) {
      setImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      setErrors(prev => ({ ...prev, general: result.error || 'Failed to delete image' }));
    }
  };

  // Handle set primary image
  const handleSetPrimary = async (imageId: string) => {
    if (!product) return;

    const result = await setPrimaryImage(product.id, imageId);

    if (result.success) {
      setImages(prev => prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      })));
    } else {
      setErrors(prev => ({ ...prev, general: result.error || 'Failed to set primary image' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {errors.general}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-800 focus:ring-[#0F52BA]'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.slug
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-800 focus:ring-[#0F52BA]'
              }`}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly version of the name (lowercase, hyphens only)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-800 focus:ring-[#0F52BA]'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-[#0F52BA] sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Stock Keeping Unit (optional)
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.categoryId
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-800 focus:ring-[#0F52BA]'
              }`}
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regular Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Regular Price <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`block w-full pl-7 rounded-md shadow-sm sm:text-sm ${
                  errors.price
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-800 focus:ring-[#0F52BA]'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Discount Price */}
          <div>
            <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">
              Discount Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="discountPrice"
                value={formData.discountPrice}
                onChange={(e) => handleChange('discountPrice', e.target.value)}
                className={`block w-full pl-7 rounded-md shadow-sm sm:text-sm ${
                  errors.discountPrice
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-800 focus:ring-[#0F52BA]'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.discountPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.discountPrice}</p>
            )}
          </div>

          {/* Discount Start Date */}
          <div>
            <label htmlFor="discountStartDate" className="block text-sm font-medium text-gray-700">
              Discount Start Date
            </label>
            <input
              type="datetime-local"
              id="discountStartDate"
              value={formData.discountStartDate}
              onChange={(e) => handleChange('discountStartDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-[#0F52BA] sm:text-sm"
            />
          </div>

          {/* Discount End Date */}
          <div>
            <label htmlFor="discountEndDate" className="block text-sm font-medium text-gray-700">
              Discount End Date
            </label>
            <input
              type="datetime-local"
              id="discountEndDate"
              value={formData.discountEndDate}
              onChange={(e) => handleChange('discountEndDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-[#0F52BA] sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      {product && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
          
          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.altText || 'Product image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-800 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(image.id)}
                        className="bg-white text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-100"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div>
            <label className="block">
              <span className="sr-only">Choose image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Upload JPEG, PNG, or WebP images (max 5MB)
            </p>
            {uploadingImage && (
              <p className="mt-2 text-sm text-black">Uploading...</p>
            )}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="h-4 w-4 text-black focus:ring-[#0F52BA] border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Product is active and visible to customers
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F52BA]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F52BA] disabled:opacity-50 flex items-center"
        >
          {isPending && <ButtonSpinner />}
          {isPending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
