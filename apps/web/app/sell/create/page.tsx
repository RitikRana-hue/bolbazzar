'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Upload,
    X,
    Plus,
    DollarSign,
    Gavel,
    Info,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface FormData {
    title: string;
    description: string;
    categoryId: string;
    condition: string;
    brand: string;
    model: string;
    price: string;
    originalPrice: string;
    stock: string;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    features: string[];
    tags: string[];
    images: File[];
    isAuction: boolean;
    auctionData: {
        startingPrice: string;
        reservePrice: string;
        duration: string;
        autoExtend: boolean;
    };
}

function CreateListingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const listingType = searchParams.get('type') || 'direct';

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        categoryId: '',
        condition: 'NEW',
        brand: '',
        model: '',
        price: '',
        originalPrice: '',
        stock: '1',
        weight: '',
        dimensions: {
            length: '',
            width: '',
            height: ''
        },
        features: [],
        tags: [],
        images: [],
        isAuction: listingType === 'auction',
        auctionData: {
            startingPrice: '',
            reservePrice: '',
            duration: '168', // 7 days in hours
            autoExtend: true
        }
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newFeature, setNewFeature] = useState('');
    const [newTag, setNewTag] = useState('');

    const categories = [
        { id: '1', name: 'Electronics', slug: 'electronics' },
        { id: '2', name: 'Fashion', slug: 'fashion' },
        { id: '3', name: 'Home & Garden', slug: 'home-garden' },
        { id: '4', name: 'Collectibles', slug: 'collectibles' },
        { id: '5', name: 'Vehicles', slug: 'vehicles' },
        { id: '6', name: 'Sports', slug: 'sports' }
    ];

    const conditions = [
        { value: 'NEW', label: 'New', description: 'Brand new, never used' },
        { value: 'LIKE_NEW', label: 'Like New', description: 'Excellent condition, barely used' },
        { value: 'GOOD', label: 'Good', description: 'Minor signs of wear' },
        { value: 'FAIR', label: 'Fair', description: 'Noticeable wear but functional' },
        { value: 'POOR', label: 'Poor', description: 'Heavy wear, may need repair' },
        { value: 'REFURBISHED', label: 'Refurbished', description: 'Professionally restored' }
    ];

    const steps = [
        { number: 1, title: 'Basic Info', description: 'Title, category, and condition' },
        { number: 2, title: 'Details', description: 'Description, features, and specifications' },
        { number: 3, title: 'Photos', description: 'Upload product images' },
        { number: 4, title: 'Pricing', description: 'Set price and auction settings' },
        { number: 5, title: 'Review', description: 'Review and publish' }
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + formData.images.length > 10) {
            setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const addFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.title.trim()) newErrors.title = 'Title is required';
                if (!formData.categoryId) newErrors.categoryId = 'Category is required';
                if (!formData.condition) newErrors.condition = 'Condition is required';
                break;
            case 2:
                if (!formData.description.trim()) newErrors.description = 'Description is required';
                break;
            case 3:
                if (formData.images.length === 0) newErrors.images = 'At least one image is required';
                break;
            case 4:
                if (formData.isAuction) {
                    if (!formData.auctionData.startingPrice) newErrors.startingPrice = 'Starting price is required';
                    if (parseFloat(formData.auctionData.startingPrice) <= 0) newErrors.startingPrice = 'Starting price must be greater than 0';
                } else {
                    if (!formData.price) newErrors.price = 'Price is required';
                    if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 5));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            const submitData = {
                ...formData,
                dimensions: JSON.stringify(formData.dimensions),
                features: formData.features,
                tags: formData.tags
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                const result = await response.json();
                router.push(`/p/${result.product.id}?created=true`);
            } else {
                const error = await response.json();
                setErrors({ submit: error.message || 'Failed to create listing' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="What are you selling?"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                maxLength={80}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            <p className="text-gray-500 text-sm mt-1">{formData.title.length}/80 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {conditions.map(condition => (
                                    <label key={condition.value} className={`flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${formData.condition === condition.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="condition"
                                            value={condition.value}
                                            checked={formData.condition === condition.value}
                                            onChange={(e) => handleInputChange('condition', e.target.value)}
                                            className="mt-1 mr-3"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">{condition.label}</div>
                                            <div className="text-sm text-gray-600">{condition.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                    placeholder="e.g., Apple, Samsung"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => handleInputChange('model', e.target.value)}
                                    placeholder="e.g., iPhone 15 Pro"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe your item in detail..."
                                rows={6}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                maxLength={1000}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            <p className="text-gray-500 text-sm mt-1">{formData.description.length}/1000 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Key Features
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Add a feature"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.features.map((feature, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {feature}
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add a tag"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="ml-2 text-gray-600 hover:text-gray-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (lbs)
                                </label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => handleInputChange('weight', e.target.value)}
                                    placeholder="0.0"
                                    step="0.1"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Length (in)
                                </label>
                                <input
                                    type="number"
                                    value={formData.dimensions.length}
                                    onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, length: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Width (in)
                                </label>
                                <input
                                    type="number"
                                    value={formData.dimensions.width}
                                    onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, width: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Images * (Max 10)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">Upload Images</p>
                                    <p className="text-gray-600">Drag and drop or click to select files</p>
                                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
                                </label>
                            </div>
                            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                        </div>

                        {formData.images.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({formData.images.length}/10)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="font-medium text-blue-900">Pricing Tips</h3>
                                    <p className="text-blue-700 text-sm mt-1">
                                        Research similar items to set competitive prices. For auctions, start low to attract bidders.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {formData.isAuction ? (
                            <div className="space-y-4">
                                <div className="flex items-center mb-4">
                                    <Gavel className="h-6 w-6 text-purple-600 mr-2" />
                                    <h3 className="text-lg font-semibold text-gray-900">Auction Settings</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Starting Price * ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.auctionData.startingPrice}
                                            onChange={(e) => handleInputChange('auctionData', { ...formData.auctionData, startingPrice: e.target.value })}
                                            placeholder="0.99"
                                            step="0.01"
                                            min="0.01"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startingPrice ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.startingPrice && <p className="text-red-500 text-sm mt-1">{errors.startingPrice}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reserve Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.auctionData.reservePrice}
                                            onChange={(e) => handleInputChange('auctionData', { ...formData.auctionData, reservePrice: e.target.value })}
                                            placeholder="Optional minimum price"
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-gray-500 text-sm mt-1">Minimum price you'll accept</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Auction Duration
                                    </label>
                                    <select
                                        value={formData.auctionData.duration}
                                        onChange={(e) => handleInputChange('auctionData', { ...formData.auctionData, duration: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="24">1 Day</option>
                                        <option value="72">3 Days</option>
                                        <option value="120">5 Days</option>
                                        <option value="168">7 Days</option>
                                        <option value="240">10 Days</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="autoExtend"
                                        checked={formData.auctionData.autoExtend}
                                        onChange={(e) => handleInputChange('auctionData', { ...formData.auctionData, autoExtend: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="autoExtend" className="ml-2 text-sm text-gray-700">
                                        Auto-extend auction by 5 minutes when bid is placed in last 5 seconds
                                    </label>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                                        <div>
                                            <h4 className="font-medium text-yellow-900">Auction Fee</h4>
                                            <p className="text-yellow-700 text-sm mt-1">
                                                A $2.50 fee will be deducted from your Gas Wallet when the auction starts.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center mb-4">
                                    <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                                    <h3 className="text-lg font-semibold text-gray-900">Direct Sale Pricing</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price * ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0.01"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Original Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.originalPrice}
                                            onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                                            placeholder="Optional MSRP"
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-gray-500 text-sm mt-1">Show savings to buyers</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => handleInputChange('stock', e.target.value)}
                                        placeholder="1"
                                        min="1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="font-medium text-green-900">Ready to Publish</h3>
                                    <p className="text-green-700 text-sm mt-1">
                                        Review your listing details below and click publish when ready.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Preview</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    {formData.images.length > 0 && (
                                        <img
                                            src={URL.createObjectURL(formData.images[0])}
                                            alt="Main product"
                                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{formData.title}</h4>
                                    <p className="text-gray-600 mb-4">{formData.description.substring(0, 150)}...</p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Category:</span>
                                            <span className="font-medium">{categories.find(c => c.id === formData.categoryId)?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Condition:</span>
                                            <span className="font-medium">{conditions.find(c => c.value === formData.condition)?.label}</span>
                                        </div>
                                        {formData.isAuction ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Starting Price:</span>
                                                    <span className="font-bold text-green-600">${formData.auctionData.startingPrice}</span>
                                                </div>
                                                {formData.auctionData.reservePrice && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Reserve Price:</span>
                                                        <span className="font-medium">${formData.auctionData.reservePrice}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-bold text-green-600">${formData.price}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                                    <p className="text-red-700">{errors.submit}</p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create {formData.isAuction ? 'Auction' : 'Listing'}
                    </h1>
                    <p className="text-gray-600">
                        {formData.isAuction
                            ? 'Set up your auction and let buyers compete for your item'
                            : 'List your item for direct sale to buyers'
                        }
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-300 text-gray-500'
                                    }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircle className="h-6 w-6" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-1 mx-2 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        {steps.map(step => (
                            <div key={step.number} className="text-center" style={{ width: '120px' }}>
                                <div className="text-sm font-medium text-gray-900">{step.title}</div>
                                <div className="text-xs text-gray-500">{step.description}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    {renderStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {currentStep < 5 ? (
                        <button
                            onClick={nextStep}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Publish Listing
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CreateListingPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <CreateListingContent />
        </Suspense>
    );
}