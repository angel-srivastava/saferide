import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/users";
import CommonTypes "../types/common";

module {
  public type User = Types.User;
  public type DriverProfile = Types.DriverProfile;
  public type PassengerProfile = Types.PassengerProfile;
  public type UserPublic = Types.UserPublic;
  public type DriverProfilePublic = Types.DriverProfilePublic;
  public type PassengerProfilePublic = Types.PassengerProfilePublic;
  public type RegisterUserRequest = Types.RegisterUserRequest;
  public type RegisterDriverRequest = Types.RegisterDriverRequest;

  public func toPublicUser(u : User) : UserPublic {
    {
      id = u.id;
      name = u.name;
      phone = u.phone;
      photoUrl = u.photoUrl;
      role = u.role;
      gender = u.gender;
      createdAt = u.createdAt;
    };
  };

  public func toPublicDriver(d : DriverProfile) : DriverProfilePublic {
    {
      userId = d.userId;
      vehicleNumber = d.vehicleNumber;
      licenseId = d.licenseId;
      isVerified = d.isVerified;
      totalRides = d.totalRides;
      avgRating = d.avgRating;
    };
  };

  public func toPublicPassenger(p : PassengerProfile) : PassengerProfilePublic {
    {
      userId = p.userId;
      totalRides = p.totalRides;
      avgRating = p.avgRating;
    };
  };

  public func registerUser(
    users : Map.Map<CommonTypes.UserId, User>,
    passProfiles : Map.Map<CommonTypes.UserId, PassengerProfile>,
    caller : CommonTypes.UserId,
    req : RegisterUserRequest,
  ) : UserPublic {
    if (caller.isAnonymous()) {
      assert false; // unreachable — guarded in mixin
    };
    switch (users.get(caller)) {
      case (?_) { assert false }; // already registered — guarded in mixin
      case null {};
    };
    let now = Time.now();
    let user : User = {
      id = caller;
      var name = req.name;
      var phone = req.phone;
      var photoUrl = req.photoUrl;
      role = req.role;
      var gender = req.gender;
      createdAt = now;
    };
    users.add(caller, user);
    // Auto-create passenger profile for all users (passengers and drivers both ride)
    switch (req.role) {
      case (#Passenger) {
        let passengerProfile : PassengerProfile = {
          userId = caller;
          var totalRides = 0;
          var avgRating = 0.0;
        };
        passProfiles.add(caller, passengerProfile);
      };
      case (#Driver) {};
    };
    toPublicUser(user);
  };

  public func registerDriver(
    users : Map.Map<CommonTypes.UserId, User>,
    driverProfiles : Map.Map<CommonTypes.UserId, DriverProfile>,
    caller : CommonTypes.UserId,
    req : RegisterDriverRequest,
  ) : DriverProfilePublic {
    // Verify caller is a registered Driver — guarded in mixin
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null { assert false; loop {} };
    };
    ignore user;
    switch (driverProfiles.get(caller)) {
      case (?_) { assert false }; // already registered — guarded in mixin
      case null {};
    };
    let profile : DriverProfile = {
      userId = caller;
      var vehicleNumber = req.vehicleNumber;
      var licenseId = req.licenseId;
      var isVerified = false;
      var totalRides = 0;
      var avgRating = 0.0;
    };
    driverProfiles.add(caller, profile);
    toPublicDriver(profile);
  };

  public func getUser(
    users : Map.Map<CommonTypes.UserId, User>,
    userId : CommonTypes.UserId,
  ) : ?UserPublic {
    switch (users.get(userId)) {
      case (?u) ?toPublicUser(u);
      case null null;
    };
  };

  public func getDriverProfile(
    driverProfiles : Map.Map<CommonTypes.UserId, DriverProfile>,
    userId : CommonTypes.UserId,
  ) : ?DriverProfilePublic {
    switch (driverProfiles.get(userId)) {
      case (?d) ?toPublicDriver(d);
      case null null;
    };
  };

  public func getPassengerProfile(
    passProfiles : Map.Map<CommonTypes.UserId, PassengerProfile>,
    userId : CommonTypes.UserId,
  ) : ?PassengerProfilePublic {
    switch (passProfiles.get(userId)) {
      case (?p) ?toPublicPassenger(p);
      case null null;
    };
  };

  public func updateUserPhoto(
    users : Map.Map<CommonTypes.UserId, User>,
    caller : CommonTypes.UserId,
    photoUrl : Text,
  ) : () {
    switch (users.get(caller)) {
      case (?u) { u.photoUrl := photoUrl };
      case null { assert false }; // not registered — guarded in mixin
    };
  };
};
