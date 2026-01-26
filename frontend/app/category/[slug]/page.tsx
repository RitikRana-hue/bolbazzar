'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Filter, Grid, List, Heart, Gavel } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import AuctionCard from '../../components/ui/AuctionCard';

interface Product {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    seller: string;
    rating: number;
    reviews: number;
    isAuction: boolean;
    endTime?: string;
    currentBid?: number;
    bids?: number;
    location: string;
    shipping: string;
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('best-match');
    const [filters, setFilters] = useState({
        priceMin: '',
        priceMax: '',
        condition: 'all',
        location: 'all',
        shipping: 'all'
    });

    // Convert slug to readable category name
    const categoryName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    useEffect(() => {
        fetchCategoryProducts();
    }, [slug, sortBy, filters]);

    const fetchCategoryProducts = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockProducts: Product[] = [
                {
                    id: '1',
                    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                    price: 1199.99,
                    originalPrice: 1299.99,
                    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=300&h=300&fit=crop',
                    seller: 'TechStore Pro',
                    rating: 4.8,
                    reviews: 1247,
                    isAuction: false,
                    location: 'New York, NY',
                    shipping: 'Free shipping'
                },
                {
                    id: '2',
                    title: 'MacBook Pro M3 14-inch - Space Black',
                    price: 850.00,
                    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
                    seller: 'Apple Certified',
                    rating: 4.9,
                    reviews: 892,
                    isAuction: true,
                    endTime: '2024-12-15T18:30:00Z',
                    currentBid: 850.00,
                    bids: 23,
                    location: 'California, CA',
                    shipping: 'Free shipping'
                },
                {
                    id: '3',
                    title: 'Samsung Galaxy S24 Ultra 512GB',
                    price: 999.99,
                    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
                    seller: 'Galaxy Store',
                    rating: 4.7,
                    reviews: 634,
                    isAuction: false,
                    location: 'Texas, TX',
                    shipping: '$9.99 shipping'
                },
                {
                    id: '4',
                    title: 'iPad Pro 12.9-inch M2 Wi-Fi 256GB',
                    price: 750.00,
                    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=300&fit=crop',
                    seller: 'TabletWorld',
                    rating: 4.6,
                    reviews: 445,
                    isAuction: true,
                    endTime: '2024-12-16T12:00:00Z',
                    currentBid: 750.00,
                    bids: 15,
                    location: 'Florida, FL',
                    shipping: 'Free shipping'
                }
            ];

            setProducts(mockProducts);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch category products:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 py-6">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight size={16} />
                    <Link href="/all-categories" className="hover:text-blue-600">Categories</Link>
                    <ChevronRight size={16} />
                    <span className="text-gray-900">{categoryName}</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
                        <p className="text-gray-600">{products.length.toLocaleString()} results</p>
                    </div>

                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        {/* View Mode Toggle */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="best-match">Best Match</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                            <option value="ending-soon">Ending Soon</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <Filter className="h-5 w-5 text-gray-600 mr-2" />
                                <h2 className="font-bold text-gray-900">Filters</h2>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Condition */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-3">Condition</h3>
                                <div className="space-y-2">
                                    {['all', 'new', 'used', 'refurbished'].map((condition) => (
                                        <label key={condition} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="condition"
                                                value={condition}
                                                checked={filters.condition === condition}
                                                onChange={(e) => handleFilterChange('condition', e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{condition}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-3">Shipping</h3>
                                <div className="space-y-2">
                                    {['all', 'free', 'fast'].map((shipping) => (
                                        <label key={shipping} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value={shipping}
                                                checked={filters.shipping === shipping}
                                                onChange={(e) => handleFilterChange('shipping', e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">
                                                {shipping === 'all' ? 'All shipping' :
                                                    shipping === 'free' ? 'Free shipping' :
                                                        'Fast shipping'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    product.isAuction ? (
                                        <AuctionCard
                                            key={product.id}
                                            id={product.id}
                                            title={product.title}
                                            currentBid={product.currentBid!}
                                            bids={product.bids!}
                                            endTime={product.endTime!}
                                            image={product.image}
                                            seller={product.seller}
                                        />
                                    ) : (
                                        <ProductCard
                                            key={product.id}
                                            id={product.id}
                                            title={product.title}
                                            price={product.price}
                                            originalPrice={product.originalPrice}
                                            image={product.image}
                                            seller={product.seller}
                                            rating={product.rating}
                                            reviews={product.reviews}
                                        />
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center space-x-6">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 mb-2">{product.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">by {product.seller}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>{product.location}</span>
                                                <span>{product.shipping}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {product.isAuction ? (
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900">${product.currentBid?.toFixed(2)}</p>
                                                    <p className="text-sm text-gray-600">{product.bids} bids</p>
                                                    <div className="flex items-center mt-2">
                                                        <Gavel className="h-4 w-4 text-purple-600 mr-1" />
                                                        <span className="text-sm text-purple-600">Auction</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
                                                    {product.originalPrice && (
                                                        <p className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                                                    )}
                                                </div>
                                            )}
                                            <button className="mt-2 p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Heart size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center mt-8">
                            <div className="flex space-x-2">
                                <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                                    Previous
                                </button>
                                {[1, 2, 3, 4, 5].map((page) => (
                                    <button
                                        key={page}
                                        className={`px-3 py-2 border rounded-lg ${page === 1
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}