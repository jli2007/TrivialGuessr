// components/GoogleMap.tsx

"use client"

import React, { useEffect, useRef } from 'react';
import { MapPin, Target } from 'lucide-react';
import { GoogleMapProps, Location } from '../types';
import { haversineDistance, formatDistance } from '../utils/gameUtils';

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  onLocationSelect, 
  selectedLocation, 
  correctLocation, 
  showAnswer, 
  isFullscreen = false 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || googleMapRef.current || !window.google) return;

    // Initialize Google Map
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      restriction: {
        latLngBounds: {
          north: 85,
          south: -85,
          west: -180,
          east: 180
        },
        strictBounds: false
      },
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);

    // Handle map clicks
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (showAnswer || !e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationSelect({ lat, lng });
    });

    googleMapRef.current = map;
  }, [mapRef.current, window.google, onLocationSelect, showAnswer]);

  // Update markers when locations change
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !window.google) return;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Add user guess marker
    if (selectedLocation) {
      const userMarkerOptions: google.maps.MarkerOptions = {
        position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        map: map,
        title: 'Your Guess',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      };

      const userMarker = new google.maps.Marker(userMarkerOptions);

      const userInfoWindow = new google.maps.InfoWindow({
        content: '<div style="color: black; font-weight: bold;">Your Guess</div>'
      });
      
      userMarker.addListener('click', () => {
        userInfoWindow.open(map, userMarker);
      });

      markersRef.current.push(userMarker);
    }

    // Add correct location marker and polyline
    if (showAnswer && correctLocation) {
      const correctMarkerOptions: google.maps.MarkerOptions = {
        position: { lat: correctLocation.lat, lng: correctLocation.lng },
        map: map,
        title: 'Correct Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      };

      const correctMarker = new google.maps.Marker(correctMarkerOptions);

      const correctInfoWindow = new google.maps.InfoWindow({
        content: '<div style="color: black; font-weight: bold;">Correct Location</div>'
      });
      
      correctMarker.addListener('click', () => {
        correctInfoWindow.open(map, correctMarker);
      });

      markersRef.current.push(correctMarker);

      // Draw polyline between guess and correct answer
      if (selectedLocation) {
        const polylineOptions: google.maps.PolylineOptions = {
          path: [
            { lat: selectedLocation.lat, lng: selectedLocation.lng },
            { lat: correctLocation.lat, lng: correctLocation.lng }
          ],
          geodesic: true,
          strokeColor: '#ffffff',
          strokeOpacity: 0.8,
          strokeWeight: 3
        };

        const polyline = new google.maps.Polyline(polylineOptions);
        polyline.setMap(map);
        polylineRef.current = polyline;

        // Fit bounds to show both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: selectedLocation.lat, lng: selectedLocation.lng });
        bounds.extend({ lat: correctLocation.lat, lng: correctLocation.lng });
        map.fitBounds(bounds);
        
        // Add some padding
        setTimeout(() => {
          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom > 10) {
            map.setZoom(Math.min(currentZoom, 10));
          }
        }, 100);
      }
    }
  }, [selectedLocation, correctLocation, showAnswer]);

  return (
    <div className={`relative bg-blue-900 rounded-lg overflow-hidden border-2 border-white/20 ${isFullscreen ? 'h-full' : 'h-96'}`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {!showAnswer && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 backdrop-blur-sm">
          <MapPin className="w-4 h-4" />
          Click anywhere to place your guess
        </div>
      )}
      
      {selectedLocation && !showAnswer && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <Target className="w-4 h-4" />
          Guess placed!
        </div>
      )}

      {showAnswer && selectedLocation && correctLocation && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
          Distance: {formatDistance(haversineDistance(
            selectedLocation.lat, selectedLocation.lng,
            correctLocation.lat, correctLocation.lng
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleMap;