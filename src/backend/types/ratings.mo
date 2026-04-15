import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type RideId = CommonTypes.RideId;
  public type RatingId = CommonTypes.RatingId;
  public type Timestamp = CommonTypes.Timestamp;

  public type Rating = {
    id : RatingId;
    rideId : RideId;
    fromUserId : UserId;
    toUserId : UserId;
    score : Nat;
    comment : ?Text;
    createdAt : Timestamp;
  };

  public type SubmitRatingRequest = {
    rideId : RideId;
    toUserId : UserId;
    score : Nat;
    comment : ?Text;
  };

  public type UserRatingSummary = {
    userId : UserId;
    avgScore : Float;
    totalRatings : Nat;
    ratings : [Rating];
  };
};
