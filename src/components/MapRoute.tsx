import React from 'react';

interface MapRouteProps {
  activities: any[];
  style: any;
}

const MapRoute: React.FC<MapRouteProps> = ({ activities, style }) => {
  return (
    <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
      {/* Map Placeholder */}
      <p>Map showing {activities.length} locations</p>
    </div>
  );
};

export default MapRoute;
