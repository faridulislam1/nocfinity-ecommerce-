<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    /**
     * List all categories (flat and tree view)
     */
    public function index(): JsonResponse
    {
        $categories = Category::with('parent')
            ->orderBy('sort_order', 'asc')
            ->get();

        return $this->successResponse($categories, 'Categories retrieved');
    }

    /**
     * Create category
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $slug = Str::slug($validated['name']);
        if (Category::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::lower(Str::random(4));
        }

        $category = Category::create([
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => strip_tags($validated['name']),
            'slug' => $slug,
            'description' => isset($validated['description']) ? strip_tags($validated['description']) : null,
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        ActivityLog::log('CATEGORY_CREATED', "Category created: {$category->name}", $request->user());

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    /**
     * Update category
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:categories,id', "not_in:{$id}"],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $category->update([
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => strip_tags($validated['name']),
            'description' => isset($validated['description']) ? strip_tags($validated['description']) : null,
            'image' => $validated['image'] ?? $category->image,
            'is_active' => $validated['is_active'] ?? $category->is_active,
            'sort_order' => $validated['sort_order'] ?? $category->sort_order,
        ]);

        ActivityLog::log('CATEGORY_UPDATED', "Category updated: {$category->name}", $request->user());

        return $this->successResponse($category, 'Category updated successfully');
    }

    /**
     * Delete category
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $name = $category->name;

        // Reparent or handle children
        $category->delete();

        ActivityLog::log('CATEGORY_DELETED', "Category deleted: {$name}", $request->user());

        return $this->successResponse(null, 'Category deleted successfully');
    }
}

