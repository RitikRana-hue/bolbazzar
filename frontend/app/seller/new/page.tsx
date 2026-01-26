'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

export default function CreateListingPage() {
    const [listingType, setListingType] = useState<'direct' | 'auction'>('direct');
    const [condition, setCondition] = useState<'new' | 'refurbished'>('new');
    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setImages([...images, event.target.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">Create New Listing</h1>

            <form className="space-y-8">
                {/* Listing Type */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Listing Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${listingType === 'direct' ? 'border-primary bg-orange-50' : 'border-gray-200'
                            }`}>
                            <input
                                type="radio"
                                value="direct"
                                checked={listingType === 'direct'}
                                onChange={(e) => setListingType(e.target.value as 'direct')}
                                className="mr-2"
                            />
                            <span className="font-semibold">Direct Purchase</span>
                            <p className="text-sm text-gray-600 mt-1">Sell at a fixed price</p>
                        </label>
                        <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${listingType === 'auction' ? 'border-primary bg-orange-50' : 'border-gray-200'
                            }`}>
                            <input
                                type="radio"
                                value="auction"
                                checked={listingType === 'auction'}
                                onChange={(e) => setListingType(e.target.value as 'auction')}
                                className="mr-2"
                            />
                            <span className="font-semibold">Auction</span>
                            <p className="text-sm text-gray-600 mt-1">Let buyers bid for your item</p>
                        </label>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Item Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Title *</label>
                            <input type="text" className="input" placeholder="What are you selling?" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Description *</label>
                            <textarea className="input" rows={6} placeholder="Describe your item in detail..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Category *</label>
                                <select className="input">
                                    <option>Electronics</option>
                                    <option>Fashion</option>
                                    <option>Home & Garden</option>
                                    <option>Collectibles</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Condition *</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="new"
                                            checked={condition === 'new'}
                                            onChange={(e) => setCondition(e.target.value as 'new')}
                                            className="mr-2"
                                        />
                                        New
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="refurbished"
                                            checked={condition === 'refurbished'}
                                            onChange={(e) => setCondition(e.target.value as 'refurbished')}
                                            className="mr-2"
                                        />
                                        Refurbished
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listingType === 'direct' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Price *</label>
                                    <input type="number" className="input" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Stock *</label>
                                    <input type="number" className="input" placeholder="1" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Starting Bid *</label>
                                    <input type="number" className="input" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Duration (minutes) *</label>
                                    <select className="input">
                                        <option value="15">15 minutes</option>
                                        <option value="30" selected>30 minutes</option>
                                        <option value="60">1 hour</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Images */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Images</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-600 mb-2">Drag and drop images here or click to browse</p>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="btn btn-primary cursor-pointer">
                            Choose Images
                        </label>
                    </div>

                    {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded" />
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button type="submit" className="btn btn-primary px-8 py-3">
                        Create Listing
                    </button>
                    <button type="button" className="btn btn-outline px-8 py-3">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
