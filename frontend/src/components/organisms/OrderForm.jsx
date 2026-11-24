import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import FormField from '../molecules/FormField';
import { currency, services } from '../../orders';

export default function OrderForm({ order, onSubmit, onCancel, pending, fields }) {
  return (
    <form className="form" onSubmit={(event) => {
      event.preventDefault();
      onSubmit(Object.fromEntries(new FormData(event.currentTarget)));
    }}>
      <FormField label="Customer name" error={fields.customerName}>
        {(props) => <Input {...props} name="customerName" defaultValue={order?.customerName} maxLength={120} required />}
      </FormField>
      <FormField label="Customer phone number" error={fields.customerPhone}>
        {(props) => <Input {...props} name="customerPhone" type="tel" defaultValue={order?.customerPhone} maxLength={40} required />}
      </FormField>
      <FormField label="Service" error={fields.serviceType}>
        {(props) => <Select {...props} name="serviceType" defaultValue={order?.serviceType ?? ''}
          options={{ '': 'Choose a service', ...services }} required />}
      </FormField>
      <FormField label={`Total price (${currency})`} error={fields.totalPrice}>
        {(props) => <Input {...props} name="totalPrice" inputMode="decimal"
          defaultValue={order?.totalPrice} maxLength={13} required />}
      </FormField>
      <FormField label="Notes (optional)" error={fields.notes}>
        {(props) => <textarea {...props} name="notes" defaultValue={order?.notes ?? ''} maxLength={1000} rows={3} />}
      </FormField>
      <div className="actions">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save order'}</Button>
      </div>
    </form>
  );
}
