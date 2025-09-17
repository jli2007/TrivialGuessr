"use client"

import React, { useEffect, useRef } from 'react';
import { Target } from 'lucide-react';
import { GoogleMapProps } from '../types';
import { haversineDistance} from '../utils/gameUtils';

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
      zoom: 3,
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
      disableDefaultUI: true,
      gestureHandling: 'cooperative',
      mapTypeControl: showAnswer,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
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

  // toggles MapTypeControl
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map) return;

    map.setOptions({
      mapTypeControl: showAnswer
    });
  }, [showAnswer]);

  // Update markers when locations change
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !window.google || (showAnswer && markersRef.current.length == 2)) return;

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
          scale: 12,
          fillColor: '#ef4444',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      };

      const userMarker = new google.maps.Marker(userMarkerOptions);

      const userInfoWindow = new google.maps.InfoWindow({
        content: '<div style="color: black; font-weight: bold; padding: 4px;">🔴 Your Guess</div>'
      });
      
      userMarker.addListener('click', () => {
        userInfoWindow.open(map, userMarker);
      });

      markersRef.current.push(userMarker);
    }

    // Add correct location marker and polyline when showing answer
    if (showAnswer && correctLocation) {
      const correctMarkerOptions: google.maps.MarkerOptions = {
        position: { lat: correctLocation.lat, lng: correctLocation.lng },
        map: map,
        title: 'Correct Location',
        icon: {
          url: '/marker.svg',
          scale: 12,
          fillColor: '#22c55e',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      };

      const correctMarker = new google.maps.Marker(correctMarkerOptions);

      const correctInfoWindow = new google.maps.InfoWindow({
        content: '<div style="color: black; font-weight: bold; padding: 4px;">🎯 Correct Location</div>'
      });
      
      correctMarker.addListener('click', () => {
        correctInfoWindow.open(map, correctMarker);
      });

      markersRef.current.push(correctMarker);

      // Draw polyline between guess and correct answer if user made a guess
      if (selectedLocation) {
        const distance = haversineDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          correctLocation.lat,
          correctLocation.lng
        );

        // Color polyline based on accuracy
        let strokeColor = '#ef4444'; // Red by default
        if (distance <= 100) strokeColor = '#22c55e'; // Green
        else if (distance <= 500) strokeColor = '#eab308'; // Yellow
        else if (distance <= 1000) strokeColor = '#f97316'; // Orange

        const polylineOptions: google.maps.PolylineOptions = {
          path: [
            { lat: selectedLocation.lat, lng: selectedLocation.lng },
            { lat: correctLocation.lat, lng: correctLocation.lng }
          ],
          geodesic: true,
          strokeColor: strokeColor,
          strokeOpacity: 0.8,
          strokeWeight: 4
        };

        const polyline = new google.maps.Polyline(polylineOptions);
        polyline.setMap(map);
        polylineRef.current = polyline;

        // Fit bounds to show both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: selectedLocation.lat, lng: selectedLocation.lng });
        bounds.extend({ lat: correctLocation.lat, lng: correctLocation.lng });
        map.fitBounds(bounds);
        
        // Add some padding and limit max zoom
        setTimeout(() => {
          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom > 12) {
            map.setZoom(Math.min(currentZoom, 12));
          }
        }, 100);
      } else {
        // If no guess was made, center on correct location
        map.setCenter({ lat: correctLocation.lat, lng: correctLocation.lng });
        map.setZoom(8);
      }
    }
  }, [selectedLocation, correctLocation, showAnswer]);

  return (
    <div className={`relative bg-blue-900 overflow-hidden ${isFullscreen ? 'h-full' : 'h-96'}`}>
      <div ref={mapRef} className="w-full h-full" />
      {showAnswer && !selectedLocation && correctLocation && (
        <div className="absolute bottom-4 left-4 bg-black/85 text-white px-4 py-3 rounded-lg text-sm backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            <span className="font-medium text-red-400">No guess made</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoogleMap;