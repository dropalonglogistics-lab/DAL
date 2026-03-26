'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';

// Fix for default marker icons
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

const PH_CENTER: [number, number] = [4.8156, 7.0498];

const defaultIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #C9A227; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
});

export default function InteractiveMap({ onLocationSelect, markerPos }: { onLocationSelect: (loc: string) => void, markerPos?: [number, number] | null }) {
    const [pin, setPin] = useState<[number, number] | null>(markerPos || null);

    useEffect(() => {
        if (markerPos) setPin(markerPos);
    }, [markerPos]);

    const handleMapClick = async (lat: number, lng: number) => {
        setPin([lat, lng]);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
            const data = await res.json();
            if (data && data.display_name) {
                // Return a simplified address, like neighbourhood or road
                const parts = [];
                if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
                if (data.address.road) parts.push(data.address.road);
                if (data.address.suburb) parts.push(data.address.suburb);
                
                if (parts.length > 0) {
                    onLocationSelect(parts[0]);
                } else {
                    onLocationSelect(data.display_name.split(',')[0]);
                }
            }
        } catch (e) {
            console.error(e);
            onLocationSelect(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    return (
        <div className={styles.mapContainer} style={{ minHeight: '350px' }}>
            <MapContainer
                center={PH_CENTER}
                zoom={12}
                zoomControl={false}
                style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />
                <MapClickHandler onLocationSelect={handleMapClick} />
                {pin && <Marker position={pin} icon={defaultIcon} />}
            </MapContainer>
        </div>
    );
}
