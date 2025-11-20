import Contribution from '../models/Contribution.js';

export const getContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find().populate('member', 'name');
    res.status(200).json({ success: true, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id).populate('member', 'name');
    if (!contribution) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }
    res.status(200).json({ success: true, data: contribution });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createContribution = async (req, res) => {
  try {
    const contribution = await Contribution.create(req.body);
    res.status(201).json({ success: true, data: contribution });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contribution) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }
    res.status(200).json({ success: true, data: contribution });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }
    await contribution.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMemberContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ member: req.params.memberId });
    res.status(200).json({ success: true, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getContributionStats = async (req, res) => {
  try {
    // Add your stats logic here
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};