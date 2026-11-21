<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class FixUniqueProductImagesSeeder extends Seeder
{
    public function run(): void
    {
        $photoIds = [
            'photo-1521572267360-ee0c2909d518',
            'photo-1583743814966-8936f5b7be1a',
            'photo-1503342217505-b0a15ec3261c',
            'photo-1576566588028-4147f3842f27',
            'photo-1562157873-818bc0726f68',
            'photo-1618354691373-d851c5c3a990',
            'photo-1529374255404-311a2a4f1fd9',
            'photo-1503342452485-86b7f54527ef',
            'photo-1581655353564-df123a1eb820',
            'photo-1591195853828-11db59a44f6b',
            'photo-1565084888279-aca607ecce0c',
            'photo-1517445312882-bc9910d016b7',
            'photo-1508746829417-e6f548d8d6ed',
            'photo-1605518216938-7c31b7b14ad0',
            'photo-1544441893-675973e31985',
            'photo-1596755094514-f87e34085b2c',
            'photo-1598033129183-c4f50c736f10',
            'photo-1604695573706-53170668f6a6',
            'photo-1602810318383-e386cc2a3ccf',
            'photo-1589310243389-96a5483213a8',
            'photo-1607345366928-199ea26cfe3e',
            'photo-1556905055-8f358a7a47b2',
            'photo-1509967419530-da38b4704bc6',
            'photo-1578587018452-892bacefd3f2',
            'photo-1620799140188-3b2a02fd9a77',
            'photo-1515886657613-9f3515b0c78f',
            'photo-1543163521-1bf539c55dd2',
            'photo-1541099649105-f69ad21f3246',
            'photo-1576995853123-5a10305d93c0',
            'photo-1475180098004-ca77a66827be',
            'photo-1584370848010-d7fe6bc767ec',
            'photo-1507679799987-c73779587ccf',
            'photo-1489987707025-afc232f7ea0f',
            'photo-1490481651871-ab68de25d43d',
            'photo-1485230895905-ec40ba36b9bc',
            'photo-1539571696357-5a69c17a67c6',
            'photo-1516826957135-700dedea698c',
            'photo-1594938298603-c8148c4dae35',
            'photo-1593030761757-71fae45fa0e7',
            'photo-1585487000160-6ebcfceb0d03',
            'photo-1505022610485-0249ba5b3675',
            'photo-1592878904946-b3cd8ae243d0',
            'photo-1559582798-678dfc71ccd8',
            'photo-1566737236500-c8ac43014a67',
            'photo-1551028719-00167b16eac5',
            'photo-1509631179647-0177331693ae',
            'photo-1516914943479-89db7d9ae7f2',
            'photo-1492562080023-ab3db95bfbce',
            'photo-1519741497674-611481863552',
            'photo-1517838277536-f5f99be501cd',
            'photo-1571019614242-c5c5dee9f50b',
            'photo-1534438327276-14e5300c3a48',
            'photo-1583454110551-21f2fa2afe61',
            'photo-1584865288642-42078afe6942',
            'photo-1581009146145-b5ef050c2e1e',
            'photo-1574680096145-d05b474e2155',
            'photo-1555689502-c4b22d76c56f',
            'photo-1511556532299-8f662fc26c06',
            'photo-1523381210434-271e8be1f52b',
            'photo-1479064555552-3ef4979f8908',
            'photo-1525507119028-ed4c629a60a3',
            'photo-1552374196-1ab2a1c593e8',
            'photo-1506152983158-b4a74a01c721',
            'photo-1508296695146-257a814070b4',
            'photo-1534528741775-53994a69daeb',
            'photo-1500648767791-00dcc994a43e',
            'photo-1519085360753-af0119f7cbe7',
            'photo-1512436991641-6745cdb1723f',
            'photo-1578932750294-f5075e85f44a',
            'photo-1626497764746-6dc36546b388',
            'photo-1578632767115-351597cf2477',
            'photo-1503341455253-b2e723bb3dbb',
            'photo-1529139574466-a303027c1d8b',
            'photo-1516257984-b1b4d707412e',
            'photo-1520975916090-3105956dac38',
        ];

        $products = Product::orderBy('id', 'asc')->get();

        foreach ($products as $index => $product) {
            $photoId = $photoIds[$index % count($photoIds)];
            $imageUrl = "https://images.unsplash.com/{$photoId}?w=800&auto=format&fit=crop&q=80";

            ProductImage::where('product_id', $product->id)->delete();

            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $imageUrl,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
