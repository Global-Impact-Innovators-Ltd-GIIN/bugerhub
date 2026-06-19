import React, { useState, useEffect, useRef } from 'react';
import { Compass, Search, MapPin } from 'lucide-react';
import '../styles/components/RwandaMap.css';

declare global {
  interface Window {
    google: any;
  }
}

interface RwandaMapProps {
  onLocationSelected: (address: string, district: string, coordinates: string) => void;
}

export const RwandaMap: React.FC<RwandaMapProps> = ({ onLocationSelected }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCoords, setSelectedCoords] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);

  const googleMapInstance = useRef<any>(null);
  const googleMarkerInstance = useRef<any>(null);

  // Dynamic Google Maps script loader
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => setMapLoaded(true));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      // Load script without a key if VITE_GOOGLE_MAPS_API_KEY is not defined
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', () => setMapLoaded(true));
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Dark style for Google Maps to fit BurgerHub glassmorphism aesthetic
    const darkMapStyles = [
      { elementType: "geometry", stylers: [{ color: "#1e1e24" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1e1e24" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8a8a93" }] },
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ color: "#2d2d34" }],
      },
      {
        featureType: "landscape.natural",
        elementType: "geometry",
        stylers: [{ color: "#17171c" }],
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#222228" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#a5a5af" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#2a2a33" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#ff4500", lightness: -20 }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#121216" }],
      },
    ];

    const defaultLatLng = { lat: -1.9441, lng: 30.0619 }; // Kigali, Rwanda center

    const mapOptions = {
      center: defaultLatLng,
      zoom: 13,
      styles: darkMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    googleMapInstance.current = map;

    // Create marker
    const marker = new window.google.maps.Marker({
      position: defaultLatLng,
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: "Drag me to your delivery spot",
    });
    googleMarkerInstance.current = marker;

    // Update coordinates & geocode on drag
    const updateLocationDetails = (lat: number, lng: number) => {
      const coordsStr = `${lat.toFixed(5)}° S, ${lng.toFixed(5)}° E`;
      setSelectedCoords(coordsStr);

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        let fullAddress = `Kigali Province (Pin: ${coordsStr})`;
        let district = "Nyarugenge";

        if (status === "OK" && results && results[0]) {
          fullAddress = results[0].formatted_address;
          
          // Parse district (usually administrative_area_level_2 in Rwanda)
          for (const component of results[0].address_components) {
            if (
              component.types.includes("administrative_area_level_2") ||
              component.types.includes("sublocality") ||
              component.types.includes("locality")
            ) {
              district = component.long_name.replace(" District", "");
              break;
            }
          }
        }

        setSelectedAddress(fullAddress);
        setSelectedDistrict(district);
        onLocationSelected(fullAddress, district, coordsStr);
      });
    };

    // Prompt user for location permission
    if (navigator.geolocation) {
      setLoadingLoc(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoadingLoc(false);
          const userLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLatLng);
          marker.setPosition(userLatLng);
          updateLocationDetails(userLatLng.lat, userLatLng.lng);
        },
        (error) => {
          setLoadingLoc(false);
          console.warn("Geolocation prompt rejected or failed. Centering Kigali.", error);
          // Geocode default position
          updateLocationDetails(defaultLatLng.lat, defaultLatLng.lng);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      updateLocationDetails(defaultLatLng.lat, defaultLatLng.lng);
    }

    // Map click listeners
    map.addListener("click", (e: any) => {
      if (e.latLng) {
        marker.setPosition(e.latLng);
        updateLocationDetails(e.latLng.lat(), e.latLng.lng());
      }
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) {
        updateLocationDetails(pos.lat(), pos.lng());
      }
    });
  }, [mapLoaded]);

  // Search Address handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !window.google) return;

    setErrorMsg('');
    const geocoder = new window.google.maps.Geocoder();
    // Restrict search results to Rwanda context
    geocoder.geocode({ address: searchQuery + ", Rwanda" }, (results: any, status: string) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();

        if (googleMapInstance.current) {
          googleMapInstance.current.setCenter(loc);
          googleMapInstance.current.setZoom(15);
        }
        if (googleMarkerInstance.current) {
          googleMarkerInstance.current.setPosition(loc);
        }

        const coordsStr = `${lat.toFixed(5)}° S, ${lng.toFixed(5)}° E`;
        setSelectedCoords(coordsStr);
        setSelectedAddress(results[0].formatted_address);

        let district = "Nyarugenge";
        for (const component of results[0].address_components) {
          if (
            component.types.includes("administrative_area_level_2") ||
            component.types.includes("sublocality") ||
            component.types.includes("locality")
          ) {
            district = component.long_name.replace(" District", "");
            break;
          }
        }
        setSelectedDistrict(district);
        onLocationSelected(results[0].formatted_address, district, coordsStr);
      } else {
        setErrorMsg('Location not found. Try adding a specific district or landmark (e.g. "Kiyovu, Kigali").');
      }
    });
  };

  return (
    <div className="rwanda-map-container card">
      <div className="map-card-header">
        <Compass size={18} className="compass-icon color-primary animate-float" />
        <div>
          <h4>Interactive Delivery Map</h4>
          <p className="map-instructions">Pin your delivery spot on the live Google Map below or search.</p>
        </div>
      </div>

      {/* Modern Search bar inside map card */}
      <form onSubmit={handleSearch} className="map-search-box">
        <div className="card-input-wrapper" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingRight: '40px' }}
            placeholder="Search address, landmark, or town in Rwanda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="input-icon" style={{ right: '12px', left: 'auto', pointerEvents: 'none' }}>
            <MapPin size={16} />
          </span>
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={16} /> Search
        </button>
      </form>

      {errorMsg && <p className="text-danger" style={{ fontSize: '12px', marginTop: '-6px', marginBottom: '10px' }}>⚠️ {errorMsg}</p>}
      {loadingLoc && <p className="text-muted" style={{ fontSize: '12px', marginTop: '-6px', marginBottom: '10px' }}>⏳ Accessing browser GPS location coordinates...</p>}

      <div className="map-view-wrapper" style={{ padding: 0, height: '350px' }}>
        <div
          ref={mapRef}
          style={{ width: '100%', height: '100%', minHeight: '350px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
        >
          {!mapLoaded && (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading interactive map...
            </div>
          )}
        </div>
      </div>

      {selectedCoords && (
        <div className="map-coordinates-bar animate-fade-in">
          <div className="coord-row">
            <span className="coord-label">Geocoded Address:</span>
            <span className="coord-value">{selectedAddress}</span>
          </div>
          <div className="coord-row">
            <span className="coord-label">City/District:</span>
            <span className="coord-value font-orange">{selectedDistrict} District</span>
          </div>
          <div className="coord-row">
            <span className="coord-label">GPS Coordinates:</span>
            <span className="coord-value font-mono">{selectedCoords}</span>
          </div>
        </div>
      )}
    </div>
  );
};
