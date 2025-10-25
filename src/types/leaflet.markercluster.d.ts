import 'leaflet';
import 'leaflet.markercluster';

declare module 'leaflet' {
  function markerClusterGroup(options?: L.MarkerClusterGroupOptions): L.MarkerClusterGroup;
}
