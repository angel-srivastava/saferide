import Map "mo:core/Map";
import CommonTypes "../types/common";
import LandmarkTypes "../types/landmarks";
import LandmarkLib "../lib/landmarks";

mixin (
  landmarks : Map.Map<CommonTypes.LandmarkId, LandmarkTypes.Landmark>,
) {
  public query func getAllLandmarks() : async [LandmarkTypes.Landmark] {
    LandmarkLib.getAllLandmarks(landmarks);
  };

  public query func getLandmarksByCity(city : Text) : async [LandmarkTypes.Landmark] {
    LandmarkLib.getLandmarksByCity(landmarks, city);
  };

  public query func getLandmarkById(id : CommonTypes.LandmarkId) : async ?LandmarkTypes.Landmark {
    LandmarkLib.getLandmarkById(landmarks, id);
  };

  public query func getLandmarkDistance(fromId : CommonTypes.LandmarkId, toId : CommonTypes.LandmarkId) : async ?Float {
    switch (landmarks.get(fromId), landmarks.get(toId)) {
      case (?a, ?b) ?LandmarkLib.distanceKm(a, b);
      case _ null;
    };
  };
};
