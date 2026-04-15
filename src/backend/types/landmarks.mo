import CommonTypes "common";

module {
  public type LandmarkId = CommonTypes.LandmarkId;
  public type LandmarkType = CommonTypes.LandmarkType;

  public type Landmark = {
    id : LandmarkId;
    name : Text;
    city : Text;
    latitude : Float;
    longitude : Float;
    landmarkType : LandmarkType;
  };
};
