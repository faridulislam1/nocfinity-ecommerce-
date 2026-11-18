<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'price',
        'discount_price',
        'stock',
        'is_active',
        'is_featured',
        'rating',
        'reviews_count',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'stock' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'rating' => 'decimal:2',
            'reviews_count' => 'integer',
        ];
    }

    protected $appends = ['effective_price', 'in_stock'];

    public function getEffectivePriceAttribute(): float
    {
        if ($this->discount_price !== null && (float) $this->discount_price > 0 && (float) $this->discount_price < (float) $this->price) {
            return (float) $this->discount_price;
        }
        return (float) $this->price;
    }

    public function getInStockAttribute(): bool
    {
        return $this->stock > 0;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order', 'asc');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }
}

