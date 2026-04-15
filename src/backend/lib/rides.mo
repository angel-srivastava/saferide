import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";
import RideTypes "../types/rides";
import UserTypes "../types/users";
import LandmarkTypes "../types/landmarks";

module {
  public type Ride = RideTypes.Ride;
  public type RidePublic = RideTypes.RidePublic;
  public type CreateRideRequest = RideTypes.CreateRideRequest;
  public type FarePreview = RideTypes.FarePreview;
  public type AvailableDriver = RideTypes.AvailableDriver;

  let BASE_RATE_PER_KM : Float = 12.0;
  let MIN_FARE : Float = 50.0;

  // Approximate distance in km using equirectangular projection
  func distanceKm(lat1 : Float, lon1 : Float, lat2 : Float, lon2 : Float) : Float {
    let dLat = (lat2 - lat1) * 111.0;
    let avgLat = (lat1 + lat2) / 2.0;
    // crude cosine approximation: cos(x) ≈ 1 - x²/2 for small x in radians
    let latRad = avgLat * 0.01745329252;
    let cosApprox : Float = 1.0 - (latRad * latRad / 2.0);
    let dLon = (lon2 - lon1) * 111.0 * cosApprox;
    // Use Manhattan-style approximation to avoid sqrt dependency
    let absDLat = if (dLat < 0.0) -dLat else dLat;
    let absDLon = if (dLon < 0.0) -dLon else dLon;
    (absDLat + absDLon) * 0.7071 // scale factor ≈ sqrt(2)/2 to convert Manhattan to Euclidean
  };

  func calcFare(km : Float) : Float {
    let raw = km * BASE_RATE_PER_KM;
    if (raw < MIN_FARE) MIN_FARE else raw
  };

  public func toPublicRide(r : Ride) : RidePublic {
    {
      id = r.id;
      passengerId = r.passengerId;
      driverId = r.driverId;
      pickupLandmarkId = r.pickupLandmarkId;
      dropoffLandmarkId = r.dropoffLandmarkId;
      rideType = r.rideType;
      genderPreference = r.genderPreference;
      status = r.status;
      farePerPassenger = r.farePerPassenger;
      totalPassengers = r.totalPassengers;
      requestedAt = r.requestedAt;
      startedAt = r.startedAt;
      completedAt = r.completedAt;
    }
  };

  public func previewFare(
    landmarks : Map.Map<CommonTypes.LandmarkId, LandmarkTypes.Landmark>,
    pickupId : CommonTypes.LandmarkId,
    dropoffId : CommonTypes.LandmarkId,
  ) : FarePreview {
    let pickup = switch (landmarks.get(pickupId)) {
      case (?l) l;
      case null { return { totalFare = MIN_FARE; fareFor1 = MIN_FARE; fareFor2 = MIN_FARE / 2.0; fareFor3 = MIN_FARE / 3.0; fareFor4 = MIN_FARE / 4.0; distanceKm = 0.0 } };
    };
    let dropoff = switch (landmarks.get(dropoffId)) {
      case (?l) l;
      case null { return { totalFare = MIN_FARE; fareFor1 = MIN_FARE; fareFor2 = MIN_FARE / 2.0; fareFor3 = MIN_FARE / 3.0; fareFor4 = MIN_FARE / 4.0; distanceKm = 0.0 } };
    };
    let km = distanceKm(pickup.latitude, pickup.longitude, dropoff.latitude, dropoff.longitude);
    let total = calcFare(km);
    {
      totalFare = total;
      fareFor1 = total;
      fareFor2 = total / 2.0;
      fareFor3 = total / 3.0;
      fareFor4 = total / 4.0;
      distanceKm = km;
    }
  };

  public func createRide(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    nextId : Nat,
    caller : CommonTypes.UserId,
    req : CreateRideRequest,
    landmarks : Map.Map<CommonTypes.LandmarkId, LandmarkTypes.Landmark>,
  ) : (RidePublic, Nat) {
    let preview = previewFare(landmarks, req.pickupLandmarkId, req.dropoffLandmarkId);
    let numPax : Nat = if (req.totalPassengers == 0) 1 else req.totalPassengers;
    let farePerPax : Float = preview.totalFare / numPax.toFloat();
    let ride : Ride = {
      id = nextId;
      passengerId = caller;
      var driverId = null;
      pickupLandmarkId = req.pickupLandmarkId;
      dropoffLandmarkId = req.dropoffLandmarkId;
      rideType = req.rideType;
      genderPreference = req.genderPreference;
      var status = #Requested;
      farePerPassenger = farePerPax;
      var totalPassengers = numPax;
      requestedAt = Time.now();
      var startedAt = null;
      var completedAt = null;
    };
    rides.add(nextId, ride);
    (toPublicRide(ride), nextId + 1)
  };

  public func getRideById(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    rideId : CommonTypes.RideId,
  ) : ?RidePublic {
    switch (rides.get(rideId)) {
      case (?r) ?toPublicRide(r);
      case null null;
    }
  };

  public func getPassengerHistory(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    passengerId : CommonTypes.UserId,
  ) : [RidePublic] {
    let results = List.empty<RidePublic>();
    for ((_, ride) in rides.entries()) {
      if (Principal.equal(ride.passengerId, passengerId)) {
        results.add(toPublicRide(ride));
      };
    };
    // Sort descending by requestedAt
    results.sortInPlace(func(a : RidePublic, b : RidePublic) : Order.Order { Int.compare(b.requestedAt, a.requestedAt) });
    results.toArray()
  };

  public func getDriverHistory(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    driverId : CommonTypes.UserId,
  ) : [RidePublic] {
    let results = List.empty<RidePublic>();
    for ((_, ride) in rides.entries()) {
      switch (ride.driverId) {
        case (?did) {
          if (Principal.equal(did, driverId)) {
            results.add(toPublicRide(ride));
          };
        };
        case null {};
      };
    };
    results.sortInPlace(func(a : RidePublic, b : RidePublic) : Order.Order { Int.compare(b.requestedAt, a.requestedAt) });
    results.toArray()
  };

  public func getIncomingRequestsForDriver(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    users : Map.Map<CommonTypes.UserId, UserTypes.User>,
    driverProfiles : Map.Map<CommonTypes.UserId, UserTypes.DriverProfile>,
    driverId : CommonTypes.UserId,
  ) : [RidePublic] {
    // Check driver gender for WomenOnly eligibility
    let driverGender : ?CommonTypes.Gender = switch (users.get(driverId)) {
      case (?u) ?u.gender;
      case null null;
    };
    let results = List.empty<RidePublic>();
    for ((_, ride) in rides.entries()) {
      if (ride.status == #Requested) {
        // WomenOnly rides require female driver
        let eligible = switch (ride.rideType) {
          case (#WomenOnly) {
            switch (driverGender) {
              case (?(#Female)) true;
              case _ false;
            }
          };
          case (#General) true;
        };
        if (eligible) {
          results.add(toPublicRide(ride));
        };
      };
    };
    results.toArray()
  };

  public func listAvailableDrivers(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    users : Map.Map<CommonTypes.UserId, UserTypes.User>,
    driverProfiles : Map.Map<CommonTypes.UserId, UserTypes.DriverProfile>,
    rideId : CommonTypes.RideId,
  ) : [AvailableDriver] {
    let ride = switch (rides.get(rideId)) {
      case (?r) r;
      case null { return [] };
    };
    let results = List.empty<AvailableDriver>();
    label driverLoop for ((uid, profile) in driverProfiles.entries()) {
      let user = switch (users.get(uid)) {
        case (?u) u;
        case null { continue driverLoop };
      };
      // Filter by gender eligibility
      let eligible = switch (ride.rideType) {
        case (#WomenOnly) { user.gender == #Female };
        case (#General) {
          switch (ride.genderPreference) {
            case (#Male) { user.gender == #Male };
            case (#Female) { user.gender == #Female };
            case (#NoPreference) true;
          }
        };
      };
      if (eligible) {
        results.add({
          driverId = uid;
          name = user.name;
          photoUrl = user.photoUrl;
          vehicleNumber = profile.vehicleNumber;
          avgRating = profile.avgRating;
          totalRides = profile.totalRides;
          isVerified = profile.isVerified;
        });
      };
    };
    results.toArray()
  };

  public func driverAcceptRide(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    driverId : CommonTypes.UserId,
    rideId : CommonTypes.RideId,
  ) : RidePublic {
    let ride = switch (rides.get(rideId)) {
      case (?r) r;
      case null Runtime.trap("Ride not found");
    };
    if (ride.status != #Requested) Runtime.trap("Ride is not in Requested status");
    ride.driverId := ?driverId;
    ride.status := #Accepted;
    toPublicRide(ride)
  };

  public func driverRejectRide(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    driverId : CommonTypes.UserId,
    rideId : CommonTypes.RideId,
  ) : RidePublic {
    let ride = switch (rides.get(rideId)) {
      case (?r) r;
      case null Runtime.trap("Ride not found");
    };
    // Only the assigned driver can reject (or any driver if still Requested)
    switch (ride.status) {
      case (#Accepted) {
        switch (ride.driverId) {
          case (?did) {
            if (not Principal.equal(did, driverId)) Runtime.trap("Not the assigned driver");
          };
          case null {};
        };
        ride.driverId := null;
        ride.status := #Requested;
      };
      case (#Requested) {
        // Nothing to do — ride simply remains Requested
      };
      case _ Runtime.trap("Cannot reject ride in current status");
    };
    toPublicRide(ride)
  };

  public func driverMarkPickup(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    driverId : CommonTypes.UserId,
    rideId : CommonTypes.RideId,
  ) : RidePublic {
    let ride = switch (rides.get(rideId)) {
      case (?r) r;
      case null Runtime.trap("Ride not found");
    };
    if (ride.status != #Accepted) Runtime.trap("Ride must be Accepted before pickup");
    switch (ride.driverId) {
      case (?did) { if (not Principal.equal(did, driverId)) Runtime.trap("Not the assigned driver") };
      case null Runtime.trap("No driver assigned");
    };
    ride.status := #InProgress;
    ride.startedAt := ?Time.now();
    toPublicRide(ride)
  };

  public func driverMarkDropoff(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    driverProfiles : Map.Map<CommonTypes.UserId, UserTypes.DriverProfile>,
    passProfiles : Map.Map<CommonTypes.UserId, UserTypes.PassengerProfile>,
    driverId : CommonTypes.UserId,
    rideId : CommonTypes.RideId,
  ) : RidePublic {
    let ride = switch (rides.get(rideId)) {
      case (?r) r;
      case null Runtime.trap("Ride not found");
    };
    if (ride.status != #InProgress) Runtime.trap("Ride must be InProgress before dropoff");
    switch (ride.driverId) {
      case (?did) { if (not Principal.equal(did, driverId)) Runtime.trap("Not the assigned driver") };
      case null Runtime.trap("No driver assigned");
    };
    ride.status := #Completed;
    ride.completedAt := ?Time.now();
    // Increment driver totalRides
    switch (driverProfiles.get(driverId)) {
      case (?dp) { dp.totalRides := dp.totalRides + 1 };
      case null {};
    };
    // Increment passenger totalRides
    switch (passProfiles.get(ride.passengerId)) {
      case (?pp) { pp.totalRides := pp.totalRides + 1 };
      case null {};
    };
    toPublicRide(ride)
  };

  public func passengerCancelRide(
    rides : Map.Map<CommonTypes.RideId, Ride>,
    passengerId : CommonTypes.UserId,
    rideId : CommonTypes.RideId,
  ) : RidePublic {
    let ride = switch (rides.get(rideId)) {
      case (?r) r;
      case null Runtime.trap("Ride not found");
    };
    if (not Principal.equal(ride.passengerId, passengerId)) Runtime.trap("Not your ride");
    switch (ride.status) {
      case (#Requested or #Accepted) {};
      case _ Runtime.trap("Cannot cancel ride in current status");
    };
    ride.status := #Cancelled;
    toPublicRide(ride)
  };
};
