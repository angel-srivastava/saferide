module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type RideId = Nat;
  public type LandmarkId = Nat;
  public type RatingId = Nat;

  public type Role = {
    #Passenger;
    #Driver;
  };

  public type RideType = {
    #WomenOnly;
    #General;
  };

  public type GenderPreference = {
    #Male;
    #Female;
    #NoPreference;
  };

  public type RideStatus = {
    #Requested;
    #Accepted;
    #InProgress;
    #Completed;
    #Cancelled;
  };

  public type LandmarkType = {
    #Metro;
    #Chowk;
    #Hospital;
    #Station;
    #Landmark;
  };

  public type Gender = {
    #Male;
    #Female;
    #Other;
  };
};
