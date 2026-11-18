<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get Paginated Catalog Products with Filters & Sorting
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::where('is_active', true)
            ->with(['category', 'images', 'primaryImage']);

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Category Filter (supports parent category slug or child category slug)
        if ($categorySlug = $request->query('category')) {
            $category = Category::with('children')->where('slug', $categorySlug)->first();
            if ($category) {
                $categoryIds = $category->children->pluck('id')->push($category->id)->all();
                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Price Range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->query('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->query('max_price'));
        }

        // Stock Filter
        if ($request->query('in_stock') === 'true') {
            $query->where('stock', '>', 0);
        }

        // Sorting
        $sort = $request->query('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(discount_price, price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(discount_price, price) DESC');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'popular':
                $query->orderBy('reviews_count', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $perPage = min((int) $request->query('per_page', 12), 48);
        $paginated = $query->paginate($perPage);

        return $this->paginatedResponse($paginated, 'Products retrieved successfully');
    }

    /**
     * Featured products for homepage
     */
    public function featured(): JsonResponse
    {
        $products = Product::where('is_active', true)
            ->where('is_featured', true)
            ->with(['category', 'primaryImage'])
            ->take(8)
            ->get();

        return $this->successResponse($products, 'Featured products retrieved');
    }

    /**
     * Single Product Detail by Slug
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with(['category.parent', 'images'])
            ->firstOrFail();

        // Related Products from same category
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->with(['primaryImage', 'category'])
            ->take(4)
            ->get();

        return $this->successResponse([
            'product' => $product,
            'related_products' => $relatedProducts,
        ], 'Product details retrieved');
    }
}

