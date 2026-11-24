import Button from '../atoms/Button';
import OrderRow from '../molecules/OrderRow';

export default function OrderList({ orders, loading, error, filtered, onRetry, onOpen }) {
  if (loading) return <p className="list-message" role="status">Loading orders…</p>;
  if (error) {
    return (
      <div className="list-message">
        <p role="alert">{error}</p>
        <Button variant="secondary" onClick={onRetry}>Retry</Button>
      </div>
    );
  }
  if (!orders.length) {
    return <p className="list-message" role="status">{filtered ? 'No matching orders.' : 'No orders yet.'}</p>;
  }
  return (
    <table className="orders-table" aria-label="Laundry orders">
      <thead><tr>{['Order', 'Customer', 'Phone', 'Service', 'Price', 'Status', 'Received', 'Actions']
        .map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{orders.map((order) => <OrderRow key={order.id} order={order} onOpen={onOpen} />)}</tbody>
    </table>
  );
}
