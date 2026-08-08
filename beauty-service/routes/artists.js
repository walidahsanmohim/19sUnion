const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');

// GET /api/artists - Get all artists with filters
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      area, 
      service, 
      minRating, 
      maxPrice,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true, isFake: false };

    // Filter by city
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    // Filter by area
    if (area) {
      query.area = new RegExp(area, 'i');
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by service and price
    if (service || maxPrice) {
      query.services = {};
      if (service) {
        query.services.$elemMatch = { name: new RegExp(service, 'i') };
      }
      if (maxPrice) {
        if (!query.services.$elemMatch) {
          query.services.$elemMatch = {};
        }
        query.services.$elemMatch.price = { $lte: parseInt(maxPrice) };
      }
    }

    // Search by name
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { area: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const artists = await Artist.find(query)
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    const total = await Artist.countDocuments(query);

    res.json({
      success: true,
      data: artists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching artists',
      error: error.message
    });
  }
});

// GET /api/artists/:id - Get single artist
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).select('-__v');
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.json({
      success: true,
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching artist',
      error: error.message
    });
  }
});

// POST /api/artists - Register new artist
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      area,
      latitude,
      longitude,
      services,
      profileImage,
      experience
    } = req.body;

    // Check if email already exists
    const existingArtist = await Artist.findOne({ email });
    if (existingArtist) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    const artist = new Artist({
      name,
      email,
      phone,
      address,
      city,
      area,
      latitude,
      longitude,
      services,
      profileImage,
      experience
    });

    await artist.save();

    res.status(201).json({
      success: true,
      message: 'Artist registered successfully',
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering artist',
      error: error.message
    });
  }
});

// PUT /api/artists/:id - Update artist
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.isFake;
    delete updates.isVerified;
    delete updates.rating;
    delete updates.reviewCount;

    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.json({
      success: true,
      message: 'Artist updated successfully',
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating artist',
      error: error.message
    });
  }
});

// GET /api/artists/nearby/:lat/:lng - Get nearby artists
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 10 } = req.query; // radius in km

    const artists = await Artist.find({
      isActive: true,
      isFake: false,
      latitude: {
        $gte: parseFloat(lat) - 0.1,
        $lte: parseFloat(lat) + 0.1
      },
      longitude: {
        $gte: parseFloat(lng) - 0.1,
        $lte: parseFloat(lng) + 0.1
      }
    }).select('-__v').sort({ rating: -1 });

    // Calculate actual distance for each artist
    const artistsWithDistance = artists.map(artist => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        artist.latitude,
        artist.longitude
      );
      return {
        ...artist.toObject(),
        distance: distance.toFixed(2)
      };
    }).filter(artist => artist.distance <= radius);

    res.json({
      success: true,
      data: artistsWithDistance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby artists',
      error: error.message
    });
  }
});

// Helper function to calculate distance (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;
