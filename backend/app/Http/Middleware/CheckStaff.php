<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckStaff
{
    /**
     * Ensure the user has at least one administrative or staff role.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is disabled.',
            ], 403);
        }

        // Staff members have at least one assigned role
        if ($user->roles()->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Staff access only.',
            ], 403);
        }

        return $next($request);
    }
}

