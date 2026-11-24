import { statuses } from '../../orders';

export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{statuses[status]}</span>;
}
