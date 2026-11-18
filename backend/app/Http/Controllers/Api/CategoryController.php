<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get Public Category Tree (Parent + Active Children)
     */
    public function index(): JsonResponse
    {
        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order', 'asc');
            }])
            ->orderBy('sort_order', 'asc')
            ->get();

        return $this->successResponse($categories, 'Categories retrieved successfully');
    }

    /**
     * Get Single Category by Slug with subcategories
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order', 'asc');
            }, 'parent'])
            ->firstOrFail();

        return $this->successResponse($category, 'Category details retrieved');
    }
}

