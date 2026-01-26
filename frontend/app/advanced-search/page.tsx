'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, MapPin, DollarSign, Star, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import AuctionCard from '../components/ui/AuctionCard';

interface SearchFilters {
    query: string;
    category: string;
    priceMin: string;
    priceMax: string;
    condition: string;
    location: string;
    distance: string;
    listingType: string;
    sortBy: string;
    seller: string;
    shipping: string;
    paymentMethods: string[];
}

interface SearchResult {
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
    condition: string;
    category: string;
}

function AdvancedSearchContent() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(true);
    const [totalResults, setTotalResults] = useState(0);

    const [filters, setFilters] = useState<SearchFilters>({
        query: searchParams?.get('q') || '',
        category: 'all',
        priceMin: '',
        priceMax: '',
        condition: 'all',
        location: '',
        distance: '25',
        listingType: 'all',
        sortBy: 'best-match',
        seller: '',
        shipping: 'all',
        paymentMethods: []
    });

    const categories = [
        'All Categories',
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Collectibles & Art',
        'Motors',
        'Sports & Outdoors',
        'Health & Beauty',
        'Toys & Hobbies',
        'Business & Industrial'
    ];

    const conditions = [
        'All Conditions',
        'New',
        'Open box',
        'Used',
        'Refurbished',
        'For parts or not working'
    ];

    const distances = [
        { value: '10', label: 'Within 10 miles' },
        { value: '25', label: 'Within 25 miles' },
        { value: '50', label: 'Within 50 miles' },
        { value: '100', label: 'Within 100 miles' },
        { value: 'nationwide', label: 'Nationwide' }
    ];

    useEffect(() => {
        if (filters.query) {
            performSearch();
        }
    }, [filters]);

    const performSearch = async () => {
        try {
            setLoading(true);
            // Mock search results - replace with actual API call
            const mockResults: SearchResult[] = [
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
                    shipping: 'Free shipping',
                    condition: 'New',
                    category: 'Electronics'
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
                    shipping: 'Free shipping',
                    condition: 'Used',
                    category: 'Electronics'
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
                    shipping: '$9.99 shipping',
                    condition: 'New',
                    category: 'Electronics'
                }
            ];

            setResults(mockResults);
            setTotalResults(mockResults.length);
            setLoading(false);
        } catch (error) {
            console.error('Search failed:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch();
    };

    const clearFilters = () => {
        setFilters({
            query: filters.query, // Keep the search query
            category: 'all',
            priceMin: '',
            priceMax: '',
            condition: 'all',
            location: '',
            distance: '25',
            listingType: 'all',
            sortBy: 'best-match',
            seller: '',
            shipping: 'all',
            paymentMethods: []
        });
    };

    return (
        <main className="bg-gray-50 py-6">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Search Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Advanced Search</h1>

                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Main Search */}
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter keywords or item number"
                                    value={filters.query}
                                    onChange={(e) => handleFilterChange('query', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Search className="h-5 w-5 mr-2" />
                                Search
                            </button>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                More filters
                                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </form>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="h-4 w-4 inline mr-1" />
                                    Price Range
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Star className="h-4 w-4 inline mr-1" />
                                    Condition
                                </label>
                                <select
                                    value={filters.condition}
                                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {conditions.map((condition) => (
                                        <option key={condition} value={condition.toLowerCase().replace(/\s/g, '-')}>
                                            {condition}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    Location
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Enter ZIP code or city"
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <select
                                        value={filters.distance}
                                        onChange={(e) => handleFilterChange('distance', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {distances.map((distance) => (
                                            <option key={distance.value} value={distance.value}>
                                                {distance.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Listing Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Listing Type
                                </label>
                                <div className="space-y-2">
                                    {['All listings', 'Buy It Now', 'Auction', 'Best Offer'].map((type) => (
                                        <label key={type} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="listingType"
                                                value={type.toLowerCase().replace(/\s/g, '-')}
                                                checked={filters.listingType === type.toLowerCase().replace(/\s/g, '-')}
                                                onChange={(e) => handleFilterChange('listingType', e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shipping Options
                                </label>
                                <div className="space-y-2">
                                    {['All shipping', 'Free shipping', 'Fast & Free', 'Local pickup'].map((shipping) => (
                                        <label key={shipping} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value={shipping.toLowerCase().replace(/\s/g, '-')}
                                                checked={filters.shipping === shipping.toLowerCase().replace(/\s/g, '-')}
                                                onChange={(e) => handleFilterChange('shipping', e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">{shipping}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Seller */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Seller
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter seller name"
                                    value={filters.seller}
                                    onChange={(e) => handleFilterChange('seller', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Header */}
                {filters.query && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Search results for "{filters.query}"
                            </h2>
                            <p className="text-gray-600">
                                {loading ? 'Searching...' : `${totalResults.toLocaleString()} results found`}
                            </p>
                        </div>

                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            {/* Sort Dropdown */}
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="best-match">Best Match</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                                <option value="ending-soon">Ending Soon</option>
                                <option value="distance">Distance: Nearest First</option>
                            </select>

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
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {results.map((result) => (
                                    result.isAuction ? (
                                        <AuctionCard
                                            key={result.id}
                                            id={result.id}
                                            title={result.title}
                                            currentBid={result.currentBid!}
                                            bids={result.bids!}
                                            endTime={result.endTime!}
                                            image={result.image}
                                            seller={result.seller}
                                        />
                                    ) : (
                                        <ProductCard
                                            key={result.id}
                                            id={result.id}
                                            title={result.title}
                                            price={result.price}
                                            originalPrice={result.originalPrice}
                                            image={result.image}
                                            seller={result.seller}
                                            rating={result.rating}
                                            reviews={result.reviews}
                                        />
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((result) => (
                                    <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center space-x-6">
                                        <img
                                            src={result.image}
                                            alt={result.title}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 mb-2">{result.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">by {result.seller}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>{result.condition}</span>
                                                <span>{result.location}</span>
                                                <span>{result.shipping}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {result.isAuction ? (
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900">${result.currentBid?.toFixed(2)}</p>
                                                    <p className="text-sm text-gray-600">{result.bids} bids</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900">${result.price.toFixed(2)}</p>
                                                    {result.originalPrice && (
                                                        <p className="text-sm text-gray-500 line-through">${result.originalPrice.toFixed(2)}</p>
                                                    )}
                                                </div>
                                            )}
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
                    </>
                ) : filters.query ? (
                    <div className="text-center py-16">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search terms or filters
                        </p>
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear filters and try again
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start your search</h2>
                        <p className="text-gray-600">
                            Enter keywords above to find what you're looking for
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function AdvancedSearchPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <AdvancedSearchContent />
        </Suspense>
    );
}