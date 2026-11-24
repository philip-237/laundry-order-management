import Button from '../atoms/Button';
import StatusBadge from '../atoms/StatusBadge';
import { formatDate, formatPrice, services } from '../../orders';

export default function OrderRow({ order, onOpen }) {
  return (
    <tr>
      <td data-label="Order">#{order.id}</td>
      <td data-label="Customer">{order.customerName}</td>
      <td data-label="Phone">{order.customerPhone}</td>
      <td data-label="Service">{services[order.serviceType]}</td>
      <td data-label="Price" className="price">{formatPrice(order.totalPrice)}</td>
      <td data-label="Status"><StatusBadge status={order.status} /></td>
      <td data-label="Received">{formatDate(order.createdAt)}</td>
      <td className="row-actions">
        <Button variant="secondary" aria-label={`View order #${order.id}`} onClick={() => onOpen(order.id)}>
          View
        </Button>
      </td>
    </tr>
  );
}
