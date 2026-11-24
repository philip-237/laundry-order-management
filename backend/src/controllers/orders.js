import { OrderStatus, ServiceType } from '@prisma/client';
import * as orders from '../models/order.js';
import { HttpError } from '../middleware/errors.js';

function readId(req) {
  const id = Number(req.params.id);
  if (!/^\d+$/.test(req.params.id) || id < 1 || id > 2147483647) {
    throw new HttpError(404, 'Order not found.');
  }
  return id;
}

function requireOrder(order) {
  if (!order) throw new HttpError(404, 'Order not found.');
  return { ...order, totalPrice: order.totalPrice.toFixed(2) };
}

function readOrder(body, editing = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Send an order as a JSON object.');
  }

  const fields = {};
  const data = {};
  for (const [key, label, limit] of [
    ['customerName', 'customer name', 120],
    ['customerPhone', 'phone number', 40],
  ]) {
    if (editing && !Object.hasOwn(body, key)) continue;
    const value = typeof body[key] === 'string' ? body[key].trim() : '';
    if (!value || value.length > limit) {
      fields[key] = `Enter a ${label} with 1 to ${limit} characters.`;
    } else {
      data[key] = value;
    }
  }
  if (!editing || Object.hasOwn(body, 'serviceType')) {
    if (!Object.values(ServiceType).includes(body.serviceType)) {
      fields.serviceType = 'Choose a valid service.';
    } else {
      data.serviceType = body.serviceType;
    }
  }
  if (!editing || Object.hasOwn(body, 'totalPrice')) {
    const value = typeof body.totalPrice === 'string' ? body.totalPrice.trim() : '';
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) {
      fields.totalPrice = 'Enter zero or a positive price with up to two decimal places.';
    } else {
      data.totalPrice = value;
    }
  }
  if (Object.hasOwn(body, 'notes')) {
    if (body.notes === null || typeof body.notes === 'string' && body.notes.trim().length <= 1000) {
      data.notes = body.notes?.trim() || null;
    } else {
      fields.notes = 'Enter up to 1,000 characters.';
    }
  }
  if (Object.hasOwn(body, 'status')) {
    if (editing && Object.values(OrderStatus).includes(body.status)) {
      data.status = body.status;
    } else {
      fields.status = editing ? 'Choose a valid status.' : 'New orders start as Received.';
    }
  }
  if (Object.keys(fields).length) throw new HttpError(400, 'Check the highlighted fields.', fields);
  if (!Object.keys(data).length) throw new HttpError(400, 'Provide at least one order field.');
  return data;
}

export async function list(req, res) {
  const { search = '', status } = req.query;
  if (typeof search !== 'string' || search.trim().length > 120) {
    throw new HttpError(400, 'Search must be 120 characters or fewer.');
  }
  if (status !== undefined && !Object.values(OrderStatus).includes(status)) {
    throw new HttpError(400, 'Choose a valid status filter.');
  }
  const results = await orders.listOrders(search.trim(), status);
  res.json({ orders: results.map(requireOrder) });
}

export async function get(req, res) {
  res.json(requireOrder(await orders.findOrder(readId(req))));
}

export async function create(req, res) {
  const order = await orders.createOrder(readOrder(req.body));
  res.status(201).json(requireOrder(order));
}

export async function update(req, res) {
  const order = await orders.updateOrder(readId(req), readOrder(req.body, true));
  res.json(requireOrder(order));
}

export async function remove(req, res) {
  if (!await orders.deleteOrder(readId(req))) throw new HttpError(404, 'Order not found.');
  res.sendStatus(204);
}
