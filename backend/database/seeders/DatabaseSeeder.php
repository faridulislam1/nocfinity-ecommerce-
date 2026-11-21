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
                ->filter(fn($p) => str_starts_with($p->slug, 'products.') || str_starts_with($p->slug, 'categories.'))
                ->pluck('id')
        );

        $orderManagerRole = Role::updateOrCreate(
            ['slug' => 'order-manager'],
            [
                'name' => 'Order Manager',
                'description' => 'Inspects orders, tracks customer information, and updates fulfillment states.',
                'is_system' => false,
            ]
        );
        $orderManagerRole->permissions()->sync(
            collect($permissionModels)
                ->filter(fn($p) => str_starts_with($p->slug, 'orders.') || $p->slug === 'customers.view')
                ->pluck('id')
        );

        $supportRole = Role::updateOrCreate(
            ['slug' => 'support'],
            [
                'name' => 'Support Staff',
                'description' => 'Read-only access to orders, products, and customer directories for inquiries.',
                'is_system' => false,
            ]
        );
        $supportRole->permissions()->sync(
            collect($permissionModels)
                ->filter(fn($p) => in_array($p->slug, ['orders.view', 'products.view', 'categories.view', 'customers.view']))
                ->pluck('id')
        );

        // 3. Seed Staff and Customer Accounts
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@nocfinity.com'],
            [
                'name' => 'Alexander Vance (Super Admin)',
                'password' => Hash::make('Password123!'),
                'phone' => '+1 (555) 019-2834',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->roles()->sync([$superAdminRole->id]);

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

        // 4. Seed Figma Categories Hierarchy (Men/Women -> T-shirts, Shorts, Shirts, Hoodie, Jeans)
        $parentMen = Category::updateOrCreate(
            ['slug' => 'men'],
            [
                'name' => 'Men',
                'description' => 'Men\'s contemporary streetwear, casual fashion, and tailored classics.',
                'image' => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $catTshirts = Category::updateOrCreate(
            ['slug' => 't-shirts'],
            [
                'parent_id' => $parentMen->id,
                'name' => 'T-shirts',
                'description' => 'Graphic tees, minimal crewnecks, and premium heavyweight cotton t-shirts.',
                'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $catShorts = Category::updateOrCreate(
            ['slug' => 'shorts'],
            [
                'parent_id' => $parentMen->id,
                'name' => 'Shorts',
                'description' => 'Bermuda shorts, casual chinos, and everyday relaxed summer shorts.',
                'image' => 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $catShirts = Category::updateOrCreate(
            ['slug' => 'shirts'],
            [
                'parent_id' => $parentMen->id,
                'name' => 'Shirts',
                'description' => 'Checkered button-downs, vertical striped vacation shirts, and classic oxfords.',
                'image' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        $catHoodie = Category::updateOrCreate(
            ['slug' => 'hoodie'],
            [
                'parent_id' => $parentMen->id,
                'name' => 'Hoodie',
                'description' => 'Heavyweight cotton hoodies, zip pullovers, and urban sweatshirts.',
                'image' => 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 4,
            ]
        );

        $catJeans = Category::updateOrCreate(
            ['slug' => 'jeans'],
            [
                'parent_id' => $parentMen->id,
                'name' => 'Jeans',
                'description' => 'Skinny fit denim, faded wash trousers, and relaxed vintage jeans.',
                'image' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 5,
            ]
        );

        $catCasual = Category::updateOrCreate(
            ['slug' => 'casual'],
            [
                'name' => 'Casual',
                'description' => 'Effortless everyday fits for relaxed comfort.',
                'image' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 6,
            ]
        );

        $catFormal = Category::updateOrCreate(
            ['slug' => 'formal'],
            [
                'name' => 'Formal',
                'description' => 'Tailored suits, dress shirts, and elegant executive wear.',
                'image' => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 7,
            ]
        );

        $catParty = Category::updateOrCreate(
            ['slug' => 'party'],
            [
                'name' => 'Party',
                'description' => 'Vibrant evening attire, trendy prints, and weekend statement pieces.',
                'image' => 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 8,
            ]
        );

        $catGym = Category::updateOrCreate(
            ['slug' => 'gym'],
            [
                'name' => 'Gym',
                'description' => 'High performance breathable athletic wear and active training gear.',
                'image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
                'is_active' => true,
                'sort_order' => 9,
            ]
        );

        // 5. Seed EXACT 21 Figma Clothing Products
        $figmaProducts = [
            // --- NEW ARRIVALS (Figma Screen 1) ---
            [
                'name' => 'T-shirt with Tape Details',
                'slug' => 't-shirt-with-tape-details',
                'sku' => 'TSH-TAPE-001',
                'category_id' => $catTshirts->id,
                'price' => 120.00,
                'discount_price' => null,
                'stock' => 35,
                'is_featured' => true,
                'rating' => 4.5,
                'reviews_count' => 65,
                'short_description' => 'Minimalist black cotton crewneck tee featuring tonal engineered tape accents.',
                'description' => 'Crafted from 100% combed organic cotton with a comfortable regular fit. Features subtle industrial tape detailing across the shoulders and back yoke for an elevated modern streetwear silhouette.',
                'images' => [
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Skinny Fit Jeans',
                'slug' => 'skinny-fit-jeans',
                'sku' => 'JNS-SKIN-002',
                'category_id' => $catJeans->id,
                'price' => 260.00,
                'discount_price' => 240.00,
                'stock' => 20,
                'is_featured' => true,
                'rating' => 3.5,
                'reviews_count' => 42,
                'short_description' => 'Deep indigo stretch denim with tapered skinny silhouette and reinforced rivets.',
                'description' => 'Built with high-recovery elastane denim that contours without restricting movement. Vintage copper hardware, five-pocket styling, and signature contrast stitching.',
                'images' => [
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Checkered Shirt',
                'slug' => 'checkered-shirt',
                'sku' => 'SHT-CHCK-003',
                'category_id' => $catShirts->id,
                'price' => 180.00,
                'discount_price' => null,
                'stock' => 28,
                'is_featured' => true,
                'rating' => 4.5,
                'reviews_count' => 54,
                'short_description' => 'Classic yarn-dyed cotton flannel button-down with heritage tartan pattern.',
                'description' => 'Brushed cotton twill provides cozy warmth and softness. Features button-down collar, dual chest patch pockets, and curved shirt-tail hem.',
                'images' => [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Sleeve Striped T-shirt',
                'slug' => 'sleeve-striped-t-shirt',
                'sku' => 'TSH-STRP-004',
                'category_id' => $catTshirts->id,
                'price' => 160.00,
                'discount_price' => 130.00,
                'stock' => 18,
                'is_featured' => true,
                'rating' => 4.5,
                'reviews_count' => 38,
                'short_description' => 'Sport-inspired contrast raglan tee with dual-tone striped sleeve panels.',
                'description' => 'Combines retro collegiate aesthetic with athletic jersey knit. Ribbed crew collar, pre-shrunk fabric, and contrast orange-and-black colorblocking.',
                'images' => [
                    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
                ],
            ],

            // --- TOP SELLING (Figma Screen 1) ---
            [
                'name' => 'Vertical Striped Shirt',
                'slug' => 'vertical-striped-shirt',
                'sku' => 'SHT-VERT-005',
                'category_id' => $catShirts->id,
                'price' => 232.00,
                'discount_price' => 212.00,
                'stock' => 15,
                'is_featured' => true,
                'rating' => 5.0,
                'reviews_count' => 88,
                'short_description' => 'Relaxed camp-collar vacation shirt in breathable sage green vertical stripes.',
                'description' => 'Lightweight linen-cotton blend perfect for tropical climates and evening gatherings. Finished with natural mother-of-pearl buttons and relaxed drop shoulders.',
                'images' => [
                    'https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Courage Graphic T-shirt',
                'slug' => 'courage-graphic-t-shirt',
                'sku' => 'TSH-COUR-006',
                'category_id' => $catTshirts->id,
                'price' => 145.00,
                'discount_price' => null,
                'stock' => 40,
                'is_featured' => true,
                'rating' => 4.0,
                'reviews_count' => 49,
                'short_description' => 'Vibrant orange streetwear tee featuring bold typographic chest print.',
                'description' => 'Heavyweight 240 GSM cotton jersey. Silk-screened high density graphic that maintains its vibrancy after repeated washing.',
                'images' => [
                    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Loose Fit Bermuda Shorts',
                'slug' => 'loose-fit-bermuda-shorts',
                'sku' => 'SHT-BERM-007',
                'category_id' => $catShorts->id,
                'price' => 80.00,
                'discount_price' => null,
                'stock' => 25,
                'is_featured' => true,
                'rating' => 3.0,
                'reviews_count' => 22,
                'short_description' => 'Light-wash distressed denim bermuda shorts with raw cut hems.',
                'description' => '90s skater-inspired relaxed fit with generous leg opening. Durable 12oz denim with subtle fading and stone wash texture.',
                'images' => [
                    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Faded Skinny Jeans',
                'slug' => 'faded-skinny-jeans',
                'sku' => 'JNS-FADE-008',
                'category_id' => $catJeans->id,
                'price' => 210.00,
                'discount_price' => null,
                'stock' => 14,
                'is_featured' => true,
                'rating' => 4.5,
                'reviews_count' => 71,
                'short_description' => 'Washed black denim with whiskering accents and slim tailored legs.',
                'description' => 'The essential daily jeans. Softened stretch cotton blend with subtle distressing around thighs and knees.',
                'images' => [
                    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop&q=80',
                ],
            ],

            // --- FIGMA PRODUCT DETAIL HERO PRODUCT ---
            [
                'name' => 'One Life Graphic T-shirt',
                'slug' => 'one-life-graphic-t-shirt',
                'sku' => 'TSH-ONEL-009',
                'category_id' => $catTshirts->id,
                'price' => 300.00,
                'discount_price' => 260.00,
                'stock' => 50,
                'is_featured' => true,
                'rating' => 4.5,
                'reviews_count' => 451,
                'short_description' => 'This graphic t-shirt is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
                'description' => 'The centerpiece of the Shop.co collection. Made from 100% heavyweight cotton with custom garment wash for a broken-in feel from day one. Features our iconic One Life back print, reinforced taped neck and shoulders, and double-stitched sleeve cuffs.',
                'images' => [
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
                ],
            ],

            // --- FIGMA CATEGORY PAGE PRODUCTS ---
            [
                'name' => 'Polo with Tipping Details',
                'slug' => 'polo-with-tipping-details',
                'sku' => 'PLO-TIPP-010',
                'category_id' => $catTshirts->id,
                'price' => 180.00,
                'discount_price' => null,
                'stock' => 24,
                'is_featured' => false,
                'rating' => 4.5,
                'reviews_count' => 33,
                'short_description' => 'Dusty pink cotton pique polo shirt with fine white knit collar tipping.',
                'description' => 'Classic two-button placket, ribbed cuffs, and side vent hems. An understated smart-casual staple.',
                'images' => [
                    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Gradient Graphic T-shirt',
                'slug' => 'gradient-graphic-t-shirt',
                'sku' => 'TSH-GRAD-011',
                'category_id' => $catTshirts->id,
                'price' => 145.00,
                'discount_price' => null,
                'stock' => 30,
                'is_featured' => false,
                'rating' => 4.0,
                'reviews_count' => 27,
                'short_description' => 'Clean white tee featuring pastel rainbow psychedelic gradient chest graphic.',
                'description' => 'Smooth ring-spun cotton that feels soft against the skin. Relaxed unisex fit with seamless ribbed collar.',
                'images' => [
                    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Black Striped T-shirt',
                'slug' => 'black-striped-t-shirt',
                'sku' => 'TSH-BSTP-012',
                'category_id' => $catTshirts->id,
                'price' => 150.00,
                'discount_price' => 120.00,
                'stock' => 22,
                'is_featured' => false,
                'rating' => 5.0,
                'reviews_count' => 58,
                'short_description' => 'Black and off-white horizontal nautical striped jersey crewneck tee.',
                'description' => 'Timeless French Breton nautical stripes in durable mid-weight jersey. Preshrunk with reinforced hem.',
                'images' => [
                    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Polo with Contrast Trims',
                'slug' => 'polo-with-contrast-trims',
                'sku' => 'PLO-CONT-013',
                'category_id' => $catTshirts->id,
                'price' => 242.00,
                'discount_price' => 212.00,
                'stock' => 0, // Out of stock to test inventory constraints & UI badge
                'is_featured' => false,
                'rating' => 4.0,
                'reviews_count' => 31,
                'short_description' => 'Sky blue performance knit polo featuring navy contrast collar and cuff bands.',
                'description' => 'Moisture-wicking technical cotton blend. Great on the golf course or around the city.',
                'images' => [
                    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Heavyweight Urban Cotton Hoodie',
                'slug' => 'heavyweight-urban-cotton-hoodie',
                'sku' => 'HOD-URBN-014',
                'category_id' => $catHoodie->id,
                'price' => 195.00,
                'discount_price' => null,
                'stock' => 26,
                'is_featured' => false,
                'rating' => 4.8,
                'reviews_count' => 64,
                'short_description' => '450 GSM French Terry oversized streetwear hoodie with double-layer hood.',
                'description' => 'The ultimate everyday layer. Dense French terry weave that feels luxurious, breathable and retains its structure after dozens of wash cycles.',
                'images' => [
                    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Classic Minimalist Black Hoodie',
                'slug' => 'classic-minimalist-black-hoodie',
                'sku' => 'HOD-BLCK-015',
                'category_id' => $catHoodie->id,
                'price' => 175.00,
                'discount_price' => 145.00,
                'stock' => 34,
                'is_featured' => false,
                'rating' => 4.7,
                'reviews_count' => 45,
                'short_description' => 'Deep black pullover fleece hoodie with kangaroo front pocket and metal eyelets.',
                'description' => 'Soft brushed fleece interior provides unmatched warmth. Minimalist design without loud branding.',
                'images' => [
                    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Chino Casual Shorts',
                'slug' => 'chino-casual-shorts',
                'sku' => 'SHT-CHNO-016',
                'category_id' => $catShorts->id,
                'price' => 95.00,
                'discount_price' => null,
                'stock' => 20,
                'is_featured' => false,
                'rating' => 4.2,
                'reviews_count' => 19,
                'short_description' => 'Khaki tailored stretch cotton chino shorts with 7-inch inseam.',
                'description' => 'Clean flat-front construction with slant front pockets and buttoned back welt pockets.',
                'images' => [
                    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Relaxed Fit Cargo Pants',
                'slug' => 'relaxed-fit-cargo-pants',
                'sku' => 'JNS-CARG-017',
                'category_id' => $catJeans->id,
                'price' => 185.00,
                'discount_price' => null,
                'stock' => 15,
                'is_featured' => false,
                'rating' => 4.6,
                'reviews_count' => 37,
                'short_description' => 'Olive green ripstop cotton cargo pants with gusseted accordion utility pockets.',
                'description' => 'Utility meets everyday fashion. Adjustable ankle drawcords and reinforced knees.',
                'images' => [
                    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Classic Oxford Button-Down Shirt',
                'slug' => 'classic-oxford-button-down-shirt',
                'sku' => 'SHT-OXFD-018',
                'category_id' => $catShirts->id,
                'price' => 155.00,
                'discount_price' => null,
                'stock' => 25,
                'is_featured' => false,
                'rating' => 4.8,
                'reviews_count' => 52,
                'short_description' => 'Crisp white two-ply combed cotton oxford shirt with box pleat back.',
                'description' => 'The timeless menswear essential. Looks equally sharp under a tailored blazer or untucked over denim.',
                'images' => [
                    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Floral Print Summer Vacation Shirt',
                'slug' => 'floral-print-summer-vacation-shirt',
                'sku' => 'SHT-FLOR-019',
                'category_id' => $catShirts->id,
                'price' => 125.00,
                'discount_price' => 99.00,
                'stock' => 18,
                'is_featured' => false,
                'rating' => 4.4,
                'reviews_count' => 29,
                'short_description' => 'Rayon camp-collar short-sleeve shirt with vintage botanical floral pattern.',
                'description' => 'Silky lightweight drape that catches the breeze. Straight hem with side slits.',
                'images' => [
                    'https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Vintage Distressed Denim Jacket',
                'slug' => 'vintage-distressed-denim-jacket',
                'sku' => 'JNS-VINT-020',
                'category_id' => $catJeans->id,
                'price' => 280.00,
                'discount_price' => 230.00,
                'stock' => 10,
                'is_featured' => true,
                'rating' => 4.9,
                'reviews_count' => 61,
                'short_description' => 'Heavyweight 14oz trucker denim jacket in authentic vintage stonewash wash.',
                'description' => 'Classic pointed collar, dual button-flap chest pockets, and adjustable waist tabs.',
                'images' => [
                    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'name' => 'Athletic Tech Fleece Zip Jacket',
                'slug' => 'athletic-tech-fleece-zip-jacket',
                'sku' => 'HOD-FLCE-021',
                'category_id' => $catHoodie->id,
                'price' => 165.00,
                'discount_price' => null,
                'stock' => 20,
                'is_featured' => false,
                'rating' => 4.7,
                'reviews_count' => 38,
                'short_description' => 'Heather gray aerodynamic athletic full-zip jacket with zippered side pockets.',
                'description' => 'Lightweight thermal insulation for training, running, or cold-weather commutes.',
                'images' => [
                    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
                ],
            ],
        ];

        foreach ($figmaProducts as $pData) {
            $images = $pData['images'];
            unset($pData['images']);

            $product = Product::updateOrCreate(
                ['slug' => $pData['slug']],
                $pData
            );

            // Re-sync product images
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

        // 6. Seed Promotional Coupons
        $coupons = [
            [
                'code' => 'WELCOME10',
                'type' => 'percentage',
                'value' => 10.00,
                'min_order_amount' => 50.00,
                'usage_limit' => 500,
                'used_count' => 24,
                'starts_at' => Carbon::now()->subMonths(1),
                'expires_at' => Carbon::now()->addYear(),
                'is_active' => true,
            ],
            [
                'code' => 'SAVE20',
                'type' => 'fixed',
                'value' => 20.00,
                'min_order_amount' => 100.00,
                'usage_limit' => 200,
                'used_count' => 15,
                'starts_at' => Carbon::now()->subMonths(1),
                'expires_at' => Carbon::now()->addMonths(6),
                'is_active' => true,
            ],
            [
                'code' => 'FLASH50',
                'type' => 'percentage',
                'value' => 50.00,
                'min_order_amount' => 200.00,
                'usage_limit' => 50,
                'used_count' => 8,
                'starts_at' => Carbon::now()->subDays(2),
                'expires_at' => Carbon::now()->addDays(5),
                'is_active' => true,
            ],
            [
                'code' => 'EXPIRED30',
                'type' => 'percentage',
                'value' => 30.00,
                'min_order_amount' => 50.00,
                'usage_limit' => 100,
                'used_count' => 100,
                'starts_at' => Carbon::now()->subMonths(3),
                'expires_at' => Carbon::now()->subDay(),
                'is_active' => false,
            ],
        ];

        foreach ($coupons as $cpn) {
            Coupon::updateOrCreate(['code' => $cpn['code']], $cpn);
        }

        // 7. Seed Sample Orders with Clothing Products
        $allProducts = Product::all();
        $shirtTape = $allProducts->firstWhere('slug', 't-shirt-with-tape-details');
        $jeansSkinny = $allProducts->firstWhere('slug', 'skinny-fit-jeans');
        $shirtCheck = $allProducts->firstWhere('slug', 'checkered-shirt');

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
                'subtotal' => 240.00,
                'discount_amount' => 24.00,
                'coupon_code' => 'WELCOME10',
                'shipping_cost' => 0.00,
                'tax_amount' => 17.28,
                'total_amount' => 233.28,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subDays(8),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order1->id, 'product_id' => $shirtTape->id],
            [
                'product_name' => $shirtTape->name,
                'product_sku' => $shirtTape->sku,
                'unit_price' => 120.00,
                'quantity' => 2,
                'total_price' => 240.00,
            ]
        );
        Payment::updateOrCreate(
            ['order_id' => $order1->id],
            [
                'payment_method' => 'stripe',
                'transaction_id' => 'ch_sample_test_001',
                'amount' => 233.28,
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
                'subtotal' => 420.00,
                'discount_amount' => 20.00,
                'coupon_code' => 'SAVE20',
                'shipping_cost' => 0.00,
                'tax_amount' => 32.00,
                'total_amount' => 432.00,
                'status' => 'shipped',
                'payment_status' => 'paid',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subDays(3),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order2->id, 'product_id' => $jeansSkinny->id],
            [
                'product_name' => $jeansSkinny->name,
                'product_sku' => $jeansSkinny->sku,
                'unit_price' => 240.00,
                'quantity' => 1,
                'total_price' => 240.00,
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order2->id, 'product_id' => $shirtCheck->id],
            [
                'product_name' => $shirtCheck->name,
                'product_sku' => $shirtCheck->sku,
                'unit_price' => 180.00,
                'quantity' => 1,
                'total_price' => 180.00,
            ]
        );
        Payment::updateOrCreate(
            ['order_id' => $order2->id],
            [
                'payment_method' => 'stripe',
                'transaction_id' => 'ch_sample_test_002',
                'amount' => 432.00,
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
                'subtotal' => 180.00,
                'discount_amount' => 0.00,
                'coupon_code' => null,
                'shipping_cost' => 0.00,
                'tax_amount' => 14.40,
                'total_amount' => 194.40,
                'status' => 'processing',
                'payment_status' => 'paid',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subHours(12),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order3->id, 'product_id' => $shirtCheck->id],
            [
                'product_name' => $shirtCheck->name,
                'product_sku' => $shirtCheck->sku,
                'unit_price' => 180.00,
                'quantity' => 1,
                'total_price' => 180.00,
            ]
        );
        Payment::updateOrCreate(
            ['order_id' => $order3->id],
            [
                'payment_method' => 'stripe',
                'transaction_id' => 'ch_sample_test_003',
                'amount' => 194.40,
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
                'subtotal' => 120.00,
                'discount_amount' => 0.00,
                'coupon_code' => null,
                'shipping_cost' => 0.00,
                'tax_amount' => 9.60,
                'total_amount' => 129.60,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subHours(2),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order4->id, 'product_id' => $shirtTape->id],
            [
                'product_name' => $shirtTape->name,
                'product_sku' => $shirtTape->sku,
                'unit_price' => 120.00,
                'quantity' => 1,
                'total_price' => 120.00,
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
                'subtotal' => 240.00,
                'discount_amount' => 0.00,
                'coupon_code' => null,
                'shipping_cost' => 15.00,
                'tax_amount' => 19.20,
                'total_amount' => 274.20,
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'payment_method' => 'stripe',
                'created_at' => Carbon::now()->subDays(6),
            ]
        );
        OrderItem::updateOrCreate(
            ['order_id' => $order5->id, 'product_id' => $jeansSkinny->id],
            [
                'product_name' => $jeansSkinny->name,
                'product_sku' => $jeansSkinny->sku,
                'unit_price' => 240.00,
                'quantity' => 1,
                'total_price' => 240.00,
            ]
        );

        // Additional 30-Day Velocity Orders (Populates the 30-Day Sales & Revenue Chart)
        $historicalDays = [1, 2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 27, 28];
        $allSeedProducts = Product::all();
        foreach ($historicalDays as $idx => $daysAgo) {
            $p = $allSeedProducts->get($idx % $allSeedProducts->count());
            $qty = ($idx % 2) + 1;
            $sub = $p->price * $qty;
            $tax = round($sub * 0.08, 2);
            $total = $sub + $tax;

            $hOrder = Order::updateOrCreate(
                ['order_number' => 'ORD-2026-000' . (110 + $idx)],
                [
                    'user_id' => $idx % 2 === 0 ? $customer->id : $customer2->id,
                    'customer_name' => $idx % 2 === 0 ? $customer->name : $customer2->name,
                    'customer_email' => $idx % 2 === 0 ? $customer->email : $customer2->email,
                    'customer_phone' => '+1 (555) 019-' . (1000 + $idx),
                    'shipping_address' => '100 Market St Suite ' . (200 + $idx),
                    'shipping_city' => 'San Francisco',
                    'shipping_state' => 'CA',
                    'shipping_postal_code' => '94105',
                    'shipping_country' => 'US',
                    'subtotal' => $sub,
                    'discount_amount' => 0.00,
                    'coupon_code' => null,
                    'shipping_cost' => 0.00,
                    'tax_amount' => $tax,
                    'total_amount' => $total,
                    'status' => 'delivered',
                    'payment_status' => 'paid',
                    'payment_method' => 'stripe',
                    'created_at' => Carbon::now()->subDays($daysAgo)->setHour(14)->setMinute(30),
                ]
            );

            OrderItem::updateOrCreate(
                ['order_id' => $hOrder->id, 'product_id' => $p->id],
                [
                    'product_name' => $p->name,
                    'product_sku' => $p->sku,
                    'unit_price' => $p->price,
                    'quantity' => $qty,
                    'total_price' => $sub,
                ]
            );

            Payment::updateOrCreate(
                ['order_id' => $hOrder->id],
                [
                    'payment_method' => 'stripe',
                    'transaction_id' => 'ch_sample_hist_' . (100 + $idx),
                    'amount' => $total,
                    'currency' => 'usd',
                    'status' => 'succeeded',
                    'payload' => ['brand' => 'visa', 'last4' => '4242'],
                    'created_at' => Carbon::now()->subDays($daysAgo),
                ]
            );
        }

        // 8. Seed 54 Additional Category-Wise Products & ensure 100% unique images across entire catalog
        $this->call(AdditionalProductsSeeder::class);
        $this->call(FixUniqueProductImagesSeeder::class);

        // 9. Log initial activity
        ActivityLog::create([
            'user_id' => $superAdmin->id,
            'action' => 'SYSTEM_INIT',
            'description' => 'System initialized with initial roles, permissions, categories, 21 Figma clothing products, and coupons.',
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
