import Map "mo:core/Map";
import CommonTypes "../types/common";
import RideTypes "../types/rides";
import UserTypes "../types/users";
import LandmarkTypes "../types/landmarks";
import RideLib "../lib/rides";

mixin (
  rides : Map.Map<CommonTypes.RideId, RideTypes.Ride>,
  users : Map.Map<CommonTypes.UserId, UserTypes.User>,
  driverProfiles : Map.Map<CommonTypes.UserId, UserTypes.DriverProfile>,
  passProfiles : Map.Map<CommonTypes.UserId, UserTypes.PassengerProfile>,
  landmarks : Map.Map<CommonTypes.LandmarkId, LandmarkTypes.Landmark>,
  nextRideId : [var Nat],
) {
  public shared ({ caller }) func createRide(req : RideTypes.CreateRideRequest) : async RideTypes.RidePublic {
    let (pub, newId) = RideLib.createRide(rides, nextRideId[0], caller, req, landmarks);
    nextRideId[0] := newId;
    pub
  };

  public query func getRideById(rideId : CommonTypes.RideId) : async ?RideTypes.RidePublic {
    RideLib.getRideById(rides, rideId)
  };

  public query ({ caller }) func getMyRideHistory() : async [RideTypes.RidePublic] {
    RideLib.getPassengerHistory(rides, caller)
  };

  public query ({ caller }) func getDriverRideHistory() : async [RideTypes.RidePublic] {
    RideLib.getDriverHistory(rides, caller)
  };

  public query ({ caller }) func getIncomingRideRequests() : async [RideTypes.RidePublic] {
    RideLib.getIncomingRequestsForDriver(rides, users, driverProfiles, caller)
  };

  public query func listAvailableDrivers(rideId : CommonTypes.RideId) : async [RideTypes.AvailableDriver] {
    RideLib.listAvailableDrivers(rides, users, driverProfiles, rideId)
  };

  public shared ({ caller }) func acceptRide(rideId : CommonTypes.RideId) : async RideTypes.RidePublic {
    RideLib.driverAcceptRide(rides, caller, rideId)
  };

  public shared ({ caller }) func rejectRide(rideId : CommonTypes.RideId) : async RideTypes.RidePublic {
    RideLib.driverRejectRide(rides, caller, rideId)
  };

  public shared ({ caller }) func markPickup(rideId : CommonTypes.RideId) : async RideTypes.RidePublic {
    RideLib.driverMarkPickup(rides, caller, rideId)
  };

  public shared ({ caller }) func markDropoff(rideId : CommonTypes.RideId) : async RideTypes.RidePublic {
    RideLib.driverMarkDropoff(rides, driverProfiles, passProfiles, caller, rideId)
  };

  public shared ({ caller }) func cancelRide(rideId : CommonTypes.RideId) : async RideTypes.RidePublic {
    RideLib.passengerCancelRide(rides, caller, rideId)
  };

  public query func previewFare(pickupId : CommonTypes.LandmarkId, dropoffId : CommonTypes.LandmarkId) : async RideTypes.FarePreview {
    RideLib.previewFare(landmarks, pickupId, dropoffId)
  };
};
