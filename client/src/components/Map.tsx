import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
// Leaflet icon fix for React
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMarker {
    position: [number, number];
    label: string;
}

interface MapProps {
    center?: [number, number]; // [lat, lng]
    zoom?: number;
    markers?: LocationMarker[]; // Array of markers
    route?: { start: [number, number]; end: [number, number] } | null;
}

// Helper component to change map view programmatically
function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

// Routing Component
function Routing({ start, end }: { start: [number, number]; end: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: "#6FA1EC", weight: 4 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            // @ts-ignore - geocoder is optional
            geocoder: L.Control.Geocoder ? L.Control.Geocoder.nominatim() : undefined
        }).addTo(map);

        return () => {
            try {
                map.removeControl(routingControl);
            } catch (e) {
                console.warn("Error removing routing control", e);
            }
        };
    }, [map, start, end]);

    return null;
}

export default function Map({
    center = [48.8566, 2.3522], // Default to Paris
    zoom = 13,
    markers = [],
    route = null,
}: MapProps) {

    return (
        // Added explicit style for height redundancy
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-xl border border-white/20 relative z-0">
            <MapContainer
                key={`${center[0]}-${center[1]}`} // Force re-render on center change
                center={center}
                zoom={zoom}
                className="w-full h-full"
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Google Hybrid">
                        <TileLayer
                            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                            url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satellite Hybrid">
                        <LayerGroup>
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                            <TileLayer
                                attribution='Infos from &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png"
                            />
                            <TileLayer
                                attribution='Labels &copy; Esri'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayerGroup>
                    </LayersControl.BaseLayer>
                </LayersControl>

                {markers.map((marker, idx) => (
                    <Marker key={idx} position={marker.position}>
                        <Popup>{marker.label}</Popup>
                    </Marker>
                ))}

                {/* Fallback for single marker if no array passed (backward compatibility or default) */}
                {markers.length === 0 && !route && (
                    <Marker position={center}>
                        <Popup>Current Location</Popup>
                    </Marker>
                )}

                {route && <Routing start={route.start} end={route.end} />}

                <SetView center={center} zoom={zoom} />
            </MapContainer>
        </div>
    );
}
