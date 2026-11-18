<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\ProductImage;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponseTrait;

    /**
     * List all products with filters and search
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'primaryImage', 'images']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->query('status') === 'active');
        }

        $perPage = (int) $request->query('per_page', 15);
        $products = $query->latest('id')->paginate($perPage);

        return $this->paginatedResponse($products, 'Products retrieved successfully');
    }

    /**
     * Store a new product
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string'],
        ]);

        $slug = Str::slug($validated['name']);
        if (Product::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::lower(Str::random(5));
        }

        $product = Product::create([
            'category_id' => $validated['category_id'],
            'name' => strip_tags($validated['name']),
            'slug' => $slug,
            'sku' => strtoupper(trim($validated['sku'])),
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'stock' => $validated['stock'],
            'short_description' => isset($validated['short_description']) ? strip_tags($validated['short_description']) : null,
            'description' => isset($validated['description']) ? clean_html_or_text($validated['description']) : null,
            'is_active' => $validated['is_active'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
        ]);

        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $index => $imageUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imageUrl,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        ActivityLog::log('PRODUCT_CREATED', "Product created: {$product->name} (SKU: {$product->sku})", $request->user());

        return $this->successResponse(
            $product->load(['category', 'images']),
            'Product created successfully',
            201
        );
    }

    /**
     * Show single product for editing
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'images'])->findOrFail($id);
        return $this->successResponse($product, 'Product details retrieved');
    }

    /**
     * Update product
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', "unique:products,sku,{$id}"],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string'],
        ]);

        $product->update([
            'category_id' => $validated['category_id'],
            'name' => strip_tags($validated['name']),
            'sku' => strtoupper(trim($validated['sku'])),
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'stock' => $validated['stock'],
            'short_description' => isset($validated['short_description']) ? strip_tags($validated['short_description']) : null,
            'description' => isset($validated['description']) ? clean_html_or_text($validated['description']) : null,
            'is_active' => $validated['is_active'] ?? $product->is_active,
            'is_featured' => $validated['is_featured'] ?? $product->is_featured,
        ]);

        if (isset($validated['images'])) {
            $product->images()->delete();
            foreach ($validated['images'] as $index => $imageUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imageUrl,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        ActivityLog::log('PRODUCT_UPDATED', "Product updated: {$product->name}", $request->user());

        return $this->successResponse(
            $product->fresh(['category', 'images']),
            'Product updated successfully'
        );
    }

    /**
     * Delete product
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $name = $product->name;
        $product->delete();

        ActivityLog::log('PRODUCT_DELETED', "Product deleted: {$name}", $request->user());

        return $this->successResponse(null, 'Product deleted successfully');
    }

    /**
     * Upload product image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // 5MB max
        ]);

        $path = $request->file('image')->store('products', 'public');
        $url = asset(Storage::url($path));

        return $this->successResponse(['url' => $url], 'Image uploaded successfully');
    }
}

/**
 * Basic XSS sanitizer helper for rich text descriptions
 */
if (!function_exists('clean_html_or_text')) {
    function clean_html_or_text(?string $content): ?string
    {
        if (!$content) return null;
        return strip_tags($content, '<p><br><strong><em><ul><ol><li><h3><h4>');
    }
}

