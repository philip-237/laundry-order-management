import Button from '../atoms/Button';
import Select from '../atoms/Select';
import StatusBadge from '../atoms/StatusBadge';
import FormField from '../molecules/FormField';
import { formatDate, formatPrice, services, statuses } from '../../orders';

export default function OrderDetails({ order, onStatus, onEdit, onDelete, pending }) {
  return (
    <>
      <dl className="details">
        <dt>Customer</dt><dd>{order.customerName}</dd>
        <dt>Phone</dt><dd>{order.customerPhone}</dd>
        <dt>Service</dt><dd>{services[order.serviceType]}</dd>
        <dt>Total price</dt><dd>{formatPrice(order.totalPrice)}</dd>
        <dt>Received</dt><dd>{formatDate(order.createdAt)}</dd>
        <dt>Last updated</dt><dd>{formatDate(order.updatedAt)}</dd>
        <dt>Status</dt><dd><StatusBadge status={order.status} /></dd>
        <dt>Notes</dt><dd className="notes">{order.notes || 'No notes'}</dd>
      </dl>
      <form className="status-form" onSubmit={(event) => {
        event.preventDefault();
        const status = new FormData(event.currentTarget).get('status');
        if (status !== order.status) onStatus(status);
      }}>
        <FormField label="Change status">
          {(props) => <Select {...props} name="status" key={order.status} defaultValue={order.status} options={statuses} disabled={pending} />}
        </FormField>
        <Button type="submit" disabled={pending}>{pending ? 'Updating…' : 'Update status'}</Button>
      </form>
      <div className="actions">
        <Button variant="danger-outline" onClick={onDelete} disabled={pending}>Delete order</Button>
        <Button variant="secondary" onClick={onEdit} disabled={pending}>Edit order</Button>
      </div>
    </>
  );
}
