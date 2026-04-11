'use client';

import Link from 'next/link';
import { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MegaMenu } from './MegaMenu';
import Image from 'next/image';

interface ChildItem { name: string; href: string; }
interface SubCategory { name: string; href: string; children: ChildItem[]; }
interface Brand { name: string; logo: string; href: string; }
interface NavLink {
  name: string;
  href: string;
  subcategories?: SubCategory[];
  promoImage?: string;
  brands?: Brand[];
}

const navLinks: NavLink[] = [
  {
    name: 'Electronics', href: '/products/category/electronics',
    promoImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=400&fit=crop',
    brands: [
      { name: 'Apple', logo: 'https://logos.hunter.io/apple.com', href: '/products?search=apple' },
      { name: 'Samsung', logo: 'https://logos.hunter.io/samsung.com', href: '/products?search=samsung' },
      { name: 'Sony', logo: 'https://logos.hunter.io/sony.com', href: '/products?search=sony' },
      { name: 'LG', logo: 'https://logos.hunter.io/lg.com', href: '/products?search=lg' },
      { name: 'Bose', logo: 'https://logos.hunter.io/bose.com', href: '/products?search=bose' },
      { name: 'JBL', logo: 'https://logos.hunter.io/jbl.com', href: '/products?search=jbl' },
    ],
    subcategories: [
      { name: 'Smartphones & Accessories', href: '/products/category/smartphones', children: [
        { name: 'Android Phones', href: '/products/category/android-phones' },
        { name: 'iPhones', href: '/products/category/iphones' },
        { name: 'Phone Cases', href: '/products/category/phone-cases' },
        { name: 'Chargers & Cables', href: '/products/category/chargers-and-cables' },
        { name: 'Power Banks', href: '/products/category/power-banks' },
        { name: 'Refurbished Phones', href: '/products/category/refurbished-phones' },
      ]},
      { name: 'Laptops & Computers', href: '/products/category/laptops-computers', children: [
        { name: 'Gaming Laptops', href: '/products/category/gaming-laptops' },
        { name: 'Ultrabooks', href: '/products/category/ultrabooks' },
        { name: 'Desktops', href: '/products/category/desktops' },
        { name: 'Monitors', href: '/products/category/monitors' },
        { name: 'Keyboards & Mice', href: '/products/category/keyboards-and-mice' },
      ]},
      { name: 'Audio & Headphones', href: '/products/category/audio-headphones', children: [
        { name: 'Wireless Earbuds', href: '/products/category/wireless-earbuds' },
        { name: 'Over-Ear Headphones', href: '/products/category/over-ear-headphones' },
        { name: 'Bluetooth Speakers', href: '/products/category/bluetooth-speakers' },
        { name: 'Soundbars', href: '/products/category/soundbars' },
        { name: 'Home Theater Systems', href: '/products/category/home-theater-systems' },
      ]},
      { name: 'Cameras & Photography', href: '/products/category/cameras-photography', children: [
        { name: 'DSLR Cameras', href: '/products/category/dslr-cameras' },
        { name: 'Mirrorless Cameras', href: '/products/category/mirrorless-cameras' },
        { name: 'Action Cameras', href: '/products/category/action-cameras' },
        { name: 'Camera Lenses', href: '/products/category/camera-lenses' },
        { name: 'Tripods & Mounts', href: '/products/category/tripods-and-mounts' },
        { name: 'Memory Cards', href: '/products/category/memory-cards' },
      ]},
      { name: 'Wearable Technology', href: '/products/category/wearable-technology', children: [
        { name: 'Smartwatches', href: '/products/category/smartwatches' },
        { name: 'Fitness Trackers', href: '/products/category/fitness-trackers' },
        { name: 'VR Headsets', href: '/products/category/vr-headsets' },
        { name: 'Smart Glasses', href: '/products/category/smart-glasses' },
      ]},
      { name: 'Gaming', href: '/products/category/gaming', children: [
        { name: 'Gaming Consoles', href: '/products/category/gaming-consoles' },
        { name: 'Gaming Accessories', href: '/products/category/gaming-accessories' },
        { name: 'PC Gaming', href: '/products/category/pc-gaming' },
        { name: 'Gaming Chairs', href: '/products/category/gaming-chairs' },
        { name: 'Video Games', href: '/products/category/video-games' },
      ]},
      { name: 'Smart Home', href: '/products/category/smart-home', children: [
        { name: 'Smart Speakers', href: '/products/category/smart-speakers' },
        { name: 'Smart Lighting', href: '/products/category/smart-lighting' },
        { name: 'Smart Plugs', href: '/products/category/smart-plugs' },
        { name: 'Security Cameras', href: '/products/category/security-cameras' },
        { name: 'Smart Thermostats', href: '/products/category/smart-thermostats' },
      ]},
      { name: 'TVs & Displays', href: '/products/category/tvs-displays', children: [
        { name: 'LED TVs', href: '/products/category/led-tvs' },
        { name: 'OLED TVs', href: '/products/category/oled-tvs' },
        { name: 'QLED TVs', href: '/products/category/qled-tvs' },
        { name: 'Projectors', href: '/products/category/projectors' },
        { name: 'Streaming Devices', href: '/products/category/streaming-devices' },
      ]},
    ],
  },
  {
    name: "Men's Fashion", href: '/products/category/mens-fashion',
    promoImage: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=300&h=400&fit=crop',
    brands: [
      { name: 'Nike', logo: 'https://logos.hunter.io/nike.com', href: '/products?search=nike' },
      { name: 'Adidas', logo: 'https://logos.hunter.io/adidas.com', href: '/products?search=adidas' },
      { name: 'Levi\'s', logo: 'https://logos.hunter.io/levi.com', href: '/products?search=levis' },
      { name: 'Ralph Lauren', logo: 'https://logos.hunter.io/ralphlauren.com', href: '/products?search=ralph+lauren' },
      { name: 'Tommy Hilfiger', logo: 'https://logos.hunter.io/tommy.com', href: '/products?search=tommy+hilfiger' },
      { name: 'Hugo Boss', logo: 'https://logos.hunter.io/hugoboss.com', href: '/products?search=hugo+boss' },
    ],
    subcategories: [
      { name: 'Clothing', href: '/products/category/mens-clothing', children: [
        { name: 'Traditional Wear', href: '/products/category/mens-traditional-wear' },
        { name: 'T-Shirts & Polos', href: '/products/category/mens-tshirts-polos' },
        { name: 'Shirts', href: '/products/category/mens-shirts' },
        { name: 'Pants', href: '/products/category/mens-trousers' },
        { name: 'Jeans', href: '/products/category/mens-jeans' },
        { name: 'Sportswear', href: '/products/category/mens-activewear' },
        { name: 'Jackets & Coats', href: '/products/category/mens-jackets-coats' },
        { name: 'Swimwear', href: '/products/category/mens-swimwear' },
      ]},
      { name: 'Footwear', href: '/products/category/mens-shoes', children: [
        { name: 'Sports Shoes', href: '/products/category/mens-running-shoes' },
        { name: 'Sneakers', href: '/products/category/mens-sneakers' },
        { name: 'Loafers', href: '/products/category/mens-loafers' },
        { name: 'Formal Shoes', href: '/products/category/mens-formal-shoes' },
        { name: 'Arabic Sandals', href: '/products/category/mens-arabic-sandals' },
        { name: 'Boots', href: '/products/category/mens-boots' },
        { name: 'Flip Flops', href: '/products/category/mens-flip-flops' },
        { name: 'Slides', href: '/products/category/mens-slides' },
      ]},
      { name: 'Bags & Accessories', href: '/products/category/mens-accessories', children: [
        { name: 'Backpacks', href: '/products/category/mens-backpacks' },
        { name: 'Wallets', href: '/products/category/mens-wallets' },
        { name: 'Luggage', href: '/products/category/mens-luggage' },
        { name: 'Laptop Bags & Cases', href: '/products/category/mens-laptop-bags' },
        { name: 'Jewelry', href: '/products/category/mens-jewelry' },
        { name: 'Belts', href: '/products/category/mens-belts' },
        { name: 'Watches', href: '/products/category/mens-watches' },
        { name: 'Eyewear', href: '/products/category/mens-sunglasses' },
      ]},
      { name: 'Grooming', href: '/products/category/mens-grooming', children: [
        { name: 'Trimmers & Shavers', href: '/products/category/mens-trimmers-shavers' },
        { name: 'Beard Care', href: '/products/category/mens-beard-care' },
        { name: 'Hair Styling', href: '/products/category/mens-hair-styling' },
        { name: 'Skincare', href: '/products/category/mens-skincare' },
        { name: 'Deodorants', href: '/products/category/mens-deodorants' },
        { name: 'Cologne', href: '/products/category/mens-cologne' },
        { name: 'Shaving Kits', href: '/products/category/mens-shaving-kits' },
        { name: 'Hair Dryers', href: '/products/category/mens-hair-dryers' },
      ]},
    ],
  },
  {
    name: "Women's Fashion", href: '/products/category/womens-fashion',
    promoImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=400&fit=crop',
    brands: [
      { name: 'Zara', logo: 'https://logos.hunter.io/zara.com', href: '/products?search=zara' },
      { name: 'H&M', logo: 'https://logos.hunter.io/hm.com', href: '/products?search=h%26m' },
      { name: 'Gucci', logo: 'https://logos.hunter.io/gucci.com', href: '/products?search=gucci' },
      { name: 'Michael Kors', logo: 'https://logos.hunter.io/michaelkors.com', href: '/products?search=michael+kors' },
      { name: 'Coach', logo: 'https://logos.hunter.io/coach.com', href: '/products?search=coach' },
      { name: 'Victoria\'s Secret', logo: 'https://logos.hunter.io/victoriassecret.com', href: '/products?search=victorias+secret' },
    ],
    subcategories: [
      { name: 'Clothing', href: '/products/category/womens-clothing', children: [
        { name: 'Dresses', href: '/products/category/womens-dresses' },
        { name: 'Tops & Blouses', href: '/products/category/womens-tops-blouses' },
        { name: 'Jeans & Pants', href: '/products/category/womens-jeans-pants' },
        { name: 'Skirts', href: '/products/category/womens-skirts' },
        { name: 'Traditional Wear', href: '/products/category/womens-traditional-wear' },
        { name: 'Jackets & Coats', href: '/products/category/womens-jackets-coats' },
        { name: 'Activewear', href: '/products/category/womens-activewear' },
        { name: 'Lingerie & Sleepwear', href: '/products/category/womens-lingerie-sleepwear' },
        { name: 'Swimwear', href: '/products/category/womens-swimwear' },
      ]},
      { name: 'Shoes', href: '/products/category/womens-shoes', children: [
        { name: 'Heels', href: '/products/category/womens-heels' },
        { name: 'Flats', href: '/products/category/womens-flats' },
        { name: 'Sneakers', href: '/products/category/womens-sneakers' },
        { name: 'Boots', href: '/products/category/womens-boots' },
        { name: 'Sandals', href: '/products/category/womens-sandals' },
        { name: 'Wedges', href: '/products/category/womens-wedges' },
        { name: 'Loafers', href: '/products/category/womens-loafers' },
        { name: 'Flip Flops', href: '/products/category/womens-flip-flops' },
        { name: 'Slides', href: '/products/category/womens-slides' },
      ]},
      { name: 'Bags & Handbags', href: '/products/category/womens-bags', children: [
        { name: 'Tote Bags', href: '/products/category/womens-tote-bags' },
        { name: 'Crossbody Bags', href: '/products/category/womens-crossbody-bags' },
        { name: 'Clutches', href: '/products/category/womens-clutches' },
        { name: 'Backpacks', href: '/products/category/womens-backpacks' },
        { name: 'Shoulder Bags', href: '/products/category/womens-shoulder-bags' },
        { name: 'Wallets', href: '/products/category/womens-wallets' },
        { name: 'Luggage', href: '/products/category/womens-luggage' },
        { name: 'Evening Bags', href: '/products/category/womens-evening-bags' },
      ]},
      { name: 'Jewelry & Accessories', href: '/products/category/womens-jewelry', children: [
        { name: 'Necklaces', href: '/products/category/womens-necklaces' },
        { name: 'Earrings', href: '/products/category/womens-earrings' },
        { name: 'Bracelets', href: '/products/category/womens-bracelets' },
        { name: 'Rings', href: '/products/category/womens-rings' },
        { name: 'Watches', href: '/products/category/womens-watches' },
        { name: 'Belts', href: '/products/category/womens-belts' },
        { name: 'Eyewear', href: '/products/category/womens-sunglasses' },
        { name: 'Scarves & Wraps', href: '/products/category/womens-scarves-wraps' },
        { name: 'Hair Accessories', href: '/products/category/womens-hair-accessories' },
      ]},
    ],
  },
  {
    name: 'Home & Kitchen', href: '/products/category/home-kitchen',
    promoImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=400&fit=crop',
    brands: [
      { name: 'IKEA', logo: 'https://logos.hunter.io/ikea.com', href: '/products?search=ikea' },
      { name: 'KitchenAid', logo: 'https://logos.hunter.io/kitchenaid.com', href: '/products?search=kitchenaid' },
      { name: 'Dyson', logo: 'https://logos.hunter.io/dyson.com', href: '/products?search=dyson' },
      { name: 'Philips', logo: 'https://logos.hunter.io/philips.com', href: '/products?search=philips' },
      { name: 'Cuisinart', logo: 'https://logos.hunter.io/cuisinart.com', href: '/products?search=cuisinart' },
      { name: 'Instant Pot', logo: 'https://logos.hunter.io/instantpot.com', href: '/products?search=instant+pot' },
    ],
    subcategories: [
      { name: 'Kitchen & Dining', href: '/products/category/kitchen-dining', children: [
        { name: 'Cookware Sets', href: '/products/category/cookware-sets' },
        { name: 'Bakeware', href: '/products/category/bakeware' },
        { name: 'Kitchen Utensils', href: '/products/category/kitchen-utensils' },
        { name: 'Dinnerware Sets', href: '/products/category/dinnerware-sets' },
        { name: 'Glassware', href: '/products/category/glassware' },
        { name: 'Cutlery', href: '/products/category/cutlery' },
        { name: 'Food Storage', href: '/products/category/food-storage' },
        { name: 'Small Appliances', href: '/products/category/small-appliances' },
      ]},
      { name: 'Furniture', href: '/products/category/furniture', children: [
        { name: 'Living Room Sets', href: '/products/category/living-room-sets' },
        { name: 'Sofas & Couches', href: '/products/category/sofas-couches' },
        { name: 'Coffee Tables', href: '/products/category/coffee-tables' },
        { name: 'TV Stands', href: '/products/category/tv-stands' },
        { name: 'Bookshelves', href: '/products/category/bookshelves' },
        { name: 'Dining Tables', href: '/products/category/dining-tables' },
        { name: 'Office Desks', href: '/products/category/office-desks' },
        { name: 'Bed Frames', href: '/products/category/bed-frames' },
      ]},
      { name: 'Bedding & Bath', href: '/products/category/bedding-bath', children: [
        { name: 'Bed Sheets', href: '/products/category/bed-sheets' },
        { name: 'Comforters', href: '/products/category/comforters' },
        { name: 'Pillows', href: '/products/category/pillows' },
        { name: 'Mattress Toppers', href: '/products/category/mattress-toppers' },
        { name: 'Bath Towels', href: '/products/category/bath-towels' },
        { name: 'Shower Curtains', href: '/products/category/shower-curtains' },
        { name: 'Bathroom Accessories', href: '/products/category/bathroom-accessories' },
        { name: 'Blankets & Throws', href: '/products/category/blankets-throws' },
      ]},
      { name: 'Home Décor & Lighting', href: '/products/category/home-decor-lighting', children: [
        { name: 'Wall Art', href: '/products/category/wall-art' },
        { name: 'Candles & Holders', href: '/products/category/candles-holders' },
        { name: 'Vases & Flowers', href: '/products/category/vases-flowers' },
        { name: 'Mirrors', href: '/products/category/mirrors' },
        { name: 'Table Lamps', href: '/products/category/table-lamps' },
        { name: 'Floor Lamps', href: '/products/category/floor-lamps' },
        { name: 'Ceiling Lights', href: '/products/category/ceiling-lights' },
        { name: 'String Lights', href: '/products/category/string-lights' },
      ]},
      { name: 'Home Appliances', href: '/products/category/home-appliances', children: [
        { name: 'Vacuum Cleaners', href: '/products/category/vacuum-cleaners' },
        { name: 'Air Purifiers', href: '/products/category/air-purifiers' },
        { name: 'Washing Machines', href: '/products/category/washing-machines' },
        { name: 'Refrigerators', href: '/products/category/refrigerators' },
        { name: 'Dishwashers', href: '/products/category/dishwashers' },
        { name: 'Microwaves', href: '/products/category/microwaves' },
        { name: 'Air Conditioners', href: '/products/category/air-conditioners' },
        { name: 'Water Purifiers', href: '/products/category/water-purifiers' },
      ]},
      { name: 'Storage & Organization', href: '/products/category/storage-organization', children: [
        { name: 'Closet Organizers', href: '/products/category/closet-organizers' },
        { name: 'Storage Bins', href: '/products/category/storage-bins' },
        { name: 'Shoe Racks', href: '/products/category/shoe-racks' },
        { name: 'Hangers', href: '/products/category/hangers' },
        { name: 'Drawer Organizers', href: '/products/category/drawer-organizers' },
        { name: 'Garage Storage', href: '/products/category/garage-storage' },
        { name: 'Laundry Baskets', href: '/products/category/laundry-baskets' },
        { name: 'Shelf Units', href: '/products/category/shelf-units' },
      ]},
      { name: 'Cleaning Supplies', href: '/products/category/cleaning-supplies', children: [
        { name: 'All-Purpose Cleaners', href: '/products/category/all-purpose-cleaners' },
        { name: 'Mops & Brooms', href: '/products/category/mops-brooms' },
        { name: 'Trash Bags', href: '/products/category/trash-bags' },
        { name: 'Disinfectants', href: '/products/category/disinfectants' },
        { name: 'Sponges & Scrubbers', href: '/products/category/sponges-scrubbers' },
        { name: 'Glass Cleaners', href: '/products/category/glass-cleaners' },
        { name: 'Dusters', href: '/products/category/dusters' },
        { name: 'Cleaning Gloves', href: '/products/category/cleaning-gloves' },
      ]},
    ],
  },
  {
    name: 'Beauty & Health', href: '/products/category/beauty-health',
    promoImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=400&fit=crop',
    brands: [
      { name: "L'Oréal", logo: 'https://logos.hunter.io/loreal.com', href: '/products?search=loreal' },
      { name: 'Maybelline', logo: 'https://logos.hunter.io/maybelline.com', href: '/products?search=maybelline' },
      { name: 'Nivea', logo: 'https://logos.hunter.io/nivea.com', href: '/products?search=nivea' },
      { name: 'Dove', logo: 'https://logos.hunter.io/dove.com', href: '/products?search=dove' },
      { name: 'Neutrogena', logo: 'https://logos.hunter.io/neutrogena.com', href: '/products?search=neutrogena' },
      { name: 'Olay', logo: 'https://logos.hunter.io/olay.com', href: '/products?search=olay' },
    ],
    subcategories: [
      { name: 'Skincare', href: '/products/category/skincare', children: [
        { name: 'Moisturizers', href: '/products/category/moisturizers' },
        { name: 'Serums', href: '/products/category/serums' },
        { name: 'Sunscreen', href: '/products/category/sunscreen' },
        { name: 'Face Wash', href: '/products/category/face-wash' },
        { name: 'Toners', href: '/products/category/toners' },
        { name: 'Eye Cream', href: '/products/category/eye-cream' },
        { name: 'Face Masks', href: '/products/category/face-masks' },
        { name: 'Lip Care', href: '/products/category/lip-care' },
      ]},
      { name: 'Makeup', href: '/products/category/makeup', children: [
        { name: 'Foundation', href: '/products/category/foundation' },
        { name: 'Lipstick', href: '/products/category/lipstick' },
        { name: 'Mascara', href: '/products/category/mascara' },
        { name: 'Eyeshadow', href: '/products/category/eyeshadow' },
        { name: 'Blush', href: '/products/category/blush' },
        { name: 'Concealer', href: '/products/category/concealer' },
        { name: 'Makeup Brushes', href: '/products/category/makeup-brushes' },
        { name: 'Setting Spray', href: '/products/category/setting-spray' },
      ]},
      { name: 'Hair Care', href: '/products/category/hair-care', children: [
        { name: 'Shampoo', href: '/products/category/shampoo' },
        { name: 'Conditioner', href: '/products/category/conditioner' },
        { name: 'Hair Oil', href: '/products/category/hair-oil' },
        { name: 'Hair Masks', href: '/products/category/hair-masks' },
        { name: 'Styling Products', href: '/products/category/styling-products' },
        { name: 'Hair Dryers', href: '/products/category/hair-dryers' },
        { name: 'Straighteners', href: '/products/category/straighteners' },
        { name: 'Curling Irons', href: '/products/category/curling-irons' },
      ]},
      { name: 'Fragrances', href: '/products/category/fragrances', children: [
        { name: "Women's Perfume", href: '/products/category/womens-perfume' },
        { name: "Men's Cologne", href: '/products/category/mens-cologne' },
        { name: 'Unisex Fragrances', href: '/products/category/unisex-fragrances' },
        { name: 'Body Mists', href: '/products/category/body-mists' },
        { name: 'Gift Sets', href: '/products/category/fragrance-gift-sets' },
        { name: 'Perfume Sets', href: '/products/category/perfume-sets' },
        { name: 'Travel Size', href: '/products/category/travel-size-fragrances' },
        { name: 'Attar & Oud', href: '/products/category/attar-oud' },
      ]},
      { name: 'Bath & Body', href: '/products/category/bath-body', children: [
        { name: 'Body Wash', href: '/products/category/body-wash' },
        { name: 'Body Lotion', href: '/products/category/body-lotion' },
        { name: 'Deodorants', href: '/products/category/deodorants' },
        { name: 'Hand Cream', href: '/products/category/hand-cream' },
        { name: 'Shower Gel', href: '/products/category/shower-gel' },
        { name: 'Body Scrubs', href: '/products/category/body-scrubs' },
      ]},
      { name: 'Health & Wellness', href: '/products/category/health-wellness', children: [
        { name: 'Vitamins & Supplements', href: '/products/category/vitamins-supplements' },
        { name: 'First Aid', href: '/products/category/first-aid' },
        { name: 'Medical Devices', href: '/products/category/medical-devices' },
        { name: 'Protein & Fitness', href: '/products/category/protein-fitness' },
        { name: 'Oral Care', href: '/products/category/oral-care' },
        { name: 'Personal Hygiene', href: '/products/category/personal-hygiene' },
      ]},
    ],
  },
  {
    name: 'Sports & Outdoors', href: '/products/category/sports-outdoors',
    promoImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop',
    brands: [
      { name: 'Nike', logo: 'https://logos.hunter.io/nike.com', href: '/products?search=nike' },
      { name: 'Adidas', logo: 'https://logos.hunter.io/adidas.com', href: '/products?search=adidas' },
      { name: 'Under Armour', logo: 'https://logos.hunter.io/underarmour.com', href: '/products?search=under+armour' },
      { name: 'Puma', logo: 'https://logos.hunter.io/puma.com', href: '/products?search=puma' },
      { name: 'The North Face', logo: 'https://logos.hunter.io/thenorthface.com', href: '/products?search=north+face' },
      { name: 'Columbia', logo: 'https://logos.hunter.io/columbia.com', href: '/products?search=columbia' },
    ],
    subcategories: [
      { name: 'Exercise & Fitness', href: '/products/category/exercise-fitness', children: [
        { name: 'Dumbbells', href: '/products/category/dumbbells' },
        { name: 'Yoga Mats', href: '/products/category/yoga-mats' },
        { name: 'Resistance Bands', href: '/products/category/resistance-bands' },
        { name: 'Treadmills', href: '/products/category/treadmills' },
        { name: 'Exercise Bikes', href: '/products/category/exercise-bikes' },
        { name: 'Jump Ropes', href: '/products/category/jump-ropes' },
        { name: 'Kettlebells', href: '/products/category/kettlebells' },
        { name: 'Foam Rollers', href: '/products/category/foam-rollers' },
      ]},
      { name: 'Outdoor Recreation', href: '/products/category/outdoor-recreation', children: [
        { name: 'Camping Tents', href: '/products/category/camping-tents' },
        { name: 'Sleeping Bags', href: '/products/category/sleeping-bags' },
        { name: 'Hiking Backpacks', href: '/products/category/hiking-backpacks' },
        { name: 'Camping Chairs', href: '/products/category/camping-chairs' },
        { name: 'Coolers', href: '/products/category/coolers' },
        { name: 'Flashlights', href: '/products/category/flashlights' },
        { name: 'Binoculars', href: '/products/category/binoculars' },
        { name: 'Fishing Gear', href: '/products/category/fishing-gear' },
      ]},
      { name: 'Team Sports', href: '/products/category/team-sports', children: [
        { name: 'Soccer', href: '/products/category/soccer' },
        { name: 'Basketball', href: '/products/category/basketball' },
        { name: 'Baseball', href: '/products/category/baseball' },
        { name: 'Football', href: '/products/category/football' },
        { name: 'Tennis', href: '/products/category/tennis' },
        { name: 'Volleyball', href: '/products/category/volleyball' },
        { name: 'Cricket', href: '/products/category/cricket' },
        { name: 'Golf', href: '/products/category/golf' },
      ]},
      { name: 'Sportswear', href: '/products/category/sportswear', children: [
        { name: 'Compression Wear', href: '/products/category/compression-wear' },
        { name: 'Sports Bras', href: '/products/category/sports-bras' },
        { name: 'Running Shorts', href: '/products/category/running-shorts' },
        { name: 'Jerseys', href: '/products/category/jerseys' },
        { name: 'Track Pants', href: '/products/category/track-pants' },
        { name: 'Athletic Socks', href: '/products/category/athletic-socks' },
      ]},
      { name: 'Water Sports', href: '/products/category/water-sports', children: [
        { name: 'Swimming Goggles', href: '/products/category/swimming-goggles' },
        { name: 'Swimwear', href: '/products/category/sports-swimwear' },
        { name: 'Surfboards', href: '/products/category/surfboards' },
        { name: 'Kayaking', href: '/products/category/kayaking' },
        { name: 'Snorkeling', href: '/products/category/snorkeling' },
        { name: 'Life Jackets', href: '/products/category/life-jackets' },
      ]},
      { name: 'Cycling', href: '/products/category/cycling', children: [
        { name: 'Bicycles', href: '/products/category/bicycles' },
        { name: 'Helmets', href: '/products/category/cycling-helmets' },
        { name: 'Cycling Gloves', href: '/products/category/cycling-gloves' },
        { name: 'Bike Lights', href: '/products/category/bike-lights' },
        { name: 'Bike Locks', href: '/products/category/bike-locks' },
        { name: 'Cycling Jerseys', href: '/products/category/cycling-jerseys' },
      ]},
    ],
  },
  {
    name: 'Toys & Games', href: '/products/category/toys-games',
    promoImage: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=400&fit=crop',
    brands: [
      { name: 'LEGO', logo: 'https://logos.hunter.io/lego.com', href: '/products?search=lego' },
      { name: 'Hasbro', logo: 'https://logos.hunter.io/hasbro.com', href: '/products?search=hasbro' },
      { name: 'Mattel', logo: 'https://logos.hunter.io/mattel.com', href: '/products?search=mattel' },
      { name: 'Nintendo', logo: 'https://logos.hunter.io/nintendo.com', href: '/products?search=nintendo' },
      { name: 'Nerf', logo: 'https://logos.hunter.io/nerf.com', href: '/products?search=nerf' },
      { name: 'Fisher-Price', logo: 'https://logos.hunter.io/fisher-price.com', href: '/products?search=fisher+price' },
    ],
    subcategories: [
      { name: 'Building Toys', href: '/products/category/toys-games', children: [
        { name: 'LEGO Sets', href: '/products/category/toys-games' },
        { name: 'Magnetic Tiles', href: '/products/category/toys-games' },
        { name: 'Building Blocks', href: '/products/category/toys-games' },
        { name: 'Model Kits', href: '/products/category/toys-games' },
        { name: 'Construction Sets', href: '/products/category/toys-games' },
      ]},
      { name: 'Board Games & Puzzles', href: '/products/category/toys-games', children: [
        { name: 'Strategy Games', href: '/products/category/toys-games' },
        { name: 'Family Games', href: '/products/category/toys-games' },
        { name: 'Card Games', href: '/products/category/toys-games' },
        { name: 'Jigsaw Puzzles', href: '/products/category/toys-games' },
        { name: 'Trivia Games', href: '/products/category/toys-games' },
      ]},
      { name: 'Action Figures & Dolls', href: '/products/category/toys-games', children: [
        { name: 'Action Figures', href: '/products/category/toys-games' },
        { name: 'Barbie Dolls', href: '/products/category/toys-games' },
        { name: 'Collectible Figures', href: '/products/category/toys-games' },
        { name: 'Playsets', href: '/products/category/toys-games' },
        { name: 'Stuffed Animals', href: '/products/category/toys-games' },
      ]},
      { name: 'Outdoor Play', href: '/products/category/toys-games', children: [
        { name: 'Ride-On Toys', href: '/products/category/toys-games' },
        { name: 'Water Toys', href: '/products/category/toys-games' },
        { name: 'Trampolines', href: '/products/category/toys-games' },
        { name: 'Swing Sets', href: '/products/category/toys-games' },
        { name: 'Sand & Water Tables', href: '/products/category/toys-games' },
      ]},
      { name: 'Educational Toys', href: '/products/category/toys-games', children: [
        { name: 'STEM Toys', href: '/products/category/toys-games' },
        { name: 'Learning Tablets', href: '/products/category/toys-games' },
        { name: 'Science Kits', href: '/products/category/toys-games' },
        { name: 'Coding Toys', href: '/products/category/toys-games' },
        { name: 'Art & Craft Kits', href: '/products/category/toys-games' },
      ]},
      { name: 'Video Games', href: '/products/category/toys-games', children: [
        { name: 'PlayStation Games', href: '/products/category/toys-games' },
        { name: 'Xbox Games', href: '/products/category/toys-games' },
        { name: 'Nintendo Games', href: '/products/category/toys-games' },
        { name: 'PC Games', href: '/products/category/toys-games' },
        { name: 'Gaming Accessories', href: '/products/category/toys-games' },
      ]},
      { name: 'Baby & Toddler Toys', href: '/products/category/toys-games', children: [
        { name: 'Rattles & Teethers', href: '/products/category/toys-games' },
        { name: 'Stacking Toys', href: '/products/category/toys-games' },
        { name: 'Musical Toys', href: '/products/category/toys-games' },
        { name: 'Push & Pull Toys', href: '/products/category/toys-games' },
        { name: 'Bath Toys', href: '/products/category/toys-games' },
      ]},
      { name: 'Remote Control', href: '/products/category/toys-games', children: [
        { name: 'RC Cars', href: '/products/category/toys-games' },
        { name: 'RC Drones', href: '/products/category/toys-games' },
        { name: 'RC Helicopters', href: '/products/category/toys-games' },
        { name: 'RC Boats', href: '/products/category/toys-games' },
        { name: 'RC Robots', href: '/products/category/toys-games' },
      ]},
    ],
  },
  {
    name: 'Books', href: '/products/category/books',
    promoImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    brands: [
      { name: 'Penguin', logo: 'https://logos.hunter.io/penguin.co.uk', href: '/products?search=penguin' },
      { name: 'HarperCollins', logo: 'https://logos.hunter.io/harpercollins.com', href: '/products?search=harpercollins' },
      { name: 'Simon & Schuster', logo: 'https://logos.hunter.io/simonandschuster.com', href: '/products?search=simon+schuster' },
      { name: 'Hachette', logo: 'https://logos.hunter.io/hachette.com', href: '/products?search=hachette' },
      { name: 'Scholastic', logo: 'https://logos.hunter.io/scholastic.com', href: '/products?search=scholastic' },
      { name: 'Wiley', logo: 'https://logos.hunter.io/wiley.com', href: '/products?search=wiley' },
    ],
    subcategories: [
      { name: 'Fiction', href: '/products/category/books', children: [
        { name: 'Literary Fiction', href: '/products/category/books' },
        { name: 'Mystery & Thriller', href: '/products/category/books' },
        { name: 'Science Fiction', href: '/products/category/books' },
        { name: 'Fantasy', href: '/products/category/books' },
        { name: 'Romance', href: '/products/category/books' },
        { name: 'Historical Fiction', href: '/products/category/books' },
      ]},
      { name: 'Non-Fiction', href: '/products/category/books', children: [
        { name: 'Biography & Memoir', href: '/products/category/books' },
        { name: 'Self-Help', href: '/products/category/books' },
        { name: 'Business & Finance', href: '/products/category/books' },
        { name: 'History', href: '/products/category/books' },
        { name: 'Science & Nature', href: '/products/category/books' },
        { name: 'Religion & Spirituality', href: '/products/category/books' },
        { name: 'True Crime', href: '/products/category/books' },
      ]},
      { name: "Children's Books", href: '/products/category/books', children: [
        { name: 'Picture Books', href: '/products/category/books' },
        { name: 'Early Readers', href: '/products/category/books' },
        { name: 'Middle Grade', href: '/products/category/books' },
        { name: 'Young Adult', href: '/products/category/books' },
        { name: 'Activity Books', href: '/products/category/books' },
      ]},
      { name: 'Textbooks & Education', href: '/products/category/books', children: [
        { name: 'College Textbooks', href: '/products/category/books' },
        { name: 'Study Guides', href: '/products/category/books' },
        { name: 'Reference Books', href: '/products/category/books' },
        { name: 'Test Prep', href: '/products/category/books' },
        { name: 'Language Learning', href: '/products/category/books' },
      ]},
      { name: 'Comics & Graphic Novels', href: '/products/category/books', children: [
        { name: 'Manga', href: '/products/category/books' },
        { name: 'Superhero Comics', href: '/products/category/books' },
        { name: 'Graphic Memoirs', href: '/products/category/books' },
        { name: 'Indie Comics', href: '/products/category/books' },
      ]},
      { name: 'Cookbooks & Food', href: '/products/category/books', children: [
        { name: 'Baking', href: '/products/category/books' },
        { name: 'Healthy Cooking', href: '/products/category/books' },
        { name: 'International Cuisine', href: '/products/category/books' },
        { name: 'Quick & Easy', href: '/products/category/books' },
        { name: 'Vegetarian & Vegan', href: '/products/category/books' },
      ]},
      { name: 'Audiobooks & E-Books', href: '/products/category/books', children: [
        { name: 'Bestseller Audiobooks', href: '/products/category/books' },
        { name: 'Fiction Audiobooks', href: '/products/category/books' },
        { name: 'Non-Fiction Audiobooks', href: '/products/category/books' },
        { name: 'Kindle Books', href: '/products/category/books' },
        { name: 'Podcasts & Originals', href: '/products/category/books' },
      ]},
    ],
  },
  {
    name: 'Automotive', href: '/products/category/automotive',
    promoImage: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=300&h=400&fit=crop',
    brands: [
      { name: 'Bosch', logo: 'https://logos.hunter.io/bosch.com', href: '/products?search=bosch' },
      { name: 'Michelin', logo: 'https://logos.hunter.io/michelin.com', href: '/products?search=michelin' },
      { name: 'Castrol', logo: 'https://logos.hunter.io/castrol.com', href: '/products?search=castrol' },
      { name: '3M', logo: 'https://logos.hunter.io/3m.com', href: '/products?search=3m' },
      { name: 'Meguiars', logo: 'https://logos.hunter.io/meguiars.com', href: '/products?search=meguiars' },
      { name: 'Garmin', logo: 'https://logos.hunter.io/garmin.com', href: '/products?search=garmin' },
    ],
    subcategories: [
      { name: 'Car Care', href: '/products/category/automotive', children: [
        { name: 'Car Wash & Wax', href: '/products/category/automotive' },
        { name: 'Interior Cleaners', href: '/products/category/automotive' },
        { name: 'Polishes & Compounds', href: '/products/category/automotive' },
        { name: 'Microfiber Towels', href: '/products/category/automotive' },
        { name: 'Detailing Kits', href: '/products/category/automotive' },
      ]},
      { name: 'Interior Accessories', href: '/products/category/automotive', children: [
        { name: 'Seat Covers', href: '/products/category/automotive' },
        { name: 'Floor Mats', href: '/products/category/automotive' },
        { name: 'Steering Wheel Covers', href: '/products/category/automotive' },
        { name: 'Phone Mounts', href: '/products/category/automotive' },
        { name: 'Dash Cameras', href: '/products/category/automotive' },
      ]},
      { name: 'Exterior Accessories', href: '/products/category/automotive', children: [
        { name: 'Car Covers', href: '/products/category/automotive' },
        { name: 'Roof Racks', href: '/products/category/automotive' },
        { name: 'Mud Flaps', href: '/products/category/automotive' },
        { name: 'LED Lights', href: '/products/category/automotive' },
        { name: 'Towing Equipment', href: '/products/category/automotive' },
      ]},
      { name: 'Tools & Equipment', href: '/products/category/automotive', children: [
        { name: 'Jump Starters', href: '/products/category/automotive' },
        { name: 'Tire Inflators', href: '/products/category/automotive' },
        { name: 'Jack Stands', href: '/products/category/automotive' },
        { name: 'OBD Scanners', href: '/products/category/automotive' },
        { name: 'Tool Sets', href: '/products/category/automotive' },
      ]},
      { name: 'Oils & Fluids', href: '/products/category/automotive', children: [
        { name: 'Motor Oil', href: '/products/category/automotive' },
        { name: 'Brake Fluid', href: '/products/category/automotive' },
        { name: 'Coolant', href: '/products/category/automotive' },
        { name: 'Transmission Fluid', href: '/products/category/automotive' },
        { name: 'Windshield Washer', href: '/products/category/automotive' },
      ]},
      { name: 'Tires & Wheels', href: '/products/category/automotive', children: [
        { name: 'All-Season Tires', href: '/products/category/automotive' },
        { name: 'Performance Tires', href: '/products/category/automotive' },
        { name: 'Alloy Wheels', href: '/products/category/automotive' },
        { name: 'Tire Pressure Gauges', href: '/products/category/automotive' },
        { name: 'Wheel Locks', href: '/products/category/automotive' },
      ]},
    ],
  },
  {
    name: 'Pet Supplies', href: '/products/category/pet-supplies',
    promoImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=400&fit=crop',
    brands: [
      { name: 'Royal Canin', logo: 'https://logos.hunter.io/royalcanin.com', href: '/products?search=royal+canin' },
      { name: 'Purina', logo: 'https://logos.hunter.io/purina.com', href: '/products?search=purina' },
      { name: 'Blue Buffalo', logo: 'https://logos.hunter.io/bluebuffalo.com', href: '/products?search=blue+buffalo' },
      { name: 'KONG', logo: 'https://logos.hunter.io/kongcompany.com', href: '/products?search=kong' },
      { name: 'Pedigree', logo: 'https://logos.hunter.io/pedigree.com', href: '/products?search=pedigree' },
      { name: 'Whiskas', logo: 'https://logos.hunter.io/whiskas.com', href: '/products?search=whiskas' },
    ],
    subcategories: [
      { name: 'Dog Supplies', href: '/products/category/pet-supplies', children: [
        { name: 'Dog Food', href: '/products/category/pet-supplies' },
        { name: 'Dog Treats', href: '/products/category/pet-supplies' },
        { name: 'Dog Toys', href: '/products/category/pet-supplies' },
        { name: 'Collars & Leashes', href: '/products/category/pet-supplies' },
        { name: 'Dog Beds', href: '/products/category/pet-supplies' },
        { name: 'Grooming Supplies', href: '/products/category/pet-supplies' },
      ]},
      { name: 'Cat Supplies', href: '/products/category/pet-supplies', children: [
        { name: 'Cat Food', href: '/products/category/pet-supplies' },
        { name: 'Cat Litter', href: '/products/category/pet-supplies' },
        { name: 'Cat Toys', href: '/products/category/pet-supplies' },
        { name: 'Scratching Posts', href: '/products/category/pet-supplies' },
        { name: 'Cat Beds', href: '/products/category/pet-supplies' },
        { name: 'Cat Trees', href: '/products/category/pet-supplies' },
      ]},
      { name: 'Fish & Aquatics', href: '/products/category/pet-supplies', children: [
        { name: 'Aquariums', href: '/products/category/pet-supplies' },
        { name: 'Fish Food', href: '/products/category/pet-supplies' },
        { name: 'Filters & Pumps', href: '/products/category/pet-supplies' },
        { name: 'Decorations', href: '/products/category/pet-supplies' },
        { name: 'Water Treatment', href: '/products/category/pet-supplies' },
      ]},
      { name: 'Bird Supplies', href: '/products/category/pet-supplies', children: [
        { name: 'Bird Cages', href: '/products/category/pet-supplies' },
        { name: 'Bird Food', href: '/products/category/pet-supplies' },
        { name: 'Perches & Toys', href: '/products/category/pet-supplies' },
        { name: 'Nesting Boxes', href: '/products/category/pet-supplies' },
      ]},
      { name: 'Small Animals', href: '/products/category/pet-supplies', children: [
        { name: 'Hamster Supplies', href: '/products/category/pet-supplies' },
        { name: 'Rabbit Supplies', href: '/products/category/pet-supplies' },
        { name: 'Guinea Pig Supplies', href: '/products/category/pet-supplies' },
        { name: 'Habitats & Cages', href: '/products/category/pet-supplies' },
        { name: 'Bedding & Litter', href: '/products/category/pet-supplies' },
      ]},
      { name: 'Pet Health', href: '/products/category/pet-supplies', children: [
        { name: 'Flea & Tick', href: '/products/category/pet-supplies' },
        { name: 'Vitamins & Supplements', href: '/products/category/pet-supplies' },
        { name: 'Dental Care', href: '/products/category/pet-supplies' },
        { name: 'First Aid', href: '/products/category/pet-supplies' },
        { name: 'Calming Aids', href: '/products/category/pet-supplies' },
      ]},
    ],
  },
  {
    name: 'Office Products', href: '/products/category/office-products',
    promoImage: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&h=400&fit=crop',
    brands: [
      { name: 'HP', logo: 'https://logos.hunter.io/hp.com', href: '/products?search=hp' },
      { name: 'Logitech', logo: 'https://logos.hunter.io/logitech.com', href: '/products?search=logitech' },
      { name: 'Brother', logo: 'https://logos.hunter.io/brother.com', href: '/products?search=brother' },
      { name: 'Staples', logo: 'https://logos.hunter.io/staples.com', href: '/products?search=staples' },
      { name: 'Sharpie', logo: 'https://logos.hunter.io/sharpie.com', href: '/products?search=sharpie' },
      { name: 'Post-it', logo: 'https://logos.hunter.io/post-it.com', href: '/products?search=post-it' },
    ],
    subcategories: [
      { name: 'Office Furniture', href: '/products/category/office-products', children: [
        { name: 'Office Desks', href: '/products/category/office-products' },
        { name: 'Office Chairs', href: '/products/category/office-products' },
        { name: 'Standing Desks', href: '/products/category/office-products' },
        { name: 'Bookshelves', href: '/products/category/office-products' },
        { name: 'Filing Cabinets', href: '/products/category/office-products' },
      ]},
      { name: 'Office Supplies', href: '/products/category/office-products', children: [
        { name: 'Pens & Pencils', href: '/products/category/office-products' },
        { name: 'Notebooks', href: '/products/category/office-products' },
        { name: 'Sticky Notes', href: '/products/category/office-products' },
        { name: 'Tape & Adhesives', href: '/products/category/office-products' },
        { name: 'Staplers & Clips', href: '/products/category/office-products' },
      ]},
      { name: 'Printers & Ink', href: '/products/category/office-products', children: [
        { name: 'Laser Printers', href: '/products/category/office-products' },
        { name: 'Inkjet Printers', href: '/products/category/office-products' },
        { name: 'Ink Cartridges', href: '/products/category/office-products' },
        { name: 'Toner', href: '/products/category/office-products' },
        { name: 'Printer Paper', href: '/products/category/office-products' },
      ]},
      { name: 'Technology', href: '/products/category/office-products', children: [
        { name: 'Keyboards', href: '/products/category/office-products' },
        { name: 'Mice', href: '/products/category/office-products' },
        { name: 'Webcams', href: '/products/category/office-products' },
        { name: 'Monitors', href: '/products/category/office-products' },
        { name: 'USB Hubs', href: '/products/category/office-products' },
      ]},
      { name: 'Organization', href: '/products/category/office-products', children: [
        { name: 'Desk Organizers', href: '/products/category/office-products' },
        { name: 'Label Makers', href: '/products/category/office-products' },
        { name: 'Folders & Binders', href: '/products/category/office-products' },
        { name: 'Storage Boxes', href: '/products/category/office-products' },
        { name: 'Whiteboards', href: '/products/category/office-products' },
      ]},
      { name: 'Shipping & Mailing', href: '/products/category/office-products', children: [
        { name: 'Packing Tape', href: '/products/category/office-products' },
        { name: 'Bubble Wrap', href: '/products/category/office-products' },
        { name: 'Envelopes', href: '/products/category/office-products' },
        { name: 'Shipping Labels', href: '/products/category/office-products' },
        { name: 'Boxes', href: '/products/category/office-products' },
      ]},
    ],
  },
  {
    name: 'Garden', href: '/products/category/garden',
    promoImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=400&fit=crop',
    brands: [
      { name: 'Scotts', logo: 'https://logos.hunter.io/scotts.com', href: '/products?search=scotts' },
      { name: 'Fiskars', logo: 'https://logos.hunter.io/fiskars.com', href: '/products?search=fiskars' },
      { name: 'Miracle-Gro', logo: 'https://logos.hunter.io/miraclegro.com', href: '/products?search=miracle+gro' },
      { name: 'Weber', logo: 'https://logos.hunter.io/weber.com', href: '/products?search=weber' },
      { name: 'Husqvarna', logo: 'https://logos.hunter.io/husqvarna.com', href: '/products?search=husqvarna' },
      { name: 'DeWalt', logo: 'https://logos.hunter.io/dewalt.com', href: '/products?search=dewalt' },
    ],
    subcategories: [
      { name: 'Plants & Seeds', href: '/products/category/garden', children: [
        { name: 'Flower Seeds', href: '/products/category/garden' },
        { name: 'Vegetable Seeds', href: '/products/category/garden' },
        { name: 'Indoor Plants', href: '/products/category/garden' },
        { name: 'Outdoor Plants', href: '/products/category/garden' },
        { name: 'Succulents', href: '/products/category/garden' },
        { name: 'Herb Gardens', href: '/products/category/garden' },
      ]},
      { name: 'Garden Tools', href: '/products/category/garden', children: [
        { name: 'Pruning Shears', href: '/products/category/garden' },
        { name: 'Shovels & Spades', href: '/products/category/garden' },
        { name: 'Rakes', href: '/products/category/garden' },
        { name: 'Garden Hoses', href: '/products/category/garden' },
        { name: 'Wheelbarrows', href: '/products/category/garden' },
        { name: 'Gloves', href: '/products/category/garden' },
      ]},
      { name: 'Lawn Care', href: '/products/category/garden', children: [
        { name: 'Lawn Mowers', href: '/products/category/garden' },
        { name: 'Grass Seed', href: '/products/category/garden' },
        { name: 'Fertilizers', href: '/products/category/garden' },
        { name: 'Weed Control', href: '/products/category/garden' },
        { name: 'Sprinklers', href: '/products/category/garden' },
      ]},
      { name: 'Outdoor Living', href: '/products/category/garden', children: [
        { name: 'Patio Furniture', href: '/products/category/garden' },
        { name: 'Grills & BBQ', href: '/products/category/garden' },
        { name: 'Outdoor Lighting', href: '/products/category/garden' },
        { name: 'Fire Pits', href: '/products/category/garden' },
        { name: 'Hammocks', href: '/products/category/garden' },
      ]},
      { name: 'Pots & Planters', href: '/products/category/garden', children: [
        { name: 'Ceramic Pots', href: '/products/category/garden' },
        { name: 'Hanging Planters', href: '/products/category/garden' },
        { name: 'Raised Garden Beds', href: '/products/category/garden' },
        { name: 'Window Boxes', href: '/products/category/garden' },
        { name: 'Self-Watering Pots', href: '/products/category/garden' },
      ]},
      { name: 'Pest Control', href: '/products/category/garden', children: [
        { name: 'Insect Repellent', href: '/products/category/garden' },
        { name: 'Rodent Control', href: '/products/category/garden' },
        { name: 'Netting & Barriers', href: '/products/category/garden' },
        { name: 'Organic Pest Control', href: '/products/category/garden' },
        { name: 'Bug Zappers', href: '/products/category/garden' },
      ]},
    ],
  },
  {
    name: 'Baby & Kids',
    href: '/products/category/baby-kids',
    promoImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=500&fit=crop',
    brands: [
      { name: 'Pampers', logo: 'https://logos.hunter.io/pampers.com', href: '/products/category/baby-kids' },
      { name: 'Huggies', logo: 'https://logos.hunter.io/huggies.com', href: '/products/category/baby-kids' },
      { name: 'Chicco', logo: 'https://logos.hunter.io/chicco.com', href: '/products/category/baby-kids' },
      { name: 'Graco', logo: 'https://logos.hunter.io/graco.com', href: '/products/category/baby-kids' },
      { name: 'Fisher-Price', logo: 'https://logos.hunter.io/fisher-price.com', href: '/products/category/baby-kids' },
      { name: 'Philips Avent', logo: 'https://logos.hunter.io/philips.com', href: '/products/category/baby-kids' },
    ],
    subcategories: [
      { name: 'Diapering', href: '/products/category/baby-kids', children: [
        { name: 'Disposable Diapers', href: '/products/category/baby-kids' },
        { name: 'Cloth Diapers', href: '/products/category/baby-kids' },
        { name: 'Diaper Bags', href: '/products/category/baby-kids' },
        { name: 'Wipes & Refills', href: '/products/category/baby-kids' },
        { name: 'Changing Mats', href: '/products/category/baby-kids' },
        { name: 'Diaper Rash Cream', href: '/products/category/baby-kids' },
      ]},
      { name: 'Feeding', href: '/products/category/baby-kids', children: [
        { name: 'Bottles & Nipples', href: '/products/category/baby-kids' },
        { name: 'Breast Pumps', href: '/products/category/baby-kids' },
        { name: 'Baby Formula', href: '/products/category/baby-kids' },
        { name: 'High Chairs', href: '/products/category/baby-kids' },
        { name: 'Bibs & Burp Cloths', href: '/products/category/baby-kids' },
        { name: 'Baby Food & Snacks', href: '/products/category/baby-kids' },
      ]},
      { name: 'Strollers & Car Seats', href: '/products/category/baby-kids', children: [
        { name: 'Strollers', href: '/products/category/baby-kids' },
        { name: 'Car Seats', href: '/products/category/baby-kids' },
        { name: 'Travel Systems', href: '/products/category/baby-kids' },
        { name: 'Stroller Accessories', href: '/products/category/baby-kids' },
        { name: 'Baby Carriers', href: '/products/category/baby-kids' },
      ]},
      { name: 'Nursery Furniture', href: '/products/category/baby-kids', children: [
        { name: 'Cribs & Bassinets', href: '/products/category/baby-kids' },
        { name: 'Changing Tables', href: '/products/category/baby-kids' },
        { name: 'Rocking Chairs', href: '/products/category/baby-kids' },
        { name: 'Baby Mattresses', href: '/products/category/baby-kids' },
        { name: 'Storage & Organization', href: '/products/category/baby-kids' },
      ]},
      { name: 'Baby Clothing', href: '/products/category/baby-kids', children: [
        { name: 'Bodysuits & Rompers', href: '/products/category/baby-kids' },
        { name: 'Sleepwear', href: '/products/category/baby-kids' },
        { name: 'Outerwear', href: '/products/category/baby-kids' },
        { name: 'Socks & Shoes', href: '/products/category/baby-kids' },
        { name: 'Swimwear', href: '/products/category/baby-kids' },
      ]},
      { name: 'Baby Health & Safety', href: '/products/category/baby-kids', children: [
        { name: 'Baby Monitors', href: '/products/category/baby-kids' },
        { name: 'Baby Gates', href: '/products/category/baby-kids' },
        { name: 'Thermometers', href: '/products/category/baby-kids' },
        { name: 'Outlet Covers', href: '/products/category/baby-kids' },
        { name: 'Baby Skincare', href: '/products/category/baby-kids' },
        { name: 'Grooming Kits', href: '/products/category/baby-kids' },
      ]},
      { name: 'Kids\' Clothing', href: '/products/category/baby-kids', children: [
        { name: 'Boys\' Clothing', href: '/products/category/baby-kids' },
        { name: 'Girls\' Clothing', href: '/products/category/baby-kids' },
        { name: 'School Uniforms', href: '/products/category/baby-kids' },
        { name: 'Kids\' Shoes', href: '/products/category/baby-kids' },
        { name: 'Kids\' Accessories', href: '/products/category/baby-kids' },
      ]},
      { name: 'Bath & Potty', href: '/products/category/baby-kids', children: [
        { name: 'Baby Bathtubs', href: '/products/category/baby-kids' },
        { name: 'Baby Shampoo & Wash', href: '/products/category/baby-kids' },
        { name: 'Potty Training', href: '/products/category/baby-kids' },
        { name: 'Towels & Washcloths', href: '/products/category/baby-kids' },
        { name: 'Bath Toys', href: '/products/category/baby-kids' },
      ]},
    ],
  },
  {
    name: 'Grocery & Gourmet',
    href: '/products/category/grocery-gourmet',
    promoImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=500&fit=crop',
    brands: [
      { name: 'Nestlé', logo: 'https://logos.hunter.io/nestle.com', href: '/products/category/grocery-gourmet' },
      { name: 'Kellogg\'s', logo: 'https://logos.hunter.io/kelloggs.com', href: '/products/category/grocery-gourmet' },
      { name: 'Heinz', logo: 'https://logos.hunter.io/heinz.com', href: '/products/category/grocery-gourmet' },
      { name: 'Lipton', logo: 'https://logos.hunter.io/lipton.com', href: '/products/category/grocery-gourmet' },
      { name: 'Nescafé', logo: 'https://logos.hunter.io/nescafe.com', href: '/products/category/grocery-gourmet' },
      { name: 'Al Ain', logo: 'https://logos.hunter.io/alainwater.com', href: '/products/category/grocery-gourmet' },
    ],
    subcategories: [
      { name: 'Pantry Staples', href: '/products/category/grocery-gourmet', children: [
        { name: 'Rice & Grains', href: '/products/category/grocery-gourmet' },
        { name: 'Pasta & Noodles', href: '/products/category/grocery-gourmet' },
        { name: 'Cooking Oils', href: '/products/category/grocery-gourmet' },
        { name: 'Canned Goods', href: '/products/category/grocery-gourmet' },
        { name: 'Flour & Baking', href: '/products/category/grocery-gourmet' },
        { name: 'Sauces & Condiments', href: '/products/category/grocery-gourmet' },
      ]},
      { name: 'Snacks', href: '/products/category/grocery-gourmet', children: [
        { name: 'Chips & Crisps', href: '/products/category/grocery-gourmet' },
        { name: 'Nuts & Dried Fruits', href: '/products/category/grocery-gourmet' },
        { name: 'Chocolate & Candy', href: '/products/category/grocery-gourmet' },
        { name: 'Biscuits & Cookies', href: '/products/category/grocery-gourmet' },
        { name: 'Popcorn', href: '/products/category/grocery-gourmet' },
        { name: 'Protein Bars', href: '/products/category/grocery-gourmet' },
      ]},
      { name: 'Beverages', href: '/products/category/grocery-gourmet', children: [
        { name: 'Water', href: '/products/category/grocery-gourmet' },
        { name: 'Juices', href: '/products/category/grocery-gourmet' },
        { name: 'Soft Drinks', href: '/products/category/grocery-gourmet' },
        { name: 'Tea', href: '/products/category/grocery-gourmet' },
        { name: 'Coffee', href: '/products/category/grocery-gourmet' },
        { name: 'Energy Drinks', href: '/products/category/grocery-gourmet' },
      ]},
      { name: 'Organic & Natural', href: '/products/category/grocery-gourmet', children: [
        { name: 'Organic Snacks', href: '/products/category/grocery-gourmet' },
        { name: 'Organic Beverages', href: '/products/category/grocery-gourmet' },
        { name: 'Gluten-Free', href: '/products/category/grocery-gourmet' },
        { name: 'Vegan Products', href: '/products/category/grocery-gourmet' },
        { name: 'Sugar-Free', href: '/products/category/grocery-gourmet' },
        { name: 'Superfoods', href: '/products/category/grocery-gourmet' },
      ]},
      { name: 'Cooking Essentials', href: '/products/category/grocery-gourmet', children: [
        { name: 'Spices & Herbs', href: '/products/category/grocery-gourmet' },
        { name: 'Salt & Pepper', href: '/products/category/grocery-gourmet' },
        { name: 'Vinegar', href: '/products/category/grocery-gourmet' },
        { name: 'Honey & Syrups', href: '/products/category/grocery-gourmet' },
        { name: 'Marinades & Rubs', href: '/products/category/grocery-gourmet' },
        { name: 'Bouillon & Stock', href: '/products/category/grocery-gourmet' },
      ]},
      { name: 'Breakfast Foods', href: '/products/category/grocery-gourmet', children: [
        { name: 'Cereals', href: '/products/category/grocery-gourmet' },
        { name: 'Oats & Granola', href: '/products/category/grocery-gourmet' },
        { name: 'Pancake & Waffle Mix', href: '/products/category/grocery-gourmet' },
        { name: 'Jams & Spreads', href: '/products/category/grocery-gourmet' },
        { name: 'Peanut Butter', href: '/products/category/grocery-gourmet' },
        { name: 'Bread & Bakery', href: '/products/category/grocery-gourmet' },
      ]},
      { name: 'Dairy & Chilled', href: '/products/category/grocery-gourmet', children: [
        { name: 'Milk & Cream', href: '/products/category/grocery-gourmet' },
        { name: 'Cheese', href: '/products/category/grocery-gourmet' },
        { name: 'Yogurt', href: '/products/category/grocery-gourmet' },
        { name: 'Butter & Margarine', href: '/products/category/grocery-gourmet' },
        { name: 'Eggs', href: '/products/category/grocery-gourmet' },
      ]},
      { name: 'Gourmet & Specialty', href: '/products/category/grocery-gourmet', children: [
        { name: 'Imported Foods', href: '/products/category/grocery-gourmet' },
        { name: 'Gift Hampers', href: '/products/category/grocery-gourmet' },
        { name: 'Premium Chocolates', href: '/products/category/grocery-gourmet' },
        { name: 'Artisan Snacks', href: '/products/category/grocery-gourmet' },
        { name: 'Specialty Coffee & Tea', href: '/products/category/grocery-gourmet' },
      ]},
    ],
  },
];

function NavDropdown({ link, onClose }: { link: NavLink; onClose: () => void }) {
  if (!link.subcategories) return null;

  return (
    <div className="grid grid-cols-8 gap-x-4 gap-y-3">
      {link.subcategories.map((sub) => (
        <div key={sub.name}>
          <Link
            href={sub.href}
            onClick={onClose}
            className="block text-[13px] font-bold text-[#0F1111] hover:text-[#1d4ed8] transition-colors mb-1"
          >
            {sub.name}
          </Link>
          <div>
            {sub.children.map((child) => (
              <Link
                key={child.name}
                href={child.href}
                onClick={onClose}
                className="block text-[13px] text-[#565959] hover:text-[#1d4ed8] transition-colors leading-[24px]"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SecondaryNav() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveIndex(null);
    }, 150);
  }, []);

  const handleClose = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Close dropdown on route change
  const pathname = usePathname();
  useEffect(() => {
    setActiveIndex(null);
  }, [pathname]);

  const activeLink = activeIndex !== null ? navLinks[activeIndex] : null;

  return (
    <nav className="bg-blue-800 text-white text-sm relative hidden md:block" ref={navRef}>
      <div className="w-full px-4">
        <div className="flex items-center gap-6 h-[41px] overflow-x-auto scrollbar-hide">
          <MegaMenu />
          <Link href="/deals" className="whitespace-nowrap py-2 text-[#fbbf24] font-bold hover:text-[#f59e0b] transition-colors flex-shrink-0">
            Today&apos;s Deals
          </Link>
          <Link href="/bestsellers" className="whitespace-nowrap py-2 hover:text-white/80 transition-colors flex-shrink-0">
            Best Sellers
          </Link>
          <Link href="/new-arrivals" className="whitespace-nowrap py-2 hover:text-white/80 transition-colors flex-shrink-0">
            New Arrivals
          </Link>
          {navLinks.map((link, index) => (
            <div
              key={link.name}
              className="relative flex-shrink-0"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={link.href}
                onClick={handleClose}
                className="whitespace-nowrap py-2 hover:text-white/80 transition-colors block"
              >
                {link.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown panel */}
      {activeLink?.subcategories && (
        <div
          className="absolute left-0 right-0 z-50 bg-white"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-full flex relative">
            {/* Left content: subcategories + brands */}
            <div className="flex-1 min-w-0 pl-6 pr-4 py-5" style={{ marginRight: activeLink.promoImage ? '280px' : '0' }}>
              <NavDropdown link={activeLink} onClose={handleClose} />

              {/* TOP BRANDS — full width at bottom */}
              {activeLink.brands && activeLink.brands.length > 0 && (
                <div className="mt-10">
                  <span className="text-[11px] font-bold text-[#565959] uppercase tracking-wide">Top Brands</span>
                  <div className="flex gap-3 mt-2">
                    {activeLink.brands.map((brand) => (
                      <Link
                        key={brand.name}
                        href={brand.href}
                        onClick={handleClose}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="flex items-center justify-center w-[90px] h-[50px] rounded-md border border-[#e7e7e7] bg-white hover:border-[#1d4ed8] transition-colors overflow-hidden p-2">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={60}
                            height={30}
                            className="object-contain max-w-full max-h-full"
                          />
                        </div>
                        <span className="text-[10px] text-[#565959]">{brand.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: promo image — full height, flush right */}
            {activeLink.promoImage && (
              <div className="absolute right-0 top-0 bottom-0 w-[280px] p-3">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <Image
                    src={activeLink.promoImage}
                    alt={activeLink.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
