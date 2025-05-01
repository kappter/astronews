document.addEventListener('DOMContentLoaded', () => {
    const locationInfo = document.getElementById('location-info');
    const celestialTable = document.getElementById('celestial-data');

    // Function to fetch user's location
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    locationInfo.textContent = `Location: Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`;
                    fetchCelestialData(latitude, longitude);
                },
                (error) => {
                    locationInfo.textContent = 'Unable to fetch location. Using default data.';
                    displayCelestialData(getFallbackData());
                }
            );
        } else {
            locationInfo.textContent = 'Geolocation not supported. Using default data.';
            displayCelestialData(getFallbackData());
        }
    }

    // Function to fetch celestial data from AstronomyAPI
    async function fetchCelestialData(latitude, longitude) {
        try {
            const appId = '7d9f0bcb-9245-4e85-ad53-f943c713b81d';
            const appSecret = 'baad874ee1e4300a1373910ba505fcdb84dfe4beb95499f92178b4f97ae605fa8b6e5591b908ad984e3ace78d3b4d017586b2b83016b1985abeaff98c008a9a54a60475cf171e05c6cd94f934965148d3c3c199ab2986da718ad190ed0a0861c64b37f15cc6f91a96c81f394bf7d3998';
            const authString = btoa(`${appId}:${appSecret}`);
            const date = new Date();
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

            // Fetch positions over a 24-hour period to calculate rise, set, and meridian
            const positionsData = await fetchPositionsOverDay(latitude, longitude, dateString, authString);

            const celestialData = processApiData(positionsData, dateString);
            console.log('Processed celestial data:', celestialData); // Log the processed data
            displayCelestialData(celestialData);
        } catch (error) {
            console.error('Error fetching celestial data:', error);
            locationInfo.textContent = 'Failed to fetch data. Using default data.';
            displayCelestialData(getFallbackData());
        }
    }

    // Function to fetch positions over a 24-hour period
    async function fetchPositionsOverDay(latitude, longitude, dateString, authString) {
        const url = 'https://api.astronomyapi.com/api/v2/bodies/positions';
        const positions = {};

        // Fetch data for each planet at hourly intervals over 24 hours
        const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        for (let planet of planets) {
            positions[planet] = [];
            for (let hour = 0; hour < 24; hour++) {
                const timeString = `${hour.toString().padStart(2, '0')}:00:00`;
                const params = {
                    latitude: latitude,
                    longitude: longitude,
                    elevation: 0,
                    from_date: dateString,
                    to_date: dateString,
                    time: timeString,
                };

                try {
                    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
                        headers: {
                            'Authorization': `Basic ${authString}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`API response error for ${planet} at ${timeString}:`, response.status, errorText);
                        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
                    }

                    const data = await response.json();
                    console.log(`API response for ${planet} at ${timeString}:`, data);

                    if (!data.data || !data.data.table || !data.data.table.rows) {
                        console.warn(`Invalid API response for ${planet} at ${timeString}: Missing bodies data`);
                        continue;
                    }

                    const planetData = data.data.table.rows.find(row => row.entry.name.toLowerCase() === planet);
                    if (planetData) {
                        const position = planetData.cells[0]?.position || {};
                        const distance = planetData.cells[0]?.distance || {};

                        positions[planet].push({
                            time: timeString,
                            altitude: position.horizonal?.altitude?.degrees || 0,
                            azimuth: position.horizonal?.azimuth?.degrees || 0,
                            distance: distance.fromEarth?.au || 0,
                            eclipticLongitude: position.ecliptic?.longitude?.degrees || 0
                        });
                    } else {
                        console.warn(`No data found for ${planet} at ${timeString}`);
                    }

                    // Add a delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`Error fetching data for ${planet} at ${timeString}:`, error);
                    // Skip to the next iteration instead of failing entirely
                    continue;
                }
            }
        }

        return positions;
    }

    // Function to process API data into the required format
    function processApiData(positionsData, dateString) {
        const celestialData = [];

        for (let planet in positionsData) {
            const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
            const positions = positionsData[planet];

            if (!positions || positions.length === 0) {
                console.warn(`No position data for ${planetName}`);
                continue;
            }

            // Calculate rise, set, and meridian times
            let riseTime = 'N/A', setTime = 'N/A', meridianTime = 'N/A';
            let meridianAltitude = 0, meridianDistance = 0;

            for (let i = 0; i < positions.length; i++) {
                const current = positions[i];
                const prev = i > 0 ? positions[i - 1] : null;

                // Rise: altitude crosses 0 going up
                if (prev && prev.altitude < 0 && current.altitude >= 0) {
                    riseTime = current.time;
                }

                // Set: altitude crosses 0 going down
                if (prev && prev.altitude >= 0 && current.altitude < 0) {
                    setTime = current.time;
                }

                // Meridian: azimuth closest to 180°
                if (Math.abs(current.azimuth - 180) < 5) { // Within 5 degrees of meridian
                    meridianTime = current.time;
                    meridianAltitude = current.altitude;
                    meridianDistance = current.distance;
                }
            }

            // Format times with day (assuming current day for simplicity)
            riseTime = riseTime !== 'N/A' ? `Fri ${riseTime}` : 'N/A';
            setTime = setTime !== 'N/A' ? `Fri ${setTime}` : 'N/A';
            meridianTime = meridianTime !== 'N/A' ? `Fri ${meridianTime}` : 'N/A';

            // Calculate zodiac sign from ecliptic longitude
            const eclipticLongitude = positions[0]?.eclipticLongitude || 0;
            const sign = getZodiacSign(eclipticLongitude);

            // Estimate viewing conditions
            const viewing = estimateViewingConditions(meridianAltitude);

            // Distance in AU
            const distanceAU = meridianDistance ? meridianDistance.toFixed(3) : 'N/A';

            celestialData.push({
                planet: planetName,
                rise: riseTime,
                set: setTime,
                meridian: meridianTime,
                sign: sign,
                viewing: viewing,
                au: distanceAU
            });
        }

        return celestialData;
    }

    // Function to determine zodiac sign from ecliptic longitude
    function getZodiacSign(longitude) {
        const signs = [
            { sign: 'Aries', start: 0, end: 30 },
            { sign: 'Taurus', start: 30, end: 60 },
            { sign: 'Gemini', start: 60, end: 90 },
            { sign: 'Cancer', start: 90, end: 120 },
            { sign: 'Leo', start: 120, end: 150 },
            { sign: 'Virgo', start: 150, end: 180 },
            { sign: 'Libra', start: 180, end: 210 },
            { sign: 'Scorpio', start: 210, end: 240 },
            { sign: 'Sagittarius', start: 240, end: 270 },
            { sign: 'Capricorn', start: 270, end: 300 },
            { sign: 'Aquarius', start: 300, end: 330 },
            { sign: 'Pisces', start: 330, end: 360 }
        ];

        for (let { sign, start, end } of signs) {
            if (longitude >= start && longitude < end) {
                return sign;
            }
        }
        return 'N/A'; // Fallback
    }

    // Placeholder function to estimate viewing conditions based on altitude
    function estimateViewingConditions(altitude) {
        if (!altitude) return 'Unknown';
        if (altitude > 60) return 'Perfect visibility';
        if (altitude > 40) return 'Great visibility';
        if (altitude > 20) return 'Average visibility';
        if (altitude > 5) return 'Difficult to see';
        return 'Extremely difficult to see';
    }

    // Fallback data
    function getFallbackData() {
        return [
            { planet: 'Mercury', rise: 'Fri 5:42 am', set: 'Fri 11:48 am', meridian: 'Fri 5:55 pm', sign: 'Pisces', viewing: 'Difficult to see', au: 1.004 },
            { planet: 'Venus', rise: 'Fri 4:51 am', set: 'Fri 10:55 am', meridian: 'Fri 4:59 pm', sign: 'Pisces', viewing: 'Great visibility', au: 0.463 },
            { planet: 'Mars', rise: 'Thu 12:14 pm', set: 'Thu 7:37 pm', meridian: 'Fri 2:59 am', sign: 'Cancer', viewing: 'Perfect visibility', au: 1.429 },
            { planet: 'Jupiter', rise: 'Thu 9:04 am', set: 'Thu 4:32 pm', meridian: 'Thu 11:59 pm', sign: 'Taurus', viewing: 'Fairly good visibility', au: 5.856 },
            { planet: 'Saturn', rise: 'Fri 5:12 am', set: 'Fri 11:04 am', meridian: 'Fri 4:57 pm', sign: 'Pisces', viewing: 'Average visibility', au: 10.297 },
            { planet: 'Uranus', rise: 'Thu 7:38 am', set: 'Thu 2:49 pm', meridian: 'Thu 10:01 pm', sign: 'Taurus', viewing: 'Extremely difficult to see', au: 20.505 },
            { planet: 'Neptune', rise: 'Fri 5:17 am', set: 'Fri 11:17 am', meridian: 'Fri 5:16 pm', sign: 'Pisces', viewing: 'Extremely difficult to see', au: 30.665 }
        ];
    }

    // Function to display data in the table
    function displayCelestialData(data) {
        celestialTable.innerHTML = '';
        if (!data || data.length === 0) {
            console.warn('No celestial data to display');
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.planet || 'N/A'}</td>
                <td>${item.rise || 'N/A'}</td>
                <td>${item.set || 'N/A'}</td>
                <td>${item.meridian || 'N/A'}</td>
                <td>${item.sign || 'N/A'}</td>
                <td>${item.viewing || 'N/A'}</td>
                <td>${item.au || 'N/A'}</td>
            `;
            celestialTable.appendChild(row);
        });
    }

    // Initialize the page
    getUserLocation();
});