import React, { useState, useEffect, useRef } from 'react';
import { Compass, Search, MapPin } from 'lucide-react';
import '../styles/components/RwandaMap.css';

export interface AddressComponents {
  province: string;
  city: string;
  country: string;
  cell: string;
  village: string;
  community: string;
  street: string;
  houseNumber: string;
}

interface RwandaMapProps {
  onLocationSelected: (address: string, district: string, coordinates: string, details?: AddressComponents) => void;
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

  // Parsed structured address components
  const [addressDetails, setAddressDetails] = useState<AddressComponents | null>(null);

  const leafletMapInstance = useRef<any>(null);
  const leafletMarkerInstance = useRef<any>(null);

  // Dynamic Leaflet script and CSS loader
  useEffect(() => {
    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const scriptId = 'leaflet-cdn-js';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.addEventListener('load', () => setMapLoaded(true));
      document.body.appendChild(script);
    }
  }, []);

  // Sync / reverse geocode given coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    const coordsStr = `${lat.toFixed(5)}° S, ${lng.toFixed(5)}° E`;
    setSelectedCoords(coordsStr);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (!response.ok) throw new Error('Geocoding response failed');
      const data = await response.json();

      const addrObj = data.address || {};
      
      // Parse details with direct mapping and robust fallbacks
      const parsedDetails: AddressComponents = {
        province: addrObj.state || addrObj.region || addrObj.province || 'Kigali Province',
        city: addrObj.city || addrObj.town || addrObj.municipality || addrObj.county || 'Kigali',
        country: addrObj.country || 'Rwanda',
        cell: addrObj.suburb || addrObj.neighbourhood || addrObj.village || addrObj.hamlet || '',
        village: addrObj.village || addrObj.hamlet || addrObj.suburb || '',
        community: addrObj.quarter || addrObj.residential || addrObj.subdivision || '',
        street: addrObj.road || addrObj.street || '',
        houseNumber: addrObj.house_number || addrObj.house_name || ''
      };

      setAddressDetails(parsedDetails);

      // Determine district / city from response components
      // In Rwanda, Nyarugenge, Kicukiro, Gasabo, etc. are under county / city / suburb
      let district = addrObj.county || addrObj.city_district || addrObj.town || addrObj.city || 'Nyarugenge';
      district = district.replace(' District', '').replace('City of ', '');

      const fullAddressStr = data.display_name || `${district}, Kigali, Rwanda`;
      setSelectedAddress(fullAddressStr);
      setSelectedDistrict(district);

      // Bubble up parsed address coordinates and details
      onLocationSelected(fullAddressStr, district, coordsStr, parsedDetails);
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      // Fallback details in case of fetch failure
      const fallbackDetails: AddressComponents = {
        province: 'Kigali Province',
        city: 'Kigali',
        country: 'Rwanda',
        cell: '',
        village: '',
        community: '',
        street: '',
        houseNumber: ''
      };
      setAddressDetails(fallbackDetails);
      const fallbackAddr = `Kigali Province (Pin: ${coordsStr})`;
      setSelectedAddress(fallbackAddr);
      setSelectedDistrict('Nyarugenge');
      onLocationSelected(fallbackAddr, 'Nyarugenge', coordsStr, fallbackDetails);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Center of Kigali
    const defaultCenter: [number, number] = [-1.9441, 30.0619];

    // Initialize map object
    const L = (window as any).L;
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(defaultCenter, 13);
    leafletMapInstance.current = map;

    // Use CartoDB Dark Matter tile layer for an elegant aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Explicit icon specifications to prevent Leaflet asset path resolution failures
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Create marker
    const marker = L.marker(defaultCenter, {
      draggable: true,
      icon: customIcon
    }).addTo(map);
    leafletMarkerInstance.current = marker;

    // Geolocation permission trigger
    if (navigator.geolocation) {
      setLoadingLoc(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoadingLoc(false);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
          reverseGeocode(lat, lng);
        },
        (error) => {
          setLoadingLoc(false);
          console.warn('GPS prompt declined or failed. Centering Kigali center.', error);
          reverseGeocode(defaultCenter[0], defaultCenter[1]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      reverseGeocode(defaultCenter[0], defaultCenter[1]);
    }

    // Map Click Listener
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });

    // Marker Dragend Listener
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      reverseGeocode(position.lat, position.lng);
    });

    // Cleanup map instance on unmount
    return () => {
      map.remove();
    };
  }, [mapLoaded]);

  // Search address lookup handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setErrorMsg('');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', Rwanda')}&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();

      if (results && results.length > 0) {
        const firstResult = results[0];
        const lat = parseFloat(firstResult.lat);
        const lng = parseFloat(firstResult.lon);

        if (leafletMapInstance.current) {
          leafletMapInstance.current.setView([lat, lng], 15);
        }
        if (leafletMarkerInstance.current) {
          leafletMarkerInstance.current.setLatLng([lat, lng]);
        }

        // Perform reverse geocoding from matching search coordinates to synchronize detail structures
        await reverseGeocode(lat, lng);
      } else {
        setErrorMsg('Location not found. Please clarify (e.g. "Kiyovu, Kigali").');
      }
    } catch (err) {
      console.error('Error matching search query:', err);
      setErrorMsg('Geocoding service unavailable. Please drag the pin manually.');
    }
  };

  return (
    <div className="rwanda-map-container card" style={{ padding: '20px' }}>
      <div className="map-card-header">
        <Compass size={22} className="compass-icon color-primary animate-float" />
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Interactive Delivery Map (Leaflet)</h4>
          <p className="map-instructions" style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Pin your precise delivery coordinates on the map or search below.
          </p>
        </div>
      </div>

      {/* Address Search Form */}
      <form onSubmit={handleSearch} className="map-search-box" style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
        <div className="card-input-wrapper" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingRight: '40px', width: '100%' }}
            placeholder="Search address, landmark, or village in Kigali/Rwanda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="input-icon" style={{ right: '12px', left: 'auto', pointerEvents: 'none' }}>
            <MapPin size={16} />
          </span>
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <Search size={16} /> Search
        </button>
      </form>

      {errorMsg && <p className="text-danger animate-fade-in" style={{ fontSize: '12px', marginTop: '-6px', marginBottom: '10px', color: 'var(--accent-red)' }}>⚠️ {errorMsg}</p>}
      {loadingLoc && <p className="text-muted animate-fade-in" style={{ fontSize: '12px', marginTop: '-6px', marginBottom: '10px', color: 'var(--primary)' }}>⏳ Accessing browser GPS location coordinates...</p>}

      {/* Map View Wrapper */}
      <div className="map-view-wrapper" style={{ padding: 0, height: '350px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div
          ref={mapRef}
          style={{ width: '100%', height: '100%', minHeight: '350px', zIndex: 1 }}
        >
          {!mapLoaded && (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading interactive map...
            </div>
          )}
        </div>
      </div>

      {/* Structured Geocoded Details Grid */}
      {selectedCoords && (
        <div className="map-coordinates-bar animate-fade-in" style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coordinates:</span>
              <span className="font-mono" style={{ fontWeight: 600 }}>{selectedCoords}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Formatted:</span>
              <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedAddress}>
                {selectedAddress}
              </span>
            </div>
          </div>

          {/* Premium details components grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Province</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.province || '-'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>City / District</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.city || selectedDistrict || '-'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Cell</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.cell || '-'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Village</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.village || '-'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Community</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.community || '-'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Street</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.street || '-'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>House Number</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.houseNumber || '-'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Country</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{addressDetails?.country || '-'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
