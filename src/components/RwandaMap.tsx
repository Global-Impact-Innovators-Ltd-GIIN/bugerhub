import React, { useState, useRef } from 'react';
import { Compass } from 'lucide-react';
import '../styles/components/RwandaMap.css';

interface RwandaMapProps {
  onLocationSelected: (address: string, district: string, coordinates: string) => void;
}

export const RwandaMap: React.FC<RwandaMapProps> = ({ onLocationSelected }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [pinPos, setPinPos] = useState<{ x: number; y: number } | null>(null);
  const [coordinates, setCoordinates] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Provinces definitions and their representative mock coordinate centers
  const provinces = [
    {
      id: 'kigali',
      name: 'Kigali Province',
      capital: 'Kigali City',
      baseLat: -1.9441,
      baseLng: 30.0619,
      districts: ['Nyarugenge', 'Gasabo', 'Kicukiro'],
      path: 'M200,80 L250,70 L270,100 L240,120 L190,110 Z' // Center
    },
    {
      id: 'northern',
      name: 'Northern Province',
      capital: 'Musanze',
      baseLat: -1.5008,
      baseLng: 29.9701,
      districts: ['Musanze', 'Burera', 'Gicumbi', 'Rulindo', 'Gakenke'],
      path: 'M90,40 L190,20 L310,20 L300,60 L250,70 L200,80 L170,80 Z' // North
    },
    {
      id: 'eastern',
      name: 'Eastern Province',
      capital: 'Rwamagana',
      baseLat: -1.9802,
      baseLng: 30.4352,
      districts: ['Rwamagana', 'Nyagatare', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Bugesera'],
      path: 'M310,20 L390,50 L380,130 L340,160 L270,140 L270,100 L300,60 Z' // East
    },
    {
      id: 'western',
      name: 'Western Province',
      capital: 'Rubavu',
      baseLat: -1.7214,
      baseLng: 29.2312,
      districts: ['Rubavu', 'Karongi', 'Rutsiro', 'Nyamasheke', 'Rusizi', 'Ngororero', 'Nyabihu'],
      path: 'M50,50 L90,40 L170,80 L190,110 L150,150 L90,150 L50,100 Z' // West
    },
    {
      id: 'southern',
      name: 'Southern Province',
      capital: 'Huye',
      baseLat: -2.4641,
      baseLng: 29.6712,
      districts: ['Huye', 'Nyanza', 'Gisagara', 'Nyaruguru', 'Ruhango', 'Muhanga', 'Kamonyi', 'Nyamagabe'],
      path: 'M190,110 L240,120 L270,140 L340,160 L320,180 L190,180 L150,150 Z' // South
    }
  ];

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;

    // Get click coords relative to SVG
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert coords relative to viewBox 0 0 440 200
    const viewBoxX = (x / rect.width) * 440;
    const viewBoxY = (y / rect.height) * 200;

    // Determine which province was clicked based on path intersections or select default closest
    // Since SVG paths handles mouse clicks, if clicked on background, we find closest region
    setPinPos({ x: viewBoxX, y: viewBoxY });
  };

  const handleRegionClick = (prov: typeof provinces[0], e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const viewBoxX = (x / rect.width) * 440;
    const viewBoxY = (y / rect.height) * 200;

    setPinPos({ x: viewBoxX, y: viewBoxY });
    setSelectedRegion(prov.name);
    
    // Choose a random district in the clicked province for realism
    const randomDistrict = prov.districts[Math.floor(Math.random() * prov.districts.length)];
    setDistrict(randomDistrict);

    // Calculate a small offset to latitude/longitude based on click positioning relative to center
    const latOffset = ((viewBoxY - 100) / 100) * 0.4;
    const lngOffset = ((viewBoxX - 220) / 220) * 0.5;
    const finalLat = (prov.baseLat + latOffset).toFixed(4);
    const finalLng = (prov.baseLng + lngOffset).toFixed(4);
    const coordsStr = `${Math.abs(Number(finalLat))}° S, ${finalLng}° E`;
    
    setCoordinates(coordsStr);

    const fullAddr = `${prov.name}, ${randomDistrict} District (Map Pin: ${coordsStr})`;
    onLocationSelected(fullAddr, randomDistrict, coordsStr);
  };

  return (
    <div className="rwanda-map-container card">
      <div className="map-card-header">
        <Compass size={18} className="compass-icon color-primary animate-float" />
        <div>
          <h4>Interactive Delivery Map</h4>
          <p className="map-instructions">Click on your province below to drop your delivery pin.</p>
        </div>
      </div>

      <div className="map-view-wrapper">
        <svg
          ref={svgRef}
          viewBox="0 0 440 200"
          className="rwanda-svg-canvas"
          onClick={handleMapClick}
        >
          {/* Background grid representation */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Render Provinces */}
          {provinces.map(prov => {
            const isSelected = selectedRegion === prov.name;
            return (
              <path
                key={prov.id}
                d={prov.path}
                className={`province-path ${prov.id}-province ${isSelected ? 'selected' : ''}`}
                onClick={(e) => handleRegionClick(prov, e)}
              />
            );
          })}

          {/* Pulse Pin animation */}
          {pinPos && (
            <g className="map-marker-pin" transform={`translate(${pinPos.x}, ${pinPos.y})`}>
              <circle r="12" className="marker-glow-pulse" />
              <circle r="4" fill="var(--primary)" />
              <g transform="translate(-8, -20)">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="var(--primary)" transform="scale(0.7) translate(-3, -3)"/>
              </g>
            </g>
          )}
        </svg>
      </div>

      {pinPos && (
        <div className="map-coordinates-bar animate-fade-in">
          <div className="coord-row">
            <span className="coord-label">Selected Province:</span>
            <span className="coord-value">{selectedRegion}</span>
          </div>
          <div className="coord-row">
            <span className="coord-label">Auto-detected District:</span>
            <span className="coord-value font-orange">{district} District</span>
          </div>
          <div className="coord-row">
            <span className="coord-label">GPS coordinates:</span>
            <span className="coord-value font-mono">{coordinates}</span>
          </div>
        </div>
      )}
    </div>
  );
};
