import Map "mo:core/Map";
import CommonTypes "../types/common";
import RatingTypes "../types/ratings";
import RideTypes "../types/rides";
import UserTypes "../types/users";
import RatingLib "../lib/ratings";

mixin (
  ratings : Map.Map<CommonTypes.RatingId, RatingTypes.Rating>,
  rides : Map.Map<CommonTypes.RideId, RideTypes.Ride>,
  driverProfiles : Map.Map<CommonTypes.UserId, UserTypes.DriverProfile>,
  passProfiles : Map.Map<CommonTypes.UserId, UserTypes.PassengerProfile>,
  nextRatingId : [var Nat],
) {
  public shared ({ caller }) func submitRating(req : RatingTypes.SubmitRatingRequest) : async RatingTypes.Rating {
    let (rating, newId) = RatingLib.submitRating(ratings, rides, nextRatingId[0], caller, req);
    nextRatingId[0] := newId;
    // Update avgRating on the rated user's profile
    let newAvg = RatingLib.recalcAvgRating(ratings, req.toUserId);
    switch (driverProfiles.get(req.toUserId)) {
      case (?dp) { dp.avgRating := newAvg };
      case null {};
    };
    switch (passProfiles.get(req.toUserId)) {
      case (?pp) { pp.avgRating := newAvg };
      case null {};
    };
    rating
  };

  public query func getRatingsForUser(userId : CommonTypes.UserId) : async RatingTypes.UserRatingSummary {
    RatingLib.getRatingsForUser(ratings, userId)
  };
};
