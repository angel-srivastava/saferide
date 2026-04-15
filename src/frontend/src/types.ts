import type { Principal } from "@icp-sdk/core/principal";

// Re-export enums from backend for use in UI
export {
  Gender,
  GenderPreference,
  LandmarkType,
  RideStatus,
  RideType,
  Role,
} from "./backend";

export type UserId = Principal;
export type LandmarkId = bigint;
export type RideId = bigint;
export type Timestamp = bigint;
export type RatingId = bigint;

export interface Landmark {
  id: LandmarkId;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  landmarkType: import("./backend").LandmarkType;
}

export interface UserPublic {
  id: UserId;
  name: string;
  createdAt: Timestamp;
  role: import("./backend").Role;
  photoUrl: string;
  gender: import("./backend").Gender;
  phone: string;
}

export interface DriverProfilePublic {
  userId: UserId;
  vehicleNumber: string;
  licenseId: string;
  isVerified: boolean;
  totalRides: bigint;
  avgRating: number;
}

export interface PassengerProfilePublic {
  userId: UserId;
  totalRides: bigint;
  avgRating: number;
}

export interface RidePublic {
  id: RideId;
  status: import("./backend").RideStatus;
  completedAt?: Timestamp;
  driverId?: UserId;
  startedAt?: Timestamp;
  totalPassengers: bigint;
  genderPreference: import("./backend").GenderPreference;
  passengerId: UserId;
  pickupLandmarkId: LandmarkId;
  farePerPassenger: number;
  rideType: import("./backend").RideType;
  requestedAt: Timestamp;
  dropoffLandmarkId: LandmarkId;
}

export interface FarePreview {
  totalFare: number;
  fareFor1: number;
  fareFor2: number;
  fareFor3: number;
  fareFor4: number;
  distanceKm: number;
}

export interface AvailableDriver {
  driverId: UserId;
  vehicleNumber: string;
  name: string;
  photoUrl: string;
  isVerified: boolean;
  totalRides: bigint;
  avgRating: number;
}

export interface Rating {
  id: RatingId;
  createdAt: Timestamp;
  rideId: RideId;
  toUserId: UserId;
  fromUserId: UserId;
  score: bigint;
  comment?: string;
}

export interface UserRatingSummary {
  userId: UserId;
  avgScore: number;
  totalRatings: bigint;
  ratings: Rating[];
}

export interface RegisterUserRequest {
  name: string;
  role: import("./backend").Role;
  photoUrl: string;
  gender: import("./backend").Gender;
  phone: string;
}

export interface CreateRideRequest {
  pickupLandmarkId: LandmarkId;
  dropoffLandmarkId: LandmarkId;
  rideType: import("./backend").RideType;
  genderPreference: import("./backend").GenderPreference;
  totalPassengers: bigint;
}

export interface SubmitRatingRequest {
  rideId: RideId;
  toUserId: UserId;
  score: bigint;
  comment?: string;
}
