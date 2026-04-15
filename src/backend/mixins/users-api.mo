import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import UserLib "../lib/users";
import CommonTypes "../types/common";
import UserTypes "../types/users";

mixin (
  users : Map.Map<CommonTypes.UserId, UserTypes.User>,
  driverProfiles : Map.Map<CommonTypes.UserId, UserTypes.DriverProfile>,
  passProfiles : Map.Map<CommonTypes.UserId, UserTypes.PassengerProfile>,
) {
  public shared ({ caller }) func registerUser(req : UserTypes.RegisterUserRequest) : async UserTypes.UserPublic {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: anonymous caller");
    if (users.containsKey(caller)) Runtime.trap("AlreadyRegistered: user exists");
    UserLib.registerUser(users, passProfiles, caller, req);
  };

  public shared ({ caller }) func registerDriverProfile(req : UserTypes.RegisterDriverRequest) : async UserTypes.DriverProfilePublic {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: anonymous caller");
    let user = switch (users.get(caller)) {
      case (?u) u;
      case null Runtime.trap("NotRegistered: register as user first");
    };
    switch (user.role) {
      case (#Driver) {};
      case (#Passenger) Runtime.trap("Forbidden: only drivers can register a driver profile");
    };
    if (driverProfiles.containsKey(caller)) Runtime.trap("AlreadyRegistered: driver profile exists");
    UserLib.registerDriver(users, driverProfiles, caller, req);
  };

  public query func getUser(userId : CommonTypes.UserId) : async ?UserTypes.UserPublic {
    UserLib.getUser(users, userId);
  };

  public query func getDriverProfile(userId : CommonTypes.UserId) : async ?UserTypes.DriverProfilePublic {
    UserLib.getDriverProfile(driverProfiles, userId);
  };

  public query func getPassengerProfile(userId : CommonTypes.UserId) : async ?UserTypes.PassengerProfilePublic {
    UserLib.getPassengerProfile(passProfiles, userId);
  };

  public query ({ caller }) func getMyProfile() : async ?UserTypes.UserPublic {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: anonymous caller");
    UserLib.getUser(users, caller);
  };

  public shared ({ caller }) func updateUserPhoto(photoUrl : Text) : async () {
    if (caller.isAnonymous()) Runtime.trap("Unauthorized: anonymous caller");
    if (not users.containsKey(caller)) Runtime.trap("NotRegistered: user not found");
    UserLib.updateUserPhoto(users, caller, photoUrl);
  };
};
