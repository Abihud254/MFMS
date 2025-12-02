import Share from '../models/Share.js';

export const getShares = async (req, res) => {
  try {
    const shares = await Share.find().populate('member', 'name');
    res.status(200).json({ success: true, data: shares });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getShare = async (req, res) => {
  try {
    const share = await Share.findById(req.params.id).populate('member', 'name');
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' });
    }
    res.status(200).json({ success: true, data: share });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createShare = async (req, res) => {
  try {
    const share = await Share.create(req.body);
    res.status(201).json({ success: true, data: share });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateShare = async (req, res) => {
  try {
    const share = await Share.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' });
    }
    res.status(200).json({ success: true, data: share });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteShare = async (req, res) => {
  try {
    const share = await Share.findById(req.params.id);
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' });
    }
    await share.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMemberShares = async (req, res) => {
  try {
    const shares = await Share.find({ member: req.params.memberId });
    res.status(200).json({ success: true, data: shares });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getShareStats = async (req, res) => {
  try {
    // Add your stats logic here
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};