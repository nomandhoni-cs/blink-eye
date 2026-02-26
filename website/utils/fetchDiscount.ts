// utils/fetchDiscount.ts

export interface DiscountResponse {
    isActive: boolean;
    title: string;
    startDate: string;
    endDate: string;
    couponCode: string;
    percentage: number;
    description: string;
}

const BASE_URL = "https://api.blinkeye.app";

export async function getDiscount(): Promise<DiscountResponse> {
    const response = await fetch(`${BASE_URL}/discount`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch discount: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
}