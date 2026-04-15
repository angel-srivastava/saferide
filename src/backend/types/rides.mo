import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type RideId = CommonTypes.RideId;
  public type LandmarkId = CommonTypes.LandmarkId;
  public type Timestamp = CommonTypes.Timestamp;
  public type RideType = CommonTypes.RideType;
  public type GenderPreference = CommonTypes.GenderPreference;
  public type RideStatus = CommonTypes.RideStatus;

  public type Ride = {
    id : RideId;
    passengerId : UserId;
    var driverId : ?UserId;
    pickupLandmarkId : LandmarkId;
    dropoffLandmarkId : LandmarkId;
    rideType : RideType;
    genderPreference : GenderPreference;
    var status : RideStatus;
    farePerPassenger : Float;
    var totalPassengers : Nat;
    requestedAt : Timestamp;
    var startedAt : ?Timestamp;
    var completedAt : ?Timestamp;
  };

  // Shared API boundary type — no var fields
  public type RidePublic = {
    id : RideId;
    passengerId : UserId;
    driverId : ?UserId;
    pickupLandmarkId : LandmarkId;
    dropoffLandmarkId : LandmarkId;
    rideType : RideType;
    genderPreference : GenderPreference;
    status : RideStatus;
    farePerPassenger : Float;
    totalPassengers : Nat;
    requestedAt : Timestamp;
    startedAt : ?Timestamp;
    completedAt : ?Timestamp;
  };

  public type CreateRideRequest = {
    pickupLandmarkId : LandmarkId;
    dropoffLandmarkId : LandmarkId;
    rideType : RideType;
    genderPreference : GenderPreference;
    totalPassengers : Nat;
  };

  public type FarePreview = {
    totalFare : Float;
    fareFor1 : Float;
    fareFor2 : Float;
    fareFor3 : Float;
    fareFor4 : Float;
    distanceKm : Float;
  };

  public type AvailableDriver = {
    driverId : UserId;
    name : Text;
    photoUrl : Text;
    vehicleNumber : Text;
    avgRating : Float;
    totalRides : Nat;
    isVerified : Bool;
  };
};
