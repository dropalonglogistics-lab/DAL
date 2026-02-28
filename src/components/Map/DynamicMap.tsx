'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export default function DynamicMap({
    locations
}: {
    locations: { title: string; desc: string; city: string }[] // e.g. [{title: 'Rumuokoro', desc: 'Start', city: 'Port Harcourt'}, ...]
}) {
    const [coordinates, setCoordinates] = useState<Array<{ lat: number; lng: number; title: string; desc: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We need to loosely Geocode the text locations into lat/long.
        // We will use OpenStreetMap Nominatim for this (free, no API key).
        // To be safe against rate limits, we add a brief delay between requests.

        let isMounted = true;

        const fetchCoordinates = async () => {
            setLoading(true);
            const coords = [];

            for (const loc of locations) {
                try {
                    // Quick debounce for OSM rate limit via loop
                    await new Promise(r => setTimeout(r, 600));

                    const query = encodeURIComponent(`${loc.title}, ${loc.city}, Nigeria`);
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
                    const data = await res.json();

                    if (data && data.length > 0) {
                        coords.push({
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon),
                            title: loc.title,
                            desc: loc.desc
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

    // Fallback coordinates for Port Harcourt if geocoding fails totally
    const PH_CENTER: [number, number] = [4.8156, 7.0498];

    // Extract array of [lat, lng] for the Polyline
    const pathPositions: [number, number][] = coordinates.map(c => [c.lat, c.lng]);

    return (
        <div className={styles.mapContainer}>
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <span>Mapping Route Data...</span>
                </div>
            )}

            <MapContainer
                center={coordinates.length > 0 ? pathPositions[0] : PH_CENTER}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {coordinates.map((coord, idx) => (
                    <Marker key={idx} position={[coord.lat, coord.lng]}>
                        <Popup className={styles.customPopup}>
                            <strong>{coord.title}</strong>
                            <span>{coord.desc}</span>
                        </Popup>
                    </Marker>
                ))}

                {pathPositions.length > 1 && (
                    <Polyline
                        positions={pathPositions}
                        color="var(--color-primary)"
                        weight={4}
                        opacity={0.7}
                        dashArray="10, 10"
                    />
                )}

                <SetBounds pts={pathPositions} />
            </MapContainer>
        </div>
    );
}
