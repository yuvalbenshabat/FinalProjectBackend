// 📁 נתיב: /utils/calcDistance.js

function haversineDistance(lat1, lon1, lat2, lon2) {
  // Convert string coordinates to numbers if needed
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  // Validate coordinates
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.error('Invalid coordinates:', { lat1, lon1, lat2, lon2 });
    return null;
  }

  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  console.log('Distance calculated:', { lat1, lon1, lat2, lon2, distance }); // Debug log
  return distance;
}

module.exports = haversineDistance;
