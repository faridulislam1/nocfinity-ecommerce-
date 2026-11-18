<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'usage_limit',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if coupon is currently valid for a given subtotal
     */
    public function isValidFor(float $subtotal, ?string &$errorMessage = null): bool
    {
        if (!$this->is_active) {
            $errorMessage = 'This coupon is not active.';
            return false;
        }

        $now = Carbon::now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            $errorMessage = 'This coupon is not valid yet.';
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            $errorMessage = 'This coupon has expired.';
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            $errorMessage = 'This coupon usage limit has been reached.';
            return false;
        }

        if ($subtotal < (float) $this->min_order_amount) {
            $errorMessage = "Minimum order amount of \${$this->min_order_amount} required to use this coupon.";
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount for a given subtotal
     */
    public function calculateDiscount(float $subtotal): float
    {
        if ($this->type === 'percentage') {
            $discount = ($subtotal * (float) $this->value) / 100.0;
        } else {
            $discount = (float) $this->value;
        }

        return round(min($discount, $subtotal), 2);
    }
}

