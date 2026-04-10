export type BudgetLevel = 'economy' | 'standard' | 'luxury';
export type TravelStyle = 'relaxed' | 'culture' | 'shopping' | 'adventure' | 'food' | 'family' | 'citywalk';

export interface TripInput {
  destination: string;
  departure: string;
  startDate: string; // YYYY-MM-DD
  days: number;
  budget: BudgetLevel;
  companions: number;
  style: TravelStyle;
  extraNotes?: string;
}

export interface TransitRoute {
  id: string;
  from: string;
  to: string;
  mode: 'bus' | 'subway' | 'walking' | 'taxi' | 'train' | 'flight';
  instructions: string;
  estimatedDuration: string;
  costEstimation: number;
  rideHailingCost: number; // 对应路段的网约车/打车预估花费
}

export interface DailyTransitSummary {
  overviewRoute: string; // 每日整体交通路线（如：酒店 -> 故宫 -> 王府井 -> 酒店）
  totalEstimatedDuration: string;
  totalPublicTransitCost: number;
  medianRideHailingCost: number;
}

export interface Activity {
  id: string;
  time: string; // e.g., "09:00"
  title: string;
  description: string;
  location: string;
  coordinates?: [number, number]; // [经度(longitude), 纬度(latitude)] 高德地图需要
  costEstimation: number;
  type: 'attraction' | 'dining' | 'hotel' | 'transit';
}

export interface DailyPlan {
  day: number;
  date?: string;
  title: string;
  activities: Activity[];
  dailyTransitSummary?: DailyTransitSummary; // 每日整体公共交通规划概览
  transitRoutes?: TransitRoute[]; // 每日各行程段的具体公共交通规划
  foodCoffeeRecommendations?: string[]; // 新增：该天路线附近的的美食与咖啡推荐
}

export interface BudgetBreakdown {
  transport: number;
  hotel: number;
  food: number;
  tickets: number;
  others: number;
  total: number;
  currency: string;
}

export interface TripResult {
  id: string;
  destination: string;
  days: number;
  style?: TravelStyle;
  overview: string;
  dailyPlans: DailyPlan[];
  budgetBreakdown: BudgetBreakdown;
  foodCoffeeRecommendations?: string[]; // 新增：美食与咖啡推荐
  createdAt: string;
}
