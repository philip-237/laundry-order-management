import Input from '../atoms/Input';
import Select from '../atoms/Select';
import FormField from './FormField';
import { statuses } from '../../orders';

export default function OrderFilters({ search, status, onSearch, onStatus }) {
  return (
    <div className="filters">
      <FormField label="Search orders">
        {(props) => <Input {...props} type="search" value={search} maxLength={120}
          placeholder="Customer name or phone" onChange={(event) => onSearch(event.target.value)} />}
      </FormField>
      <FormField label="Status">
        {(props) => <Select {...props} value={status} options={{ '': 'All statuses', ...statuses }}
          onChange={(event) => onStatus(event.target.value)} />}
      </FormField>
    </div>
  );
}
