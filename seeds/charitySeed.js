require('dotenv').config();
const mongoose = require('mongoose');
const Charity = require('../models/Charity');

const sampleCharities = [
  {
    name: 'St. Jude Children\'s Research Hospital',
    description: 'St. Jude is leading the way the world understands, treats and defeats childhood cancer and other diseases. Our mission is to find cures for children with cancer and other catastrophic diseases through research and treatment.',
    website: 'https://www.stjude.org',
    image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400',
    allocationPercent: 10,
    totalRaised: 0,
    totalIndependentDonations: 0,
    featured: true,
    events: [
      {
        title: 'St. Jude Golf Classic 2026',
        date: new Date('2026-06-15'),
        description: 'Annual charity golf tournament',
        location: 'Pebble Beach Golf Links'
      }
    ]
  },
  {
    name: 'First Tee of Greater Chicago',
    description: 'First Tee uses golf to teach youth about core values like honesty, integrity, and sportsmanship. We believe every child deserves the opportunity to learn these valuable life skills through golf.',
    website: 'https://www.firsttee.org/chapters/greater-chicago',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    allocationPercent: 10,
    totalRaised: 0,
    totalIndependentDonations: 0,
    featured: true,
    events: [
      {
        title: 'Junior Golf Workshop',
        date: new Date('2026-04-20'),
        description: 'Free golf lessons for youth ages 7-17',
        location: 'Chicago Golf Club'
      }
    ]
  },
  {
    name: 'Conservation Golf Foundation',
    description: 'Dedicated to preserving golf courses and natural habitats. We work with golf courses worldwide to implement sustainable practices that protect wildlife and reduce environmental impact.',
    website: 'https://www.conservationgolf.org',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
    allocationPercent: 10,
    totalRaised: 0,
    totalIndependentDonations: 0,
    featured: false,
    events: []
  },
  {
    name: 'Golfers Without Borders',
    description: 'Bringing the joy of golf to underserved communities worldwide. We build golf facilities and provide coaching in areas where the sport is inaccessible.',
    website: 'https://www.golferswithoutborders.org',
    image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400',
    allocationPercent: 10,
    totalRaised: 0,
    totalIndependentDonations: 0,
    featured: false,
    events: []
  },
  {
    name: 'Armed Forces Golf Association',
    description: 'Supporting golf programs for active duty military, veterans, and their families. We organize tournaments and provide equipment to those who have served.',
    website: 'https://www.afga.org',
    image: 'https://images.unsplash.com/photo-1530543787849-128d94430c6b?w=400',
    allocationPercent: 10,
    totalRaised: 0,
    totalIndependentDonations: 0,
    featured: false,
    events: [
      {
        title: 'Veterans Golf Day',
        date: new Date('2026-05-25'),
        description: 'Tournament honoring service members',
        location: 'Army Navy Country Club'
      }
    ]
  }
];

const seedCharities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Charity.deleteMany({});
    console.log('Cleared existing charities');

    const createdCharities = await Charity.insertMany(sampleCharities);
    console.log(`\nCreated ${createdCharities.length} sample charities:\n`);
    
    createdCharities.forEach((charity, index) => {
      console.log(`${index + 1}. ${charity.name}${charity.featured ? ' [FEATURED]' : ''}`);
    });

    console.log('\n✓ Charity seed completed successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding charities:', error.message);
    process.exit(1);
  }
};

seedCharities();
