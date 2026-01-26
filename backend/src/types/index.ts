export interface User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: 'buyer' | 'seller' | 'admin';
    verification_status: 'unverified' | 'verified' | 'suspended';
    avatar_url?: string;
    bio?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Listing {
    id: string;
    seller_id: string;
    title: string;
    description: string;
    category_id: string;
    type: 'direct' | 'auction';
    condition: 'new' | 'refurbished';
    price: number;
    stock?: number;
    images: string[];
    is_open_box_required: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Auction {
    id: string;
    listing_id: string;
    seller_id: string;
    start_at: Date;
    end_at: Date;
    min_bid: number;
    current_bid: number;
    current_bidder_id?: string;
    status: 'pending' | 'live' | 'ended' | 'cancelled';
    created_at: Date;
}

export interface Bid {
    id: string;
    auction_id: string;
    bidder_id: string;
    amount: number;
    created_at: Date;
}

export interface Order {
    id: string;
    buyer_id: string;
    seller_id: string;
    listing_id: string;
    auction_id?: string;
    quantity: number;
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'disputed' | 'cancelled';
    escrow_release_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Wallet {
    user_id: string;
    balance: number;
    gas_balance: number;
    updated_at: Date;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'topup' | 'charge' | 'refund' | 'hold' | 'release';
    reference_id?: string;
    created_at: Date;
}

export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    credits_remaining: number;
    expires_at: Date;
    created_at: Date;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    payload: Record<string, unknown>;
    read: boolean;
    created_at: Date;
}

export interface Delivery {
    id: string;
    order_id: string;
    provider: string;
    tracking_number: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'failed';
    photos: string[];
    signature_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Dispute {
    id: string;
    order_id: string;
    buyer_id: string;
    reason: string;
    status: 'open' | 'under_review' | 'resolved' | 'closed';
    evidence: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

export interface AuthPayload {
    id: string;
    email: string;
    role: string;
}
