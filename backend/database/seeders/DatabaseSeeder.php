<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Permissions
        $permissionsList = [
            // Products
            ['name' => 'View Products', 'slug' => 'products.view', 'group' => 'Products', 'description' => 'Can view catalog products'],
            ['name' => 'Create Products', 'slug' => 'products.create', 'group' => 'Products', 'description' => 'Can create new products'],
            ['name' => 'Edit Products', 'slug' => 'products.edit', 'group' => 'Products', 'description' => 'Can edit existing products'],
            ['name' => 'Delete Products', 'slug' => 'products.delete', 'group' => 'Products', 'description' => 'Can delete products'],

            // Categories
            ['name' => 'View Categories', 'slug' => 'categories.view', 'group' => 'Categories', 'description' => 'Can view category tree'],
            ['name' => 'Manage Categories', 'slug' => 'categories.manage', 'group' => 'Categories', 'description' => 'Can create, edit and delete categories'],

            // Orders
            ['name' => 'View Orders', 'slug' => 'orders.view', 'group' => 'Orders', 'description' => 'Can view customer orders and details'],
            ['name' => 'Update Order Status', 'slug' => 'orders.update_status', 'group' => 'Orders', 'description' => 'Can update fulfillment lifecycle status'],

            // Coupons
            ['name' => 'View Coupons', 'slug' => 'coupons.view', 'group' => 'Coupons', 'description' => 'Can view promotional coupons'],
            ['name' => 'Manage Coupons', 'slug' => 'coupons.manage', 'group' => 'Coupons', 'description' => 'Can create, edit and delete coupons'],

            // Customers
            ['name' => 'View Customers', 'slug' => 'customers.view', 'group' => 'Customers', 'description' => 'Can view customer lists and their order history'],

            // Roles & Permissions
            ['name' => 'View Roles', 'slug' => 'roles.view', 'group' => 'Roles & Permissions', 'description' => 'Can view role matrix and permissions'],
            ['name' => 'Manage Roles', 'slug' => 'roles.manage', 'group' => 'Roles & Permissions', 'description' => 'Can create roles and assign permissions'],

            // Reports & Dashboard
            ['name' => 'View Reports', 'slug' => 'reports.view', 'group' => 'Analytics', 'description' => 'Can view dashboard metrics, revenue, and charts'],
        ];

        $permissionModels = [];
        foreach ($permissionsList as $permData) {
            $permissionModels[$permData['slug']] = Permission::updateOrCreate(
                ['slug' => $permData['slug']],
                $permData
            );
        }

        // 2. Seed Roles
        $superAdminRole = Role::updateOrCreate(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Full unrestricted access to every administrative function and system configuration.',
                'is_system' => true,
            ]
        );
        $superAdminRole->permissions()->sync(collect($permissionModels)->pluck('id'));

        $adminRole = Role::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Admin',
                'description' => 'Can manage catalog, orders, coupons, customers, and view reports.',
                'is_system' => false,
            ]
        );
        $adminRole->permissions()->sync(
            collect($permissionModels)
                ->filter(fn($p) => $p->slug !== 'roles.manage')
                ->pluck('id')
        );

        $productManagerRole = Role::updateOrCreate(
            ['slug' => 'product-manager'],
            [
                'name' => 'Product Manager',
                'description' => 'Manages products, inventories, prices, and categories.',
                'is_system' => false,
            ]
        );
        $productManagerRole->permissions()->sync(
            collect($permissionModels)
                ->filter(fn($p) => str_starts_with($p->slug, 'products.') || str_starts_with($p->slug, 'categories.') || $p->slug === 'reports.view')
                ->pluck('id')
        );

        $orderManagerRole = Role::updateOrCreate(
            ['slug' => 'order-manager'],
            [
                'name' => 'Order Manager',
                'description' => 'Processes customer orders, updates shipping statuses, and views customers.',
                'is_system' => false,
            ]
        );
        $orderManagerRole->permissions()->sync(
            collect($permissionModels)
                ->filter(fn($p) => str_starts_with($p->slug, 'orders.') || $p->slug === 'customers.view' || $p->slug === 'reports.view')
                ->pluck('id')
        );

        $supportRole = Role::updateOrCreate(
            ['slug' => 'support'],
            [
                'name' => 'Support Staff',
                'description' => 'Read-only access to customer orders and product catalog for assistance.',
                'is_system' => false,
            ]
        );
        $supportRole->permissions()->sync(
            collect($permissionModels)
                ->filter(fn($p) => in_array($p->slug, ['orders.view', 'products.view', 'categories.view', 'customers.view']))
                ->pluck('id')
        );

        // 3. Seed Users
        // 3.1 Super Admin
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@nocfinity.com'],
            [
                'name' => 'Alex Vance (Super Admin)',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 019-2831',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->roles()->sync([$superAdminRole->id]);

        // 3.2 Admin
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@nocfinity.com'],
            [
                'name' => 'Marcus Sterling (Admin)',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 014-9922',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $adminUser->roles()->sync([$adminRole->id]);

        // 3.3 Product Manager
        $productManager = User::updateOrCreate(
            ['email' => 'product@nocfinity.com'],
            [
                'name' => 'Sarah Connor (Product Manager)',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 018-7734',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $productManager->roles()->sync([$productManagerRole->id]);

        // 3.4 Order Manager
        $orderManager = User::updateOrCreate(
            ['email' => 'order@nocfinity.com'],
            [
                'name' => 'David Miller (Order Manager)',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 012-3481',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $orderManager->roles()->sync([$orderManagerRole->id]);

        // 3.5 Support Staff
        $supportStaff = User::updateOrCreate(
            ['email' => 'support@nocfinity.com'],
            [
                'name' => 'Elena Rostova (Support)',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 016-5544',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $supportStaff->roles()->sync([$supportRole->id]);

        // 3.6 Sample Customer
        $customer = User::updateOrCreate(
            ['email' => 'customer@nocfinity.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 998-1122',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $customer2 = User::updateOrCreate(
            ['email' => 'jane.smith@example.com'],
            [
                'name' => 'Jane Smith',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 998-3344',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // 4. Seed Categories (2+ Level Tree)
        $parentElectronics = Category::updateOrCreate(
            ['slug' => 'electronics'],
            [
                'name' => 'Electronics',
                'description' => 'Cutting edge consumer electronics, gadgets and tech accessories.',
                'image' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $subPhones = Category::updateOrCreate(
            ['slug' => 'smartphones-tablets'],
            [
                'parent_id' => $parentElectronics->id,
                'name' => 'Smartphones & Tablets',
                'description' => 'Latest flagship phones, tablets and portable smart devices.',
                'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $subAudio = Category::updateOrCreate(
            ['slug' => 'audio-headphones'],
            [
                'parent_id' => $parentElectronics->id,
                'name' => 'Audio & Headphones',
                'description' => 'High-fidelity audio, wireless noise-cancelling headphones and speakers.',
                'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $subWearables = Category::updateOrCreate(
            ['slug' => 'wearable-tech'],
            [
                'parent_id' => $parentElectronics->id,
                'name' => 'Wearable Tech',
                'description' => 'Smartwatches, fitness bands and smart lifestyle accessories.',
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        $parentFashion = Category::updateOrCreate(
            ['slug' => 'fashion-accessories'],
            [
                'name' => 'Fashion & Lifestyle',
                'description' => 'Contemporary fashion, designer accessories and everyday essentials.',
                'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $subApparel = Category::updateOrCreate(
            ['slug' => 'minimalist-apparel'],
            [
                'parent_id' => $parentFashion->id,
                'name' => 'Minimalist Apparel',
                'description' => 'Premium cotton jackets, hoodies and tailored urban fits.',
                'image' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $subBags = Category::updateOrCreate(
            ['slug' => 'travel-backpacks'],
            [
                'parent_id' => $parentFashion->id,
                'name' => 'Backpacks & Bags',
                'description' => 'Waterproof travel backpacks, messenger bags and leather wallets.',
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // 5. Seed 20+ Sample Products with multiple images
        $sampleProducts = [
            [
                'name' => 'Aura Studio Wireless Noise-Cancelling Headphones',
                'slug' => 'aura-studio-wireless-headphones',
                'sku' => 'AUD-AURA-001',
                'category_id' => $subAudio->id,
                'price' => 349.00,
                'discount_price' => 299.00,
                'stock' => 24,
                'is_featured' => true,
                'rating' => 4.9,
                'reviews_count' => 128,
                'short_description' => 'Industry-leading noise cancellation with spatial audio and up to 40 hours of playtime.',
                'description' => 'Immerse yourself in rich, high-resolution acoustics with the Aura Studio Wireless Headphones. Featuring ultra-responsive active noise cancellation, custom-tuned 40mm titanium drivers, and ergonomic memory-foam ear cushions designed for all-day comfort. Seamless Bluetooth 5.3 multipoint pairing lets you switch between devices effortlessly.',
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Verve Ultra HD Smartwatch Series 6',
                'slug' => 'verve-ultra-hd-smartwatch-6',
                'sku' => 'WR-VRV-006',
                'category_id' => $subWearables->id,
                'price' => 279.00,
                'discount_price' => 239.00,
                'stock' => 15,
                'is_featured' => true,
                'rating' => 4.8,
                'reviews_count' => 95,
                'short_description' => 'AMOLED always-on display, ECG monitoring, titanium casing and 7-day battery.',
                'description' => 'Stay connected and monitor your wellness with precision. The Verve Ultra HD Smartwatch features real-time heart rate tracking, SpO2 blood oxygen sensing, GPS route mapping, and 5ATM water resistance suitable for swimming.',
                'images' => [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Lumina Pro 5G Flagship Smartphone 256GB',
                'slug' => 'lumina-pro-5g-smartphone',
                'sku' => 'PH-LUM-001',
                'category_id' => $subPhones->id,
                'price' => 899.00,
                'discount_price' => 829.00,
                'stock' => 18,
                'is_featured' => true,
                'rating' => 4.95,
                'reviews_count' => 210,
                'short_description' => '6.7-inch 120Hz ProMotion OLED, 50MP triple cinematic camera system.',
                'description' => 'Engineered for performance creators. Lumina Pro delivers hyper-fast 5G connectivity, an aerospace-grade aluminum chassis, 65W fast wireless charging, and an AI-accelerated imaging sensor.',
                'images' => [
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'SoundBar 360 Spatial Surround Soundbar',
                'slug' => 'soundbar-360-spatial-surround',
                'sku' => 'AUD-SBAR-360',
                'category_id' => $subAudio->id,
                'price' => 199.00,
                'discount_price' => 169.00,
                'stock' => 10,
                'is_featured' => false,
                'rating' => 4.7,
                'reviews_count' => 42,
                'short_description' => 'Dolby Atmos cinematic sound with wireless subwoofer and optical input.',
                'description' => 'Transform your living room into an IMAX theater. Crisp dialog clarity and deep thumping bass that reverberates throughout your media space.',
                'images' => [
                    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Nomad Weatherproof Urban Commuter Backpack 28L',
                'slug' => 'nomad-weatherproof-commuter-backpack',
                'sku' => 'BG-NOM-028',
                'category_id' => $subBags->id,
                'price' => 129.00,
                'discount_price' => 99.00,
                'stock' => 35,
                'is_featured' => true,
                'rating' => 4.85,
                'reviews_count' => 74,
                'short_description' => 'Cordura ballistic nylon with padded 16-inch laptop compartment and hidden passport pocket.',
                'description' => 'Crafted for modern digital nomads. Ergonomic airflow back panel, magnetic Fidlock buckles, expandable side bottle holders, and TSA-approved clamshell opening.',
                'images' => [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Minimalist Heavyweight Cotton Oversized Hoodie',
                'slug' => 'minimalist-heavyweight-cotton-hoodie',
                'sku' => 'AP-HOOD-001',
                'category_id' => $subApparel->id,
                'price' => 85.00,
                'discount_price' => null,
                'stock' => 40,
                'is_featured' => false,
                'rating' => 4.65,
                'reviews_count' => 53,
                'short_description' => '450 GSM French Terry organic cotton, pre-shrunk with dropped shoulders.',
                'description' => 'The ultimate everyday layer. Dense French terry weave that feels luxurious, breathable and retains its structure after dozens of wash cycles.',
                'images' => [
                    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'EchoPulse True Wireless Earbuds with ANC',
                'slug' => 'echopulse-true-wireless-earbuds',
                'sku' => 'AUD-ECHO-TWS',
                'category_id' => $subAudio->id,
                'price' => 149.00,
                'discount_price' => 119.00,
                'stock' => 50,
                'is_featured' => true,
                'rating' => 4.75,
                'reviews_count' => 88,
                'short_description' => 'Compact pebble case, transparency mode, wireless charging and IPX5 sweat resistance.',
                'description' => 'Pocket-sized sonic powerhouse. 6 microphones with beamforming technology guarantee crystal-clear phone calls even in noisy city environments.',
                'images' => [
                    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Apex Carbon Mechanical Gaming Keyboard',
                'slug' => 'apex-carbon-mechanical-keyboard',
                'sku' => 'ACC-APEX-KB',
                'category_id' => $parentElectronics->id,
                'price' => 169.00,
                'discount_price' => 145.00,
                'stock' => 12,
                'is_featured' => false,
                'rating' => 4.9,
                'reviews_count' => 61,
                'short_description' => 'Hot-swappable tactile switches, gasket-mounted sound dampening, per-key RGB.',
                'description' => 'Designed for esports precision and typing enthusiasts. Aluminum top plate, PBT double-shot keycaps that never fade, and triple connection modes (2.4GHz, BT, USB-C).',
                'images' => [
                    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Precision Wireless Ergonomic Mouse',
                'slug' => 'precision-wireless-ergonomic-mouse',
                'sku' => 'ACC-MSE-002',
                'category_id' => $parentElectronics->id,
                'price' => 79.00,
                'discount_price' => 69.00,
                'stock' => 28,
                'is_featured' => false,
                'rating' => 4.7,
                'reviews_count' => 47,
                'short_description' => 'Natural hand posture angle, magnetic scroll wheel and thumb navigation controls.',
                'description' => 'Reduce forearm strain with a 57-degree vertical handshake angle. Works on any surface including clear glass.',
                'images' => [
                    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Horizon 4K HDR Portable Creator Monitor 15.6"',
                'slug' => 'horizon-4k-portable-monitor',
                'sku' => 'MON-HRZ-4K',
                'category_id' => $parentElectronics->id,
                'price' => 389.00,
                'discount_price' => 329.00,
                'stock' => 8,
                'is_featured' => true,
                'rating' => 4.8,
                'reviews_count' => 34,
                'short_description' => '100% DCI-P3 color gamut, magnetic kickstand cover and dual USB-C single cable setup.',
                'description' => 'Expand your laptop workspace wherever you travel. Vibrant OLED panel with true deep blacks and 400 nits peak brightness.',
                'images' => [
                    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Chronos Classic Automatic Stainless Watch',
                'slug' => 'chronos-classic-automatic-watch',
                'sku' => 'WR-CHRN-SS',
                'category_id' => $subWearables->id,
                'price' => 450.00,
                'discount_price' => 395.00,
                'stock' => 7,
                'is_featured' => false,
                'rating' => 4.9,
                'reviews_count' => 29,
                'short_description' => 'Japanese automatic movement, sapphire crystal glass, exhibition caseback.',
                'description' => 'Timeless craftsmanship meets modern industrial style. 40mm 316L stainless steel case with solid link bracelet and butterfly clasp.',
                'images' => [
                    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'AirLite Waterproof Windbreaker Jacket',
                'slug' => 'airlite-waterproof-windbreaker',
                'sku' => 'AP-WND-002',
                'category_id' => $subApparel->id,
                'price' => 110.00,
                'discount_price' => null,
                'stock' => 22,
                'is_featured' => false,
                'rating' => 4.6,
                'reviews_count' => 19,
                'short_description' => 'Ripstop nylon shell with taped seams, packable into its own chest pouch.',
                'description' => 'Lightweight protection against sudden torrential downpours. Breathable underarm vents keep you cool during fast-paced commutes.',
                'images' => [
                    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Artisan Full-Grain Leather Bi-Fold Wallet',
                'slug' => 'artisan-leather-bifold-wallet',
                'sku' => 'BG-WLT-003',
                'category_id' => $subBags->id,
                'price' => 59.00,
                'discount_price' => 49.00,
                'stock' => 60,
                'is_featured' => false,
                'rating' => 4.8,
                'reviews_count' => 84,
                'short_description' => 'RFID-blocking vegetable-tanned Italian leather with 8 card slots.',
                'description' => 'Develops a unique rich patina over years of use. Slim profile easily slips into front or back pockets without bulk.',
                'images' => [
                    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'MagPower 10000mAh Magnetic Power Bank',
                'slug' => 'magpower-magnetic-power-bank',
                'sku' => 'ACC-MAG-PWR',
                'category_id' => $subPhones->id,
                'price' => 49.00,
                'discount_price' => 39.00,
                'stock' => 45,
                'is_featured' => false,
                'rating' => 4.75,
                'reviews_count' => 112,
                'short_description' => 'Snaps seamlessly to phone back with built-in fold-out kickstand.',
                'description' => 'Fast 15W wireless charging along with 20W USB-C Power Delivery. Safely charges your phone from 0% to 60% in just 30 minutes.',
                'images' => [
                    'https://images.unsplash.com/photo-1609592426508-cc02797b5e43?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Aura Bass Wireless Bluetooth Speaker',
                'slug' => 'aura-bass-bluetooth-speaker',
                'sku' => 'AUD-SPK-009',
                'category_id' => $subAudio->id,
                'price' => 89.00,
                'discount_price' => 75.00,
                'stock' => 30,
                'is_featured' => false,
                'rating' => 4.8,
                'reviews_count' => 65,
                'short_description' => 'IP67 waterproof outdoor speaker with dual passive radiators and 16h battery.',
                'description' => 'Take the party anywhere. Built to withstand water submersion, sand and bumps, while delivering room-filling 360-degree sound.',
                'images' => [
                    'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Lumina Fast Wireless Charging Stand 3-in-1',
                'slug' => 'lumina-3in1-wireless-charging-stand',
                'sku' => 'ACC-WLS-3IN1',
                'category_id' => $subPhones->id,
                'price' => 69.00,
                'discount_price' => 55.00,
                'stock' => 19,
                'is_featured' => false,
                'rating' => 4.6,
                'reviews_count' => 38,
                'short_description' => 'Charges phone, smartwatch and earbuds concurrently with a single cable.',
                'description' => 'Declutter your nightstand or office desk. Features intelligent heat dispersion and certified multi-protect safety protocols.',
                'images' => [
                    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'ProLens Ultra Wide HD Smartphone Lens Kit',
                'slug' => 'prolens-ultra-wide-lens-kit',
                'sku' => 'ACC-LNS-001',
                'category_id' => $subPhones->id,
                'price' => 79.00,
                'discount_price' => null,
                'stock' => 14,
                'is_featured' => false,
                'rating' => 4.5,
                'reviews_count' => 23,
                'short_description' => 'Multi-coated cinematic optical glass with universal phone clip and case.',
                'description' => 'Capture expansive landscapes and detailed macro shots with zero corner distortion or chromatic aberration.',
                'images' => [
                    'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Thermal Insulated Stainless Travel Flask 750ml',
                'slug' => 'thermal-insulated-travel-flask',
                'sku' => 'LS-BTL-750',
                'category_id' => $parentFashion->id,
                'price' => 35.00,
                'discount_price' => 28.00,
                'stock' => 55,
                'is_featured' => false,
                'rating' => 4.9,
                'reviews_count' => 91,
                'short_description' => 'Double-wall vacuum insulation keeps drinks cold for 24h or hot for 12h.',
                'description' => '18/8 food-grade stainless steel with non-slip powder coating and leak-proof spout lid.',
                'images' => [
                    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Voyager Duffle Weekender Gym Bag 40L',
                'slug' => 'voyager-duffle-weekender-bag',
                'sku' => 'BG-DUF-040',
                'category_id' => $subBags->id,
                'price' => 115.00,
                'discount_price' => 95.00,
                'stock' => 16,
                'is_featured' => false,
                'rating' => 4.7,
                'reviews_count' => 39,
                'short_description' => 'Separate ventilated shoe tunnel, waterproof toiletry compartment.',
                'description' => 'Your all-in-one companion for weekend road trips and intense gym sessions. Heavy-duty YKK zippers and reinforced shoulder straps.',
                'images' => [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Studio Pro Dynamic USB Podcast Microphone',
                'slug' => 'studio-pro-dynamic-usb-microphone',
                'sku' => 'AUD-MIC-PRO',
                'category_id' => $subAudio->id,
                'price' => 139.00,
                'discount_price' => 119.00,
                'stock' => 4, // low stock count to test low-stock badge!
                'is_featured' => true,
                'rating' => 4.88,
                'reviews_count' => 77,
                'short_description' => 'Cardioid pickup pattern with built-in pop filter and zero-latency headphone monitoring.',
                'description' => 'Broadcast-quality audio capture right out of the box. Plug and play compatibility with Mac, Windows and tablets.',
                'images' => [
                    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'CyberGrip Magnetic Car Mount with Qi Charging',
                'slug' => 'cybergrip-magnetic-car-mount',
                'sku' => 'ACC-CAR-MNT',
                'category_id' => $subPhones->id,
                'price' => 45.00,
                'discount_price' => 36.00,
                'stock' => 0, // OUT OF STOCK! Specifically tests out-of-stock behavior!
                'is_featured' => false,
                'rating' => 4.4,
                'reviews_count' => 15,
                'short_description' => 'Ultra-strong N52 neodymium magnets with 360-degree rotation ball joint.',
                'description' => 'Keeps your phone securely mounted even over bumpy roads while delivering rapid wireless charging through the air vent hook.',
                'images' => [
                    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
                ],
            ],
        ];

        foreach ($sampleProducts as $pData) {
            $images = $pData['images'];
            unset($pData['images']);

            $product = Product::updateOrCreate(
                ['sku' => $pData['sku']],
                $pData
            );

            // Add images
            ProductImage::where('product_id', $product->id)->delete();
            foreach ($images as $index => $imgUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imgUrl,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        // 6. Seed Coupons
        Coupon::updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => 'percentage',
                'value' => 10.00,
                'min_order_amount' => 50.00,
                'usage_limit' => 100,
                'used_count' => 12,
                'starts_at' => Carbon::now()->subDays(10),
                'expires_at' => Carbon::now()->addMonths(3),
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'SAVE20'],
            [
                'type' => 'fixed',
                'value' => 20.00,
                'min_order_amount' => 100.00,
                'usage_limit' => 50,
                'used_count' => 8,
                'starts_at' => Carbon::now()->subDays(5),
                'expires_at' => Carbon::now()->addMonths(2),
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'FLASH50'],
            [
                'type' => 'percentage',
                'value' => 50.00,
                'min_order_amount' => 200.00,
                'usage_limit' => 20,
                'used_count' => 5,
                'starts_at' => Carbon::now()->subDays(2),
                'expires_at' => Carbon::now()->addDays(14),
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'EXPIRED30'],
            [
                'type' => 'percentage',
                'value' => 30.00,
                'min_order_amount' => 50.00,
                'usage_limit' => 10,
                'used_count' => 10,
                'starts_at' => Carbon::now()->subMonths(3),
                'expires_at' => Carbon::now()->subDays(5), // Expired!
                'is_active' => true,
            ]
        );

        // 7. Seed Sample Orders in different statuses
        $products = Product::all();
        $headphone = $products->firstWhere('sku', 'AUD-AURA-001');
        $smartwatch = $products->firstWhere('sku', 'WR-VRV-006');
        $backpack = $products->firstWhere('sku', 'BG-NOM-028');

        // Order 1: Delivered
        $order1 = Order::updateOrCreate(
            ['order_number' => 'ORD-2026-000101'],
            [
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone,
                'shipping_address' => '742 Evergreen Terrace',
                'shipping_city' => 'Springfield',
                'shipping_state' => 'OR',
                'shipping_postal_code' => '97477',
                'shipping_country' => 'US',
                'subtotal' => 299.00,
                'discount_amount' => 29.90,
                'coupon_code' => 'WELCOME10',
                'shipping_cost' => 0.00,
                'tax_amount' => 21.53,
                'total_amount' => 290.63,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subDays(8),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order1->id, 'product_id' => $headphone->id],
            [
                'product_name' => $headphone->name,
                'product_sku' => $headphone->sku,
                'unit_price' => 299.00,
                'quantity' => 1,
                'total_price' => 299.00,
            ]
        );
        Payment::updateOrCreate(
            ['order_id' => $order1->id],
            [
                'payment_method' => 'stripe',
                'transaction_id' => 'ch_sample_test_001',
                'amount' => 290.63,
                'currency' => 'usd',
                'status' => 'succeeded',
                'payload' => ['brand' => 'visa', 'last4' => '4242'],
            ]
        );

        // Order 2: Shipped
        $order2 = Order::updateOrCreate(
            ['order_number' => 'ORD-2026-000102'],
            [
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone,
                'shipping_address' => '742 Evergreen Terrace',
                'shipping_city' => 'Springfield',
                'shipping_state' => 'OR',
                'shipping_postal_code' => '97477',
                'shipping_country' => 'US',
                'subtotal' => 338.00,
                'discount_amount' => 20.00,
                'coupon_code' => 'SAVE20',
                'shipping_cost' => 15.00,
                'tax_amount' => 25.44,
                'total_amount' => 358.44,
                'status' => 'shipped',
                'payment_status' => 'paid',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subDays(3),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order2->id, 'product_id' => $smartwatch->id],
            [
                'product_name' => $smartwatch->name,
                'product_sku' => $smartwatch->sku,
                'unit_price' => 239.00,
                'quantity' => 1,
                'total_price' => 239.00,
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order2->id, 'product_id' => $backpack->id],
            [
                'product_name' => $backpack->name,
                'product_sku' => $backpack->sku,
                'unit_price' => 99.00,
                'quantity' => 1,
                'total_price' => 99.00,
            ]
        );
        Payment::updateOrCreate(
            ['order_id' => $order2->id],
            [
                'payment_method' => 'stripe',
                'transaction_id' => 'ch_sample_test_002',
                'amount' => 358.44,
                'currency' => 'usd',
                'status' => 'succeeded',
                'payload' => ['brand' => 'mastercard', 'last4' => '5556'],
            ]
        );

        // Order 3: Processing
        $order3 = Order::updateOrCreate(
            ['order_number' => 'ORD-2026-000103'],
            [
                'user_id' => $customer2->id,
                'customer_name' => $customer2->name,
                'customer_email' => $customer2->email,
                'customer_phone' => $customer2->phone,
                'shipping_address' => '100 Market St',
                'shipping_city' => 'San Francisco',
                'shipping_state' => 'CA',
                'shipping_postal_code' => '94105',
                'shipping_country' => 'US',
                'subtotal' => 99.00,
                'discount_amount' => 0.00,
                'coupon_code' => null,
                'shipping_cost' => 10.00,
                'tax_amount' => 8.72,
                'total_amount' => 117.72,
                'status' => 'processing',
                'payment_status' => 'paid',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subHours(12),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order3->id, 'product_id' => $backpack->id],
            [
                'product_name' => $backpack->name,
                'product_sku' => $backpack->sku,
                'unit_price' => 99.00,
                'quantity' => 1,
                'total_price' => 99.00,
            ]
        );
        Payment::updateOrCreate(
            ['order_id' => $order3->id],
            [
                'payment_method' => 'stripe',
                'transaction_id' => 'ch_sample_test_003',
                'amount' => 117.72,
                'currency' => 'usd',
                'status' => 'succeeded',
                'payload' => ['brand' => 'visa', 'last4' => '4242'],
            ]
        );

        // Order 4: Pending (unpaid)
        $order4 = Order::updateOrCreate(
            ['order_number' => 'ORD-2026-000104'],
            [
                'user_id' => $customer2->id,
                'customer_name' => $customer2->name,
                'customer_email' => $customer2->email,
                'customer_phone' => $customer2->phone,
                'shipping_address' => '100 Market St',
                'shipping_city' => 'San Francisco',
                'shipping_state' => 'CA',
                'shipping_postal_code' => '94105',
                'shipping_country' => 'US',
                'subtotal' => 239.00,
                'discount_amount' => 0.00,
                'coupon_code' => null,
                'shipping_cost' => 0.00,
                'tax_amount' => 19.12,
                'total_amount' => 258.12,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subHours(2),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order4->id, 'product_id' => $smartwatch->id],
            [
                'product_name' => $smartwatch->name,
                'product_sku' => $smartwatch->sku,
                'unit_price' => 239.00,
                'quantity' => 1,
                'total_price' => 239.00,
            ]
        );

        // Order 5: Cancelled
        $order5 = Order::updateOrCreate(
            ['order_number' => 'ORD-2026-000105'],
            [
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone,
                'shipping_address' => '742 Evergreen Terrace',
                'shipping_city' => 'Springfield',
                'shipping_state' => 'OR',
                'shipping_postal_code' => '97477',
                'shipping_country' => 'US',
                'subtotal' => 299.00,
                'discount_amount' => 0.00,
                'coupon_code' => null,
                'shipping_cost' => 10.00,
                'tax_amount' => 24.72,
                'total_amount' => 333.72,
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subDays(6),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order5->id, 'product_id' => $headphone->id],
            [
                'product_name' => $headphone->name,
                'product_sku' => $headphone->sku,
                'unit_price' => 299.00,
                'quantity' => 1,
                'total_price' => 299.00,
            ]
        );

        // 8. Log initial activity
        ActivityLog::create([
            'user_id' => $superAdmin->id,
            'action' => 'SYSTEM_INIT',
            'description' => 'System initialized with initial roles, permissions, categories, 21 products, and coupons.',
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
