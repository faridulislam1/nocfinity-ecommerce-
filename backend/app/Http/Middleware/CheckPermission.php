<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
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
                'message' => 'Your account has been deactivated. Please contact an administrator.',
            ], 403);
        }

        // Super Admin bypasses all granular permission checks
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Check if user has permission
        if (!$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => "Forbidden: You lack the required '{$permission}' permission.",
            ], 403);
        }

        return $next($request);
    }
}

