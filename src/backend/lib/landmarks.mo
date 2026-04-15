import Map "mo:core/Map";
import Float "mo:core/Float";
import CommonTypes "../types/common";
import LandmarkTypes "../types/landmarks";

module {
  public type Landmark = LandmarkTypes.Landmark;
  public type LandmarkId = CommonTypes.LandmarkId;

  public func getAllLandmarks(
    landmarks : Map.Map<LandmarkId, Landmark>
  ) : [Landmark] {
    landmarks.values().toArray();
  };

  public func getLandmarksByCity(
    landmarks : Map.Map<LandmarkId, Landmark>,
    city : Text,
  ) : [Landmark] {
    let lowerCity = city.toLower();
    landmarks.values().filter(func(l : Landmark) : Bool { l.city.toLower() == lowerCity }).toArray();
  };

  public func getLandmarkById(
    landmarks : Map.Map<LandmarkId, Landmark>,
    id : LandmarkId,
  ) : ?Landmark {
    landmarks.get(id);
  };

  // Haversine formula — returns distance in kilometres
  public func distanceKm(a : Landmark, b : Landmark) : Float {
    let r : Float = 6371.0; // Earth radius in km
    let toRad = func(deg : Float) : Float { deg * Float.pi / 180.0 };
    let dLat = toRad(b.latitude - a.latitude);
    let dLon = toRad(b.longitude - a.longitude);
    let lat1 = toRad(a.latitude);
    let lat2 = toRad(b.latitude);
    let sinDLat = Float.sin(dLat / 2.0);
    let sinDLon = Float.sin(dLon / 2.0);
    let h = sinDLat * sinDLat + Float.cos(lat1) * Float.cos(lat2) * sinDLon * sinDLon;
    2.0 * r * Float.arctan2(Float.sqrt(h), Float.sqrt(1.0 - h));
  };

  // Seeds preset Delhi landmarks. Returns the next available ID after seeding.
  public func seedLandmarks(
    landmarks : Map.Map<LandmarkId, Landmark>,
    nextId : Nat,
  ) : Nat {
    let seeds : [(Text, Text, Float, Float, CommonTypes.LandmarkType)] = [
      ("Rajiv Chowk Metro", "Delhi", 28.6328, 77.2197, #Metro),
      ("Kashmere Gate Metro", "Delhi", 28.6677, 77.2285, #Metro),
      ("Hauz Khas Metro", "Delhi", 28.5431, 77.2065, #Metro),
      ("Dwarka Sector 21 Metro", "Delhi", 28.5535, 77.0588, #Metro),
      ("Chandni Chowk", "Delhi", 28.6507, 77.2295, #Chowk),
      ("Connaught Place", "Delhi", 28.6315, 77.2167, #Landmark),
      ("India Gate", "Delhi", 28.6129, 77.2295, #Landmark),
      ("New Delhi Railway Station", "Delhi", 28.6431, 77.2194, #Station),
      ("Hazrat Nizamuddin Station", "Delhi", 28.5890, 77.2510, #Station),
      ("AIIMS Hospital", "Delhi", 28.5665, 77.2100, #Hospital),
      ("Safdarjung Hospital", "Delhi", 28.5697, 77.2064, #Hospital),
      ("Lajpat Nagar", "Delhi", 28.5700, 77.2435, #Chowk),
      ("Karol Bagh Chowk", "Delhi", 28.6512, 77.1902, #Chowk),
      ("Saket Metro", "Delhi", 28.5243, 77.2070, #Metro),
      ("Rohini East Metro", "Delhi", 28.7226, 77.1456, #Metro),
      ("IGI Airport T3", "Delhi", 28.5562, 77.1000, #Landmark),
      ("Nehru Place", "Delhi", 28.5491, 77.2516, #Landmark),
    ];

    var id = nextId;
    for ((name, city, lat, lon, lType) in seeds.vals()) {
      let landmark : Landmark = {
        id = id;
        name = name;
        city = city;
        latitude = lat;
        longitude = lon;
        landmarkType = lType;
      };
      landmarks.add(id, landmark);
      id += 1;
    };
    id;
  };
};
