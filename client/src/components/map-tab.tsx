import { useQuery } from "@tanstack/react-query";
import { hazardReportApi } from "@/lib/api";
import { useGeolocation } from "@/hooks/use-geolocation";
import { MapPin, Navigation, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface HazardMapPoint {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  createdAt?: Date;
}

export function MapTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/hazard-reports'],
    queryFn: hazardReportApi.getAll,
  });
  
  const { latitude: userLat, longitude: userLng, error: locationError } = useGeolocation();
  const [mapCenter, setMapCenter] = useState({ lat: 13.0827, lng: 80.2707 }); // Default to Chennai
  const [zoom, setZoom] = useState(10);

  // Update map center when user location is available
  useEffect(() => {
    if (userLat && userLng) {
      setMapCenter({ lat: userLat, lng: userLng });
    }
  }, [userLat, userLng]);

  const reports = data?.reports || [];
  
  // Process reports into map points
  const mapPoints: HazardMapPoint[] = reports.map((report: any) => ({
    id: report.id,
    latitude: report.latitude,
    longitude: report.longitude,
    description: report.description,
    severity: getSeverityFromDescription(report.description),
    createdAt: report.createdAt,
  }));

  function getSeverityFromDescription(description: string): 'low' | 'medium' | 'high' {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('dangerous') || lowerDesc.includes('emergency') || lowerDesc.includes('severe')) {
      return 'high';
    }
    if (lowerDesc.includes('warning') || lowerDesc.includes('caution') || lowerDesc.includes('moderate')) {
      return 'medium';
    }
    return 'low';
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
    }
  };

  const getSeveritySize = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'w-4 h-4';
      case 'medium': return 'w-3 h-3';
      case 'low': return 'w-2 h-2';
    }
  };

  const centerOnUser = () => {
    if (userLat && userLng) {
      setMapCenter({ lat: userLat, lng: userLng });
      setZoom(15);
    }
  };

  // Calculate bounds for all reports
  const bounds = mapPoints.length > 0 ? {
    north: Math.max(...mapPoints.map(p => p.latitude)),
    south: Math.min(...mapPoints.map(p => p.latitude)),
    east: Math.max(...mapPoints.map(p => p.longitude)),
    west: Math.min(...mapPoints.map(p => p.longitude)),
  } : null;

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Hazard Map</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={centerOnUser}
          disabled={!userLat || !userLng}
          data-testid="button-center-user"
        >
          <Navigation className="mr-1 h-4 w-4" />
          My Location
        </Button>
      </div>

      {locationError && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-orange-800 text-sm">{locationError}</span>
          </div>
        </div>
      )}

      {/* Enhanced Map Visualization */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="relative h-96 bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100">
          {/* Coastline and water effect */}
          <div className="absolute inset-0 opacity-30">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px, 80px 80px, 15px 15px, 15px 15px'
              }}
            />
          </div>
          
          {/* Zoom controls */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 2, 20))}
              className="px-3 py-2 text-sm font-medium hover:bg-gray-100 border-b border-gray-200"
            >
              +
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 2, 5))}
              className="px-3 py-2 text-sm font-medium hover:bg-gray-100"
            >
              −
            </button>
          </div>
          
          {/* User location marker */}
          {userLat && userLng && (
            <div 
              className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${50 + (userLng - mapCenter.lng) * (zoom * 10)}%`,
                top: `${50 - (userLat - mapCenter.lat) * (zoom * 10)}%`,
              }}
              data-testid="user-location-marker"
            >
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              {/* Pulsing circle for user location */}
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
          )}

          {/* Hazard report markers */}
          {mapPoints.map((point) => {
            const x = 50 + (point.longitude - mapCenter.lng) * (zoom * 10);
            const y = 50 - (point.latitude - mapCenter.lat) * (zoom * 10);
            
            // Only show points within visible area
            if (x < 0 || x > 100 || y < 0 || y > 100) return null;
            
            return (
              <div
                key={point.id}
                className={`absolute ${getSeverityColor(point.severity)} ${getSeveritySize(point.severity)} rounded-full border border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                title={point.description}
                data-testid={`hazard-marker-${point.id}`}
              />
            );
          })}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h4 className="font-medium text-sm mb-2">Hazard Levels</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs">High Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs">Medium Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs">Low Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-xs">Your Location</span>
              </div>
            </div>
          </div>

          {/* Coordinates display */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="text-xs text-gray-600">
              Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-red-600" data-testid="stat-high-risk">
            {mapPoints.filter(p => p.severity === 'high').length}
          </div>
          <div className="text-xs text-muted-foreground">High Risk</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-orange-600" data-testid="stat-medium-risk">
            {mapPoints.filter(p => p.severity === 'medium').length}
          </div>
          <div className="text-xs text-muted-foreground">Medium Risk</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-yellow-600" data-testid="stat-low-risk">
            {mapPoints.filter(p => p.severity === 'low').length}
          </div>
          <div className="text-xs text-muted-foreground">Low Risk</div>
        </div>
      </div>

      {/* Recent reports list */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-3">Recent Reports Near You</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {mapPoints.slice(0, 5).map((point) => (
            <div key={point.id} className="flex items-start space-x-3" data-testid={`recent-report-${point.id}`}>
              <div className={`${getSeverityColor(point.severity)} w-2 h-2 rounded-full mt-2 flex-shrink-0`}></div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{point.description}</p>
                <p className="text-xs text-muted-foreground">
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          ))}
          {mapPoints.length === 0 && (
            <p className="text-muted-foreground text-sm">No reports in your area yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}