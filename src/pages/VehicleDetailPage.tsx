import { useParams } from 'react-router-dom';
import { VehicleDetailView } from '../components/vehicle/VehicleDetailView';

export default function VehicleDetailPage() {
  const { id } = useParams();
  return <VehicleDetailView vehicleId={Number(id)} showBreadcrumbs containerized />;
}
