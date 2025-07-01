import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'tokennnnnnn hallll'; 

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [84.1240, 28.3949],
      zoom: 6.2,
    });

    new mapboxgl.Marker({ color: 'red' })
      .setLngLat([84.02, 27.70])
      .setPopup(new mapboxgl.Popup().setHTML("<b> Fire detected</b><br>27.70°N, 84.02°E"))
      .addTo(map.current);
  }, []);

  return (
    <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] mt-6 rounded-lg shadow-md overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

export default Map;
