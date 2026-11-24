import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import 'dotenv/config';

const baseUrl = new URL(process.env.TEST_API_URL || 'http://127.0.0.1:3000');
const email = process.env.EMPLOYEE_EMAIL;
const password = process.env.EMPLOYEE_PASSWORD;

test('employee session and laundry order workflow', async () => {
  assert.ok(['localhost', '127.0.0.1'].includes(baseUrl.hostname), 'Use a local test server.');
  assert.ok(email && password, 'Set EMPLOYEE_EMAIL and EMPLOYEE_PASSWORD before running the test.');
  let cookie;
  let orderId;

  function call(path, { method = 'GET', body, signedIn = true } = {}) {
    const headers = {};
    if (signedIn && cookie) headers.Cookie = cookie;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return fetch(new URL(`/api${path}`, baseUrl), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async function expectJson(path, status, options) {
    const response = await call(path, options);
    const data = await response.json();
    assert.equal(response.status, status, `${options?.method ?? 'GET'} ${path}: ${data.message ?? ''}`);
    return data;
  }

  const order = {
    customerName: `Test ${randomUUID()}`,
    customerPhone: `0${Date.now()}`,
    serviceType: 'WASH_AND_IRON',
    totalPrice: '1500.50',
    notes: 'Handle white shirts separately.',
  };

  try {
    await expectJson('/health', 200);
    for (const [method, path] of [
      ['GET', '/orders'],
      ['GET', '/orders/1'],
      ['POST', '/orders'],
      ['PATCH', '/orders/1'],
      ['DELETE', '/orders/1'],
    ]) {
      await expectJson(path, 401, { method });
    }
    const incorrect = await expectJson('/auth/login', 401, {
      method: 'POST', body: { email, password: 'incorrect-test-password' },
    });
    const unknown = await expectJson('/auth/login', 401, {
      method: 'POST', body: { email: `${randomUUID()}@example.test`, password },
    });
    assert.equal(incorrect.message, unknown.message);

    const login = await call('/auth/login', {
      method: 'POST', body: { email: `  ${email.toUpperCase()}  `, password },
    });
    assert.equal(login.status, 200);
    const setCookie = login.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/i);
    cookie = setCookie.split(';')[0];
    const profile = await login.json();
    assert.deepEqual(Object.keys(profile).sort(), ['email', 'id', 'name']);
    assert.deepEqual(await expectJson('/auth/me', 200), profile);

    const invalid = await expectJson('/orders', 400, {
      method: 'POST', body: { ...order, totalPrice: '0.001' },
    });
    assert.ok(invalid.fields.totalPrice);
    const byName = `/orders?search=${encodeURIComponent(order.customerName)}`;
    assert.deepEqual((await expectJson(byName, 200)).orders, []);
    await expectJson('/orders?status=UNKNOWN', 400);

    const created = await expectJson('/orders', 201, { method: 'POST', body: order });
    orderId = created.id;
    assert.equal(created.status, 'RECEIVED');
    assert.equal(created.totalPrice, '1500.50');
    assert.equal(created.customerPhone, order.customerPhone);
    assert.equal((await expectJson(`/orders/${orderId}`, 200)).notes, order.notes);
    assert.equal((await expectJson(byName, 200)).orders[0].id, orderId);
    assert.equal((await expectJson(`/orders?search=${order.customerPhone}`, 200)).orders[0].id, orderId);
    assert.equal((await expectJson(`${byName}&status=RECEIVED`, 200)).orders.length, 1);

    const price = await expectJson(`/orders/${orderId}`, 200, {
      method: 'PATCH', body: { totalPrice: '2500.25' },
    });
    assert.equal(price.totalPrice, '2500.25');
    for (const status of ['WASHING', 'READY', 'COLLECTED', 'RECEIVED']) {
      const updated = await expectJson(`/orders/${orderId}`, 200, { method: 'PATCH', body: { status } });
      assert.equal(updated.status, status);
      assert.equal((await expectJson(`${byName}&status=${status}`, 200)).orders.length, 1);
      const otherStatus = status === 'READY' ? 'WASHING' : 'READY';
      assert.deepEqual((await expectJson(`${byName}&status=${otherStatus}`, 200)).orders, []);
    }

    assert.equal((await call(`/orders/${orderId}`, { method: 'DELETE' })).status, 204);
    await expectJson(`/orders/${orderId}`, 404);
    orderId = undefined;
    const logout = await call('/auth/logout', { method: 'POST' });
    assert.equal(logout.status, 204);
    assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/i);
    await expectJson('/auth/me', 401);
    await expectJson('/orders', 401);
  } finally {
    if (orderId) await call(`/orders/${orderId}`, { method: 'DELETE' }).catch(() => {});
  }
});
