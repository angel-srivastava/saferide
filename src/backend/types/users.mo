import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type Timestamp = CommonTypes.Timestamp;
  public type Role = CommonTypes.Role;
  public type Gender = CommonTypes.Gender;

  public type User = {
    id : UserId;
    var name : Text;
    var phone : Text;
    var photoUrl : Text;
    role : Role;
    var gender : Gender;
    createdAt : Timestamp;
  };

  public type DriverProfile = {
    userId : UserId;
    var vehicleNumber : Text;
    var licenseId : Text;
    var isVerified : Bool;
    var totalRides : Nat;
    var avgRating : Float;
  };

  public type PassengerProfile = {
    userId : UserId;
    var totalRides : Nat;
    var avgRating : Float;
  };

  // Shared (API-boundary) types — no var fields
  public type UserPublic = {
    id : UserId;
    name : Text;
    phone : Text;
    photoUrl : Text;
    role : Role;
    gender : Gender;
    createdAt : Timestamp;
  };

  public type DriverProfilePublic = {
    userId : UserId;
    vehicleNumber : Text;
    licenseId : Text;
    isVerified : Bool;
    totalRides : Nat;
    avgRating : Float;
  };

  public type PassengerProfilePublic = {
    userId : UserId;
    totalRides : Nat;
    avgRating : Float;
  };

  public type RegisterUserRequest = {
    name : Text;
    phone : Text;
    photoUrl : Text;
    role : Role;
    gender : Gender;
  };

  public type RegisterDriverRequest = {
    vehicleNumber : Text;
    licenseId : Text;
  };
};
