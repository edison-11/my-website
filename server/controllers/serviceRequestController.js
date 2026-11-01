const ServiceRequest = require('../models/ServiceRequest');

const createServiceRequest = async (req, res) => {
  const { name, email, phone, serviceType, eventDate, eventLocation, budget, details } = req.body;
  const request = await ServiceRequest.create({ name, email, phone, serviceType, eventDate, eventLocation, budget, details });
  res.status(201).json(request);
};

const createCustomerServiceRequest = async (req, res) => {
  const { phone, serviceType, eventDate, eventLocation, budget, details } = req.body;
  const request = await ServiceRequest.create({
    customer: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone,
    serviceType,
    eventDate: eventDate || null,
    eventLocation,
    budget: budget === '' || budget === undefined ? null : budget,
    details
  });
  res.status(201).json(request);
};

const listCustomerServiceRequests = async (req, res) => {
  res.json(await ServiceRequest.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(100));
};

const listServiceRequests = async (_req, res) => {
  res.json(await ServiceRequest.find().sort({ createdAt: -1 }).limit(100));
};

const updateServiceRequest = async (req, res) => {
  const request = await ServiceRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
    new: true, runValidators: true
  });
  if (!request) return res.status(404).json({ message: 'Service request not found' });
  res.json(request);
};

module.exports = { createServiceRequest, createCustomerServiceRequest, listCustomerServiceRequests, listServiceRequests, updateServiceRequest };
