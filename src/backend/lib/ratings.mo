import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";
import RatingTypes "../types/ratings";
import RideTypes "../types/rides";

module {
  public type Rating = RatingTypes.Rating;
  public type SubmitRatingRequest = RatingTypes.SubmitRatingRequest;
  public type UserRatingSummary = RatingTypes.UserRatingSummary;

  public func submitRating(
    ratings : Map.Map<CommonTypes.RatingId, Rating>,
    rides : Map.Map<CommonTypes.RideId, RideTypes.Ride>,
    nextId : Nat,
    caller : CommonTypes.UserId,
    req : SubmitRatingRequest,
  ) : (Rating, Nat) {
    // Validate score range
    if (req.score < 1 or req.score > 5) Runtime.trap("Score must be between 1 and 5");
    // Ride must be Completed
    let ride = switch (rides.get(req.rideId)) {
      case (?r) r;
      case null Runtime.trap("Ride not found");
    };
    if (ride.status != #Completed) Runtime.trap("Ride must be Completed before rating");
    // Caller must be a participant
    let isPassenger = Principal.equal(ride.passengerId, caller);
    let isDriver = switch (ride.driverId) {
      case (?did) Principal.equal(did, caller);
      case null false;
    };
    if (not isPassenger and not isDriver) Runtime.trap("Not a participant of this ride");
    // Prevent duplicate ratings: check if caller already rated toUserId for this rideId
    for ((_, existing) in ratings.entries()) {
      if (existing.rideId == req.rideId and Principal.equal(existing.fromUserId, caller)) {
        Runtime.trap("You have already submitted a rating for this ride");
      };
    };
    let rating : Rating = {
      id = nextId;
      rideId = req.rideId;
      fromUserId = caller;
      toUserId = req.toUserId;
      score = req.score;
      comment = req.comment;
      createdAt = Time.now();
    };
    ratings.add(nextId, rating);
    (rating, nextId + 1)
  };

  public func getRatingsForUser(
    ratings : Map.Map<CommonTypes.RatingId, Rating>,
    userId : CommonTypes.UserId,
  ) : UserRatingSummary {
    let userRatings = List.empty<Rating>();
    for ((_, r) in ratings.entries()) {
      if (Principal.equal(r.toUserId, userId)) {
        userRatings.add(r);
      };
    };
    let arr = userRatings.toArray();
    let total = arr.size();
    var sumScore : Nat = 0;
    for (r in arr.values()) {
      sumScore := sumScore + r.score;
    };
    let avg : Float = if (total == 0) 0.0 else sumScore.toFloat() / total.toFloat();
    {
      userId;
      avgScore = avg;
      totalRatings = total;
      ratings = arr;
    }
  };

  // Called after rating submission to update profile avgRating
  public func recalcAvgRating(
    ratings : Map.Map<CommonTypes.RatingId, Rating>,
    userId : CommonTypes.UserId,
  ) : Float {
    let summary = getRatingsForUser(ratings, userId);
    summary.avgScore
  };
};
