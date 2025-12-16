'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Share, ShoppingCart, Gavel, Star, Shield, ChevronRight, Plus, Minus, MessageSquare, Eye } from 'lucide-react';
import Timer from '../../components/ui/Timer';
import ProductCard from '../../components/ui/ProductCard';

interface Product {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    images: string[];
    seller: {
        name: string;
        rating: number;
        reviews: number;
        verified: boolean;
    };
    description: string;
    condition: string;
    category: string;
    shipping: {
        cost: number;
        method: string;
        estimatedDays: string;
    };
    returns: string;
    isAuction: boolean;
    auctionData?: {
        endTime: string;
        currentBid: number;
        bids: number;
        minBid: number;
        bidHistory: Array<{
            bidder: string;
            amount: number;
            time: string;
        }>;
    };
    specifications: Record<string, string>;
    inStock: boolean;
    quantity: number;
    views: number;
    watchers: number;
}

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [bidAmount, setBidAmount] = useState('');
    const [showBidHistory, setShowBidHistory] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

    useEffect(() => {
        fetchProduct();
        fetchRelatedProducts();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockProduct: Product = {
                id: productId,
                title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                price: 1199.99,
                originalPrice: 1299.99,
                images: [
                    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=600&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop'
                ],
                seller: {
                    name: 'TechStore Pro',
                    rating: 4.8,
                    reviews: 1247,
                    verified: true
                },
                description: 'Brand new iPhone 15 Pro Max in Natural Titanium. Unlocked and ready to use with any carrier. Includes original box, charger, and documentation. This is the latest model with the most advanced features.',
                condition: 'New',
                category: 'Electronics > Cell Phones',
                shipping: {
                    cost: 0,
                    method: 'Free Standard Shipping',
                    estimatedDays: '3-5 business days'
                },
                returns: '30-day returns accepted',
                isAuction: productId === '2', // Make product 2 an auction
                auctionData: productId === '2' ? {
                    endTime: '2024-12-15T18:30:00Z',
                    currentBid: 850.00,
                    bids: 23,
                    minBid: 860.00,
                    bidHistory: [
                        { bidder: 'user***1', amount: 850.00, time: '2 minutes ago' },
                        { bidder: 'buyer***2', amount: 825.00, time: '5 minutes ago' },
                        { bidder: 'tech***3', amount: 800.00, time: '8 minutes ago' }
                    ]
                } : undefined,
                specifications: {
                    'Brand': 'Apple',
                    'Model': 'iPhone 15 Pro Max',
                    'Storage': '256GB',
                    'Color': 'Natural Titanium',
                    'Screen Size': '6.7 inches',
                    'Camera': '48MP Main Camera',
                    'Processor': 'A17 Pro chip',
                    'Connectivity': '5G, Wi-Fi 6E, Bluetooth 5.3'
                },
                inStock: true,
                quantity: 5,
                views: 1247,
                watchers: 89
            };

            setProduct(mockProduct);
            if (mockProduct.auctionData) {
                setBidAmount(mockProduct.auctionData.minBid.toString());
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async () => {
        // Mock related products
        const mockRelated = [
            {
                id: '10',
                title: 'iPhone 15 Pro 128GB - Blue Titanium',
                price: 999.99,
                image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
                seller: 'Apple Store',
                rating: 4.9,
                reviews: 892
            },
            {
                id: '11',
                title: 'Samsung Galaxy S24 Ultra 512GB',
                price: 1199.99,
                image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
                seller: 'Samsung Official',
                rating: 4.7,
                reviews: 634
            }
        ];
        setRelatedProducts(mockRelated);
    };

    const handleAddToCart = () => {
        // Add to cart logic
        alert(`Added ${quantity} item(s) to cart`);
    };

    const handleBuyNow = () => {
        // Buy now logic
        window.location.href = '/checkout';
    };

    const handlePlaceBid = () => {
        if (!product?.auctionData) return;
        const bid = parseFloat(bidAmount);
        if (bid >= product.auctionData.minBid) {
            alert(`Bid placed: $${bid.toFixed(2)}`);
        } else {
            alert(`Minimum bid is $${product.auctionData.minBid.toFixed(2)}`);
        }
    };

    const handleWatchItem = () => {
        alert('Item added to watchlist');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
                <Link href="/" className="text-blue-600 hover:underline">
                    Return to homepage
                </Link>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 py-8">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight size={16} />
                    <Link href="/category/electronics" className="hover:text-blue-600">Electronics</Link>
                    <ChevronRight size={16} />
                    <span className="text-gray-900">iPhone 15 Pro Max</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Product Images */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.title}
                                className="w-full h-96 object-cover rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`border-2 rounded-lg overflow-hidden ${selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-20 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h1>

                        {/* Price */}
                        <div className="mb-4">
                            {product.isAuction ? (
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Gavel className="h-5 w-5 text-purple-600" />
                                        <span className="text-purple-600 font-medium">Auction</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">
                                        ${product.auctionData!.currentBid.toFixed(2)}
                                    </div>
                                    <p className="text-gray-600">{product.auctionData!.bids} bids</p>
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-red-600 font-medium">Time left:</span>
                                            <Timer
                                                endTime={product.auctionData!.endTime}
                                                className="text-red-600 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-3xl font-bold text-gray-900">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        {product.originalPrice && (
                                            <span className="text-xl text-gray-500 line-through">
                                                ${product.originalPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    {product.originalPrice && (
                                        <p className="text-green-600 font-medium">
                                            Save ${(product.originalPrice - product.price).toFixed(2)}
                                            ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Seller Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{product.seller.name}</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < Math.floor(product.seller.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {product.seller.rating} ({product.seller.reviews} reviews)
                                        </span>
                                        {product.seller.verified && (
                                            <Shield className="h-4 w-4 text-green-600" />
                                        )}
                                    </div>
                                </div>
                                <Link
                                    href={`/messages?seller=${product.seller.name}`}
                                    className="flex items-center text-blue-600 hover:text-blue-700"
                                >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Contact
                                </Link>
                            </div>
                        </div>

                        {/* Condition & Shipping */}
                        <div className="mb-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Condition:</span>
                                <span className="font-medium">{product.condition}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping:</span>
                                <div className="text-right">
                                    <p className="font-medium">
                                        {product.shipping.cost === 0 ? 'Free' : `$${product.shipping.cost.toFixed(2)}`}
                                    </p>
                                    <p className="text-sm text-gray-600">{product.shipping.estimatedDays}</p>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Returns:</span>
                                <span className="font-medium">{product.returns}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            {product.isAuction ? (
                                <div>
                                    <div className="flex space-x-2 mb-4">
                                        <input
                                            type="number"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            min={product.auctionData!.minBid}
                                            step="0.01"
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Min bid: $${product.auctionData!.minBid.toFixed(2)}`}
                                        />
                                        <button
                                            onClick={handlePlaceBid}
                                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                        >
                                            Place Bid
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowBidHistory(!showBidHistory)}
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        {showBidHistory ? 'Hide' : 'Show'} bid history
                                    </button>
                                    {showBidHistory && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium mb-3">Bid History</h4>
                                            <div className="space-y-2">
                                                {product.auctionData!.bidHistory.map((bid, index) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span>{bid.bidder}</span>
                                                        <span>${bid.amount.toFixed(2)}</span>
                                                        <span className="text-gray-500">{bid.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {product.inStock ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <span className="text-gray-700">Quantity:</span>
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="p-2 hover:bg-gray-50"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                                        className="p-2 hover:bg-gray-50"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {product.quantity} available
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={handleAddToCart}
                                                    className="flex items-center justify-center bg-yellow-500 text-gray-900 py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                                                >
                                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                                    Add to Cart
                                                </button>
                                                <button
                                                    onClick={handleBuyNow}
                                                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-red-600 font-medium mb-4">Out of Stock</p>
                                            <button
                                                onClick={handleWatchItem}
                                                className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                Notify When Available
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Secondary Actions */}
                            <div className="flex space-x-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleWatchItem}
                                    className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <Heart className="h-5 w-5 mr-2" />
                                    Add to Watchlist
                                </button>
                                <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                                    <Share className="h-5 w-5 mr-2" />
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {product.views} views
                            </div>
                            <div className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {product.watchers} watchers
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button className="py-4 border-b-2 border-blue-600 text-blue-600 font-medium">
                                Description
                            </button>
                            <button className="py-4 text-gray-600 hover:text-gray-900">
                                Specifications
                            </button>
                            <button className="py-4 text-gray-600 hover:text-gray-900">
                                Shipping & Returns
                            </button>
                        </nav>
                    </div>
                    <div className="p-6">
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>

                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Features:</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Latest A17 Pro chip for incredible performance</li>
                                    <li>Professional camera system with 48MP main camera</li>
                                    <li>6.7-inch Super Retina XDR display</li>
                                    <li>Titanium design - strong, light, and durable</li>
                                    <li>All-day battery life with fast charging</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                id={relatedProduct.id}
                                title={relatedProduct.title}
                                price={relatedProduct.price}
                                image={relatedProduct.image}
                                seller={relatedProduct.seller}
                                rating={relatedProduct.rating}
                                reviews={relatedProduct.reviews}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}