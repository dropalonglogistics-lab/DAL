'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, Maximize, Navigation, MapPin } from 'lucide-react';
import styles from './Map.module.css';

// Fix for default marker icons in React-Leaflet
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Component to dynamically fit map bounds to all points
function SetBounds({ pts }: { pts: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (pts.length > 0) {
            const bounds = L.latLngBounds(pts);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [pts, map]);
    return null;
}

// Custom Controls Component
function MapControls({ onLocate, onRecenter }: { onLocate: () => void; onRecenter: () => void }) {
    return (
        <div className={styles.customControls}>
            <button onClick={onLocate} className={styles.controlBtn} title="Locate Me">
                <Target size={20} />
            </button>
            <button onClick={onRecenter} className={styles.controlBtn} title="Recenter Route">
                <Maximize size={20} />
            </button>
        </div>
    );
}

// Component to fly to a specific point when activeStepIndex changes
function FlyToStep({ center, active }: { center: [number, number] | null; active: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (active && center) {
            map.flyTo(center, 15, { duration: 1.5 });
        }
    }, [active, center, map]);
    return null;
}

const getMarkerIcon = (type: string, isActive: boolean) => {
    const color = type === 'start' ? '#22c55e' : type === 'end' ? '#ef4444' : type === 'switch' ? '#3b82f6' : '#94a3b8';
    const size = isActive ? 36 : 24;

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        ">
            <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                transform: rotate(45deg);
            "></div>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size]
    });
};

export default function DynamicMap({
    locations,
    activeStepIndex,
    traffic
}: {
    locations: { title: string; desc: string; city: string; type?: string }[];
    activeStepIndex?: number | null;
    traffic?: 'clear' | 'moderate' | 'heavy';
}) {
    const [coordinates, setCoordinates] = useState<Array<{ lat: number; lng: number; title: string; desc: string; type?: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchCoordinates = async () => {
            setLoading(true);
            const coords = [];
            for (const loc of locations) {
                try {
                    await new Promise(r => setTimeout(r, 600));
                    const query = encodeURIComponent(`${loc.title}, ${loc.city}, Nigeria`);
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        coords.push({
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon),
                            title: loc.title,
                            desc: loc.desc,
                            type: loc.type
                        });
                    }
                } catch (e) {
                    console.error("Geocoding failed for: ", loc.title);
                }
            }
            if (isMounted) {
                setCoordinates(coords);
                setLoading(false);
            }
        };
        fetchCoordinates();
        return () => { isMounted = false; };
    }, [locations]);

    const PH_CENTER: [number, number] = [4.8156, 7.0498];
    const pathPositions: [number, number][] = coordinates.map(c => [c.lat, c.lng]);

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                // In a real app with a shared map ref, we'd fly here.
            });
        }
    };

    const handleRecenter = () => {
        setMapKey(prev => prev + 1);
    };

    const polylineColor = traffic === 'heavy' ? '#ef4444' : traffic === 'moderate' ? '#f59e0b' : '#d4af37';

    return (
        <div className={styles.mapContainer}>
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <span>Mapping Route Data...</span>
                </div>
            )}

            <MapControls onLocate={handleLocateMe} onRecenter={handleRecenter} />

            <MapContainer
                key={mapKey}
                center={coordinates.length > 0 ? pathPositions[0] : PH_CENTER}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />

                {coordinates.map((coord, idx) => (
                    <Marker
                        key={idx}
                        position={[coord.lat, coord.lng]}
                        icon={getMarkerIcon(coord.type || '', activeStepIndex === idx)}
                    >
                        <Popup className={styles.customPopup} autoPan={false}>
                            <div className={styles.popupContent}>
                                <strong>{coord.title}</strong>
                                <span>{coord.desc}</span>
                            </div>
                        </Popup>
                        <FlyToStep active={activeStepIndex === idx} center={[coord.lat, coord.lng]} />
                    </Marker>
                ))}

                {pathPositions.length > 1 && (
                    <Polyline
                        positions={pathPositions}
                        color={polylineColor}
                        weight={6}
                        opacity={0.9}
                        lineJoin="round"
                    />
                )}

                <SetBounds pts={pathPositions} />
            </MapContainer>
        </div>
    );
}
