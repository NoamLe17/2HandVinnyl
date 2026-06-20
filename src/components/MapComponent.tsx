"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker, Circle, InfoWindow, Libraries } from "@react-google-maps/api";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import styles from "@/app/map/map.module.css";
import { Navigation, RefreshCw } from "lucide-react";

const containerStyle = { width: "100%", height: "100%", minHeight: "400px", borderRadius: "12px" };
const defaultCenter = { lat: 31.7683, lng: 35.2137 }; // Jerusalem center
const libraries: Libraries = ["places"];

// Words that suggest a non-record-store result
const EXCLUDED_KEYWORDS = ["dj", "club", "bar", "pub", "event", "events", "studio", "studio", "night", "lounge", "cafe", "restaurant", "hotel", "hostel", "synagogue", "בית", "קפה"];

function isLikelyRecordStore(name: string): boolean {
  const lower = name.toLowerCase();
  return !EXCLUDED_KEYWORDS.some(kw => lower.includes(kw));
}

type SimpleStore = {
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  place_id?: string;
  lat: number;
  lng: number;
};

export default function MapComponent() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(8);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [selectedStore, setSelectedStore] = useState<SimpleStore | null>(null);

  // Real-time ads listener
  const [ads, setAds] = useState<any[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ads"), (snap) => {
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const [storeMarkers, setStoreMarkers] = useState<SimpleStore[]>([]);
  const [showStores, setShowStores] = useState(false);
  const [searchingStores, setSearchingStores] = useState(false);
  const [mapMoved, setMapMoved] = useState(false); // show "search this area" button

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude };
          setUserLocation(loc);
          setCenter(loc);
          setZoom(13);
        },
        () => console.warn("Geolocation denied"),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const searchStoresInViewport = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    setSearchingStores(true);
    setMapMoved(false);

    const service = new google.maps.places.PlacesService(mapRef.current);

    // Two targeted searches
    const keywords = ["record store vinyl", "חנות תקליטים ויניל"];
    const allResults: SimpleStore[] = [];
    let completed = 0;

    keywords.forEach(keyword => {
      service.textSearch(
        { query: keyword, bounds },
        (results, status) => {
          completed++;
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(r => {
              if (!r.geometry?.location || !r.name) return;
              if (!isLikelyRecordStore(r.name)) return;

              allResults.push({
                name: r.name,
                vicinity: r.formatted_address || r.vicinity || "",
                rating: r.rating,
                user_ratings_total: r.user_ratings_total,
                place_id: r.place_id,
                lat: r.geometry.location.lat(),
                lng: r.geometry.location.lng(),
              });
            });
          }

          if (completed === keywords.length) {
            // Deduplicate by place_id
            const seen = new Set<string>();
            const unique = allResults.filter(s => {
              if (!s.place_id || seen.has(s.place_id)) return false;
              seen.add(s.place_id);
              return true;
            });
            setStoreMarkers(unique);
            setSearchingStores(false);
          }
        }
      );
    });
  }, []);

  const handleToggleStores = (checked: boolean) => {
    setShowStores(checked);
    if (checked) {
      searchStoresInViewport();
    } else {
      setStoreMarkers([]);
      setSelectedStore(null);
      setMapMoved(false);
    }
  };

  const handleAdClick = async (ad: any) => {
    setSelectedAd(ad);
    setSelectedStore(null);
    try {
      await addDoc(collection(db, "ads", ad.id, "events"), {
        type: "map_view",
        timestamp: serverTimestamp(),
      });
    } catch { /* silent */ }
  };

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: false,
  }), []);

  if (!isLoaded) {
    return <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>טוען מפה...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={map => { mapRef.current = map; }}
        onDragEnd={() => { if (showStores) setMapMoved(true); }}
        onZoomChanged={() => { if (showStores) setMapMoved(true); }}
        onClick={() => { setSelectedAd(null); setSelectedStore(null); }}
      >
        {/* User location */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              title="המיקום שלי"
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              }}
            />
            <Circle
              center={userLocation}
              radius={2000}
              options={{ fillColor: "#4285F4", fillOpacity: 0.08, strokeColor: "#4285F4", strokeOpacity: 0.3, strokeWeight: 1 }}
            />
          </>
        )}

        {/* Ad markers – real-time */}
        {ads.map(ad => {
          if (!ad.lat || !ad.lng) return null;
          return (
            <Marker
              key={ad.id}
              position={{ lat: ad.lat, lng: ad.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#7b2cbf",
                fillOpacity: 0.9,
                strokeColor: "white",
                strokeWeight: 2,
              }}
              onClick={() => handleAdClick(ad)}
            />
          );
        })}

        {/* Store markers */}
        {storeMarkers.map((store, i) => (
          <Marker
            key={store.place_id || i}
            position={{ lat: store.lat, lng: store.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#3A86FF",
              fillOpacity: 0.9,
              strokeColor: "white",
              strokeWeight: 2,
            }}
            onClick={() => { setSelectedStore(store); setSelectedAd(null); }}
          />
        ))}

        {/* InfoWindow for ad */}
        {selectedAd && (
          <InfoWindow
            position={{ lat: selectedAd.lat, lng: selectedAd.lng }}
            onCloseClick={() => setSelectedAd(null)}
            options={{ pixelOffset: new google.maps.Size(0, -14) }}
          >
            <div style={{ direction: "rtl", padding: "4px", minWidth: "220px", fontFamily: "inherit" }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ background: "#7b2cbf", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "0.8rem" }}>{selectedAd.type}</span>
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700 }}>{selectedAd.title}</h3>
              <p style={{ margin: "0 0 4px", color: "#7b2cbf", fontWeight: 700 }}>₪{selectedAd.price}</p>
              <p style={{ margin: "0 0 12px", color: "#666", fontSize: "0.85rem" }}>{selectedAd.locationName}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <a href={`/store/${selectedAd.id}`} style={{ display: "block", textAlign: "center", background: "#7b2cbf", color: "white", padding: "8px 12px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
                  מעוניין לשמוע עוד
                </a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedAd.lat},${selectedAd.lng}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#f5f5f5", color: "#333", padding: "8px 12px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
                  🧭 נווט ב-Google Maps
                </a>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* InfoWindow for store */}
        {selectedStore && (
          <InfoWindow
            position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
            onCloseClick={() => setSelectedStore(null)}
            options={{ pixelOffset: new google.maps.Size(0, -14) }}
          >
            <div style={{ direction: "rtl", padding: "4px", minWidth: "220px", fontFamily: "inherit" }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ background: "#3A86FF", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "0.8rem" }}>חנות מקצועית 🏪</span>
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700 }}>{selectedStore.name}</h3>
              {selectedStore.rating && (
                <p style={{ margin: "0 0 4px", color: "#f5a623", fontWeight: 600 }}>⭐ {selectedStore.rating} ({selectedStore.user_ratings_total} ביקורות)</p>
              )}
              <p style={{ margin: "0 0 12px", color: "#666", fontSize: "0.85rem" }}>{selectedStore.vicinity}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStore.name)}&query_place_id=${selectedStore.place_id}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#3A86FF", color: "white", padding: "8px 12px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
                🧭 נווט לחנות ב-Google Maps
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Floating controls */}
      <div className={`glass-panel ${styles.mapControls}`}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={showStores} onChange={e => handleToggleStores(e.target.checked)} />
          {searchingStores ? "מחפש חנויות..." : `הצג חנויות תקליטים 🏪${storeMarkers.length > 0 ? ` (${storeMarkers.length})` : ""}`}
        </label>
      </div>

      {/* "Search this area" button */}
      {showStores && mapMoved && (
        <button
          onClick={searchStoresInViewport}
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            color: "var(--text-main)",
          }}
        >
          <RefreshCw size={16} /> חפש חנויות באזור זה
        </button>
      )}
    </div>
  );
}
