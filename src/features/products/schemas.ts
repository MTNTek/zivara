import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name must be less than 255 characters'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(1, 'Description is required'),
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal with max 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Price must be positive'),
  discountPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Discount price must be a valid decimal with max 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Discount price must be positive')
    .optional()
    .nullable(),
  discountStartDate: z.string().datetime().optional().nullable(),
  discountEndDate: z.string().datetime().optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID'),
  sku: z.string().max(100, 'SKU must be less than 100 characters').optional().nullable(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.discountPrice && parseFloat(data.discountPrice) >= parseFloat(data.price)) {
    return false;
  }
  return true;
}, {
  message: 'Discount price must be less than regular price',
  path: ['discountPrice'],
});

// For updates, we need to recreate the schema without refinements for partial support
const baseProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name must be less than 255 characters'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(1, 'Description is required'),
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal with max 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Price must be positive'),
  discountPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Discount price must be a valid decimal with max 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Discount price must be positive')
    .optional()
    .nullable(),
  discountStartDate: z.string().datetime().optional().nullable(),
  discountEndDate: z.string().datetime().optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID'),
  sku: z.string().max(100, 'SKU must be less than 100 characters').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = baseProductSchema.partial().extend({
  id: z.string().uuid('Invalid product ID'),
});

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name must be less than 255 characters'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  parentId: z.string().uuid('Invalid parent category ID').optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().uuid('Invalid category ID'),
});

// Product image validation schema
export const productImageSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  imageUrl: z.string().url('Invalid image URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL'),
  altText: z.string().max(255, 'Alt text must be less than 255 characters').optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

// Product query/filter validation schema
export const productQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(24),
  categoryId: z.string().uuid().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRating: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'rating', 'newest']).optional(),
});

// Image upload validation
export const imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be JPEG, PNG, or WebP format'
    ),
  productId: z.string().uuid('Invalid product ID'),
  altText: z.string().max(255).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
