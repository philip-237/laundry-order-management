import { useEffect, useState } from 'react';
import { request } from '../api/client';
import Button from '../components/atoms/Button';
import Dialog from '../components/molecules/Dialog';
import OrderFilters from '../components/molecules/OrderFilters';
import OrderDetails from '../components/organisms/OrderDetails';
import OrderForm from '../components/organisms/OrderForm';
import OrderList from '../components/organisms/OrderList';
import DashboardLayout from '../components/templates/DashboardLayout';

export default function DashboardPage({ employee, onLogout, onExpired }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [notice, setNotice] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [dialogError, setDialogError] = useState('');
  const [fields, setFields] = useState({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());
    if (status) query.set('status', status);

    const timer = setTimeout(async () => {
      try {
        const result = await request(`/orders?${query}`, { signal: controller.signal });
        if (!controller.signal.aborted) setOrders(result.orders);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error.status === 401) onExpired();
        else setListError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, status, reloadCount, onExpired]);

  function prepareList() {
    setLoading(true);
    setListError('');
  }

  function reload() {
    prepareList();
    setReloadCount((count) => count + 1);
  }

  function showDialog(nextDialog) {
    setDialog(nextDialog);
    setDialogError('');
    setFields({});
  }

  async function runDialogAction(action) {
    if (pending) return;
    setDialogError('');
    setFields({});
    setPending(true);
    try {
      await action();
    } catch (error) {
      if (error.status === 401) onExpired();
      else {
        setDialogError(error.message);
        setFields(error.fields ?? {});
      }
    } finally {
      setPending(false);
    }
  }

  function openOrder(id) {
    showDialog({ mode: 'loading', id });
    runDialogAction(async () => {
      const order = await request(`/orders/${id}`);
      showDialog({ mode: 'details', order });
    });
  }

  function saveOrder(body) {
    const order = dialog.order;
    runDialogAction(async () => {
      await request(order ? `/orders/${order.id}` : '/orders', {
        method: order ? 'PATCH' : 'POST',
        body,
      });
      showDialog(null);
      setNotice(order ? 'Order updated.' : 'Order added.');
      if (!order) {
        setSearch('');
        setStatus('');
      }
      reload();
    });
  }

  function updateStatus(nextStatus) {
    runDialogAction(async () => {
      const order = await request(`/orders/${dialog.order.id}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      showDialog({ mode: 'details', order });
      setNotice(`Status updated for order #${order.id}.`);
      reload();
    });
  }

  function deleteOrder() {
    runDialogAction(async () => {
      await request(`/orders/${dialog.order.id}`, { method: 'DELETE' });
      showDialog(null);
      setNotice(`Order #${dialog.order.id} deleted.`);
      reload();
    });
  }

  async function logout() {
    setLogoutError('');
    setSigningOut(true);
    try {
      await onLogout();
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setSigningOut(false);
    }
  }

  const order = dialog?.order;
  const titles = {
    add: 'Add order',
    edit: `Edit order #${order?.id}`,
    details: `Order #${order?.id}`,
    delete: `Delete order #${order?.id}?`,
    loading: `Order #${dialog?.id}`,
  };

  return (
    <DashboardLayout employee={employee} onLogout={logout} signingOut={signingOut}>
      <div className="page-heading">
        <h1>Laundry orders</h1>
        <Button onClick={() => showDialog({ mode: 'add' })}>Add order</Button>
      </div>
      {logoutError && <p className="alert alert--error" role="alert">{logoutError}</p>}
      {notice && <p className="alert alert--success" role="status">{notice}</p>}
      <section className="panel order-panel" aria-label="Order management">
        <OrderFilters search={search} status={status}
          onSearch={(value) => { prepareList(); setSearch(value); }}
          onStatus={(value) => { prepareList(); setStatus(value); }} />
        <OrderList orders={orders} loading={loading} error={listError} filtered={Boolean(search.trim() || status)}
          onRetry={reload} onOpen={openOrder} />
      </section>
      {dialog && (
        <Dialog title={titles[dialog.mode]} pending={pending} onClose={() => showDialog(null)}>
          {dialogError && <p className="alert alert--error" role="alert">{dialogError}</p>}
          {dialog.mode === 'loading' && (pending
            ? <p role="status">Loading order…</p>
            : <Button variant="secondary" onClick={() => openOrder(dialog.id)}>Retry</Button>)}
          {['add', 'edit'].includes(dialog.mode) && (
            <OrderForm key={dialog.mode} order={order} pending={pending} fields={fields} onSubmit={saveOrder}
              onCancel={() => showDialog(order ? { mode: 'details', order } : null)} />
          )}
          {dialog.mode === 'details' && (
            <OrderDetails order={order} pending={pending} onStatus={updateStatus}
              onEdit={() => showDialog({ mode: 'edit', order })}
              onDelete={() => showDialog({ mode: 'delete', order })} />
          )}
          {dialog.mode === 'delete' && (
            <>
              <p>This will permanently delete order #{order.id} for {order.customerName}.</p>
              <div className="actions">
                <Button variant="secondary" onClick={() => showDialog({ mode: 'details', order })} disabled={pending}>Cancel</Button>
                <Button variant="danger" onClick={deleteOrder} disabled={pending}>{pending ? 'Deleting…' : 'Delete'}</Button>
              </div>
            </>
          )}
        </Dialog>
      )}
    </DashboardLayout>
  );
}
