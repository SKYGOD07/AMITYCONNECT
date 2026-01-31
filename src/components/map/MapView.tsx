"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{
        id: string;
        position: [number, number];
        title: string;
        description?: string;
    }>;
    onLocationSelect?: (lat: number, lng: number) => void;
}

const MapView = ({
    center = [15.4226, 73.9806], // Default: IIT Goa
    zoom = 13,
    markers = [],
    onLocationSelect
}: MapViewProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="h-[400px] w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-500">Loading Map...</div>;
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            className="h-[400px] w-full rounded-lg z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />

            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={customIcon}
                >
                    <Popup>
                        <h3 className="font-bold">{marker.title}</h3>
                        {marker.description && <p>{marker.description}</p>}
                    </Popup>
                </Marker>
            ))}

            {/* TODO: Add ClickHandler for onLocationSelect */}
        </MapContainer>
    );
};

export default MapView;
