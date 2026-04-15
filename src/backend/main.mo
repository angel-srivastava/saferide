import Map "mo:core/Map";
import CommonTypes "types/common";
import UserTypes "types/users";
import LandmarkTypes "types/landmarks";
import RideTypes "types/rides";
import RatingTypes "types/ratings";
import LandmarkLib "lib/landmarks";
import UsersApi "mixins/users-api";
import LandmarksApi "mixins/landmarks-api";
import RidesApi "mixins/rides-api";
import RatingsApi "mixins/ratings-api";

actor {
  // State
  let users = Map.empty<CommonTypes.UserId, UserTypes.User>();
  let driverProfiles = Map.empty<CommonTypes.UserId, UserTypes.DriverProfile>();
  let passProfiles = Map.empty<CommonTypes.UserId, UserTypes.PassengerProfile>();
  let landmarks = Map.empty<CommonTypes.LandmarkId, LandmarkTypes.Landmark>();
  let rides = Map.empty<CommonTypes.RideId, RideTypes.Ride>();
  let ratings = Map.empty<CommonTypes.RatingId, RatingTypes.Rating>();
  let nextRideId = [var 0 : Nat];
  let nextRatingId = [var 0 : Nat];
  let nextLandmarkId = [var 0 : Nat];

  // Seed preset landmarks on first deploy (landmarks map starts empty)
  if (landmarks.isEmpty()) {
    nextLandmarkId[0] := LandmarkLib.seedLandmarks(landmarks, nextLandmarkId[0]);
  };

  // Mixins
  include UsersApi(users, driverProfiles, passProfiles);
  include LandmarksApi(landmarks);
  include RidesApi(rides, users, driverProfiles, passProfiles, landmarks, nextRideId);
  include RatingsApi(ratings, rides, driverProfiles, passProfiles, nextRatingId);
};
