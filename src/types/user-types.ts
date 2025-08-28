export interface AppUser {
	_id: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	username?: string;
	phone_Number?: string;
	role?: string;
	last_login?: string;
	cartId?: string | null;
	wishlistId?: string | null;
	fcmToken?: string | null;
	address?: any[];
	vehicle_details?: any[];
}

export interface ApiListResponse<T> {
	success: boolean;
	message: string;
	data: T;
}