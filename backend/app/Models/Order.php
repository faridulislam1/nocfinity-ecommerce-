<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'subtotal',
        'discount_amount',
        'coupon_code',
        'shipping_cost',
        'tax_amount',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Generate unique human readable order number e.g. ORD-2026-000123
     */
    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = static::whereYear('created_at', $year)->latest('id')->first();
        $nextNumber = $lastOrder ? ($lastOrder->id + 1) : 1;
        return sprintf('ORD-%s-%06d', $year, $nextNumber);
    }
}

