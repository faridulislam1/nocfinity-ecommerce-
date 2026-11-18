<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    use ApiResponseTrait;

    /**
     * Helper to get or create cart for current user or guest session
     */
    protected function getOrCreateCart(Request $request): Cart
    {
        $user = $request->user();

        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        $sessionId = $request->header('X-Cart-Session') ?? $request->input('session_id');
        if (!$sessionId) {
            $sessionId = (string) Str::uuid();
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    /**
     * Format cart response
     */
    protected function formatCartResponse(Cart $cart): array
    {
        $cart->load(['items.product.primaryImage']);

        $items = $cart->items->map(function ($item) {
            $product = $item->product;
            return [
                'id' => $item->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'discount_price' => $product->discount_price ? (float) $product->discount_price : null,
                'effective_price' => $product->effective_price,
                'stock' => $product->stock,
                'image' => $product->primaryImage?->image_url ?? $product->images->first()?->image_url,
                'quantity' => $item->quantity,
                'total_price' => round($item->quantity * $product->effective_price, 2),
            ];
        });

        $subtotal = round($items->sum('total_price'), 2);

        return [
            'id' => $cart->id,
            'session_id' => $cart->session_id,
            'items' => $items,
            'items_count' => $items->sum('quantity'),
            'subtotal' => $subtotal,
        ];
    }

    /**
     * Get Current Cart
     */
    public function getCart(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        return $this->successResponse($this->formatCartResponse($cart));
    }

    /**
     * Add Item to Cart
     */
    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($request->product_id);

        if (!$product->is_active) {
            return $this->errorResponse('This product is currently unavailable.', 400);
        }

        if ($product->stock <= 0) {
            return $this->errorResponse('Sorry, this product is out of stock.', 400);
        }

        $cart = $this->getOrCreateCart($request);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        $currentQty = $cartItem ? $cartItem->quantity : 0;
        $requestedQty = $currentQty + $request->quantity;

        if ($requestedQty > $product->stock) {
            return $this->errorResponse(
                "Only {$product->stock} item(s) available in stock. You already have {$currentQty} in your cart.",
                400
            );
        }

        if ($cartItem) {
            $cartItem->quantity = $requestedQty;
            $cartItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return $this->successResponse(
            $this->formatCartResponse($cart->fresh()),
            'Product added to cart'
        );
    }

    /**
     * Update Item Quantity in Cart
     */
    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->getOrCreateCart($request);
        $cartItem = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->firstOrFail();
        $product = Product::findOrFail($cartItem->product_id);

        if ($request->quantity > $product->stock) {
            return $this->errorResponse("Only {$product->stock} unit(s) available in stock.", 400);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        return $this->successResponse(
            $this->formatCartResponse($cart->fresh()),
            'Cart updated'
        );
    }

    /**
     * Remove Item from Cart
     */
    public function removeItem(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        CartItem::where('cart_id', $cart->id)->where('id', $itemId)->delete();

        return $this->successResponse(
            $this->formatCartResponse($cart->fresh()),
            'Item removed from cart'
        );
    }

    /**
     * Clear Entire Cart
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return $this->successResponse(
            $this->formatCartResponse($cart->fresh()),
            'Cart cleared'
        );
    }

    /**
     * Merge Guest Session Cart into Authenticated User Cart on Login
     */
    public function mergeGuestCart(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->errorResponse('Authentication required to merge cart.', 401);
        }

        $sessionId = $request->input('session_id') ?? $request->header('X-Cart-Session');
        if (!$sessionId) {
            return $this->getCart($request);
        }

        $guestCart = Cart::where('session_id', $sessionId)->with('items.product')->first();
        if (!$guestCart || $guestCart->items->isEmpty()) {
            return $this->getCart($request);
        }

        $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

        foreach ($guestCart->items as $guestItem) {
            $product = $guestItem->product;
            if (!$product || !$product->is_active || $product->stock <= 0) {
                continue;
            }

            $userItem = CartItem::where('cart_id', $userCart->id)
                ->where('product_id', $product->id)
                ->first();

            if ($userItem) {
                $newQty = min($userItem->quantity + $guestItem->quantity, $product->stock);
                $userItem->quantity = $newQty;
                $userItem->save();
            } else {
                CartItem::create([
                    'cart_id' => $userCart->id,
                    'product_id' => $product->id,
                    'quantity' => min($guestItem->quantity, $product->stock),
                ]);
            }
        }

        // Delete the guest cart after merge
        $guestCart->items()->delete();
        $guestCart->delete();

        return $this->successResponse(
            $this->formatCartResponse($userCart->fresh()),
            'Cart successfully synchronized'
        );
    }
}

