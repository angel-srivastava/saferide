import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RegisterUserRequest {
    name: string;
    role: Role;
    photoUrl: string;
    gender: Gender;
    phone: string;
}
export type Timestamp = bigint;
export interface Rating {
    id: RatingId;
    createdAt: Timestamp;
    rideId: RideId;
    toUserId: UserId;
    score: bigint;
    comment?: string;
    fromUserId: UserId;
}
export interface UserPublic {
    id: UserId;
    name: string;
    createdAt: Timestamp;
    role: Role;
    photoUrl: string;
    gender: Gender;
    phone: string;
}
export interface PassengerProfilePublic {
    userId: UserId;
    totalRides: bigint;
    avgRating: number;
}
export type LandmarkId = bigint;
export interface RegisterDriverRequest {
    vehicleNumber: string;
    licenseId: string;
}
export type RideId = bigint;
export interface CreateRideRequest {
    totalPassengers: bigint;
    genderPreference: GenderPreference;
    pickupLandmarkId: LandmarkId;
    rideType: RideType;
    dropoffLandmarkId: LandmarkId;
}
export interface UserRatingSummary {
    totalRatings: bigint;
    avgScore: number;
    userId: UserId;
    ratings: Array<Rating>;
}
export type UserId = Principal;
export interface RidePublic {
    id: RideId;
    status: RideStatus;
    completedAt?: Timestamp;
    driverId?: UserId;
    startedAt?: Timestamp;
    totalPassengers: bigint;
    genderPreference: GenderPreference;
    passengerId: UserId;
    pickupLandmarkId: LandmarkId;
    farePerPassenger: number;
    rideType: RideType;
    requestedAt: Timestamp;
    dropoffLandmarkId: LandmarkId;
}
export interface Landmark {
    id: LandmarkId;
    latitude: number;
    landmarkType: LandmarkType;
    city: string;
    name: string;
    longitude: number;
}
export interface SubmitRatingRequest {
    rideId: RideId;
    toUserId: UserId;
    score: bigint;
    comment?: string;
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
export type RatingId = bigint;
export interface DriverProfilePublic {
    userId: UserId;
    vehicleNumber: string;
    licenseId: string;
    isVerified: boolean;
    totalRides: bigint;
    avgRating: number;
}
export enum Gender {
    Male = "Male",
    Female = "Female",
    Other = "Other"
}
export enum GenderPreference {
    Male = "Male",
    NoPreference = "NoPreference",
    Female = "Female"
}
export enum LandmarkType {
    Station = "Station",
    Landmark = "Landmark",
    Metro = "Metro",
    Chowk = "Chowk",
    Hospital = "Hospital"
}
export enum RideStatus {
    Accepted = "Accepted",
    Requested = "Requested",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
    Completed = "Completed"
}
export enum RideType {
    WomenOnly = "WomenOnly",
    General = "General"
}
export enum Role {
    Driver = "Driver",
    Passenger = "Passenger"
}
export interface backendInterface {
    acceptRide(rideId: RideId): Promise<RidePublic>;
    cancelRide(rideId: RideId): Promise<RidePublic>;
    createRide(req: CreateRideRequest): Promise<RidePublic>;
    getAllLandmarks(): Promise<Array<Landmark>>;
    getDriverProfile(userId: UserId): Promise<DriverProfilePublic | null>;
    getDriverRideHistory(): Promise<Array<RidePublic>>;
    getIncomingRideRequests(): Promise<Array<RidePublic>>;
    getLandmarkById(id: LandmarkId): Promise<Landmark | null>;
    getLandmarkDistance(fromId: LandmarkId, toId: LandmarkId): Promise<number | null>;
    getLandmarksByCity(city: string): Promise<Array<Landmark>>;
    getMyProfile(): Promise<UserPublic | null>;
    getMyRideHistory(): Promise<Array<RidePublic>>;
    getPassengerProfile(userId: UserId): Promise<PassengerProfilePublic | null>;
    getRatingsForUser(userId: UserId): Promise<UserRatingSummary>;
    getRideById(rideId: RideId): Promise<RidePublic | null>;
    getUser(userId: UserId): Promise<UserPublic | null>;
    listAvailableDrivers(rideId: RideId): Promise<Array<AvailableDriver>>;
    markDropoff(rideId: RideId): Promise<RidePublic>;
    markPickup(rideId: RideId): Promise<RidePublic>;
    previewFare(pickupId: LandmarkId, dropoffId: LandmarkId): Promise<FarePreview>;
    registerDriverProfile(req: RegisterDriverRequest): Promise<DriverProfilePublic>;
    registerUser(req: RegisterUserRequest): Promise<UserPublic>;
    rejectRide(rideId: RideId): Promise<RidePublic>;
    submitRating(req: SubmitRatingRequest): Promise<Rating>;
    updateUserPhoto(photoUrl: string): Promise<void>;
}
