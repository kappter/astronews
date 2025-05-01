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
            const date = new Date().toISOString().split('.')[0] + 'Z'; // Current UTC time in ISO format

            const url = 'https://api.astronomyapi.com/api/v2/bodies/positions';
            const params = {
                latitude: latitude,
                longitude: longitude,
                elevation: 0, // Assuming sea level; adjust if needed
                from_date: date.split('T')[0], // Current date
                to_date: date.split('T')[0], // Same date
                time: date.split('T')[1], // Current time
            };

            const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API response error:', response.status, errorText);
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('API response:', data); // Log the response to inspect its structure
            if (!data.data || !data.data.table || !data.data.table.rows) {
                throw new Error('Invalid API response: Missing bodies data');
            }

            const celestialData = processApiData(data);
            displayCelestialData(celestialData);
        } catch (error) {
            console.error('Error fetching celestial data:', error);
            locationInfo.textContent = 'Failed to fetch data. Using default data.';
            displayCelestialData(getFallbackData());
        }
    }

    // Function to process API data into the required format
    function processApiData(data) {
        const celestialData = [];
        const bodies = data.data.table.rows;

        bodies.forEach(body => {
            const planetName = body.entry.name.charAt(0).toUpperCase() + body.entry.name.slice(1);
            if (!['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(body.entry.name.toLowerCase())) {
                return; // Skip non-planets
            }

            const position = body.cells[0].position.horizonal; // Current position
            const distanceAU = (body.cells[0].distance.from_earth.au).toFixed(3);

            // Approximate rise, set, and meridian using altitude
            // Note: This is a simplification; ideally, we'd need to fetch positions over a 24-hour period
            const altitude = position.altitude.degrees;
            const azimuth = position.azimuth.degrees;

            // Placeholder for rise, set, and meridian (requires multiple API calls to calculate accurately)
            const riseTime = 'N/A'; // Requires checking when altitude crosses 0
            const setTime = 'N/A'; // Requires checking when altitude crosses 0
            const meridianTime = azimuth > 170 && azimuth < 190 ? formatTime(new Date().getHours(), new Date().getMinutes()) : 'N/A'; // Approximate meridian when azimuth is near 180°

            const sign = getSignForPlanet(planetName);
            const viewing = estimateViewingConditions(altitude);

            celestialData.push({
                planet: planetName,
                rise: riseTime,
                set: setTime,
                meridian: meridianTime,
                sign: sign,
                viewing: viewing,
                au: distanceAU
            });
        });

        return celestialData;
    }

    // Helper function to format time as "H:MM am/pm"
    function formatTime(hour, minute) {
        const period = hour >= 12 ? 'pm' : 'am';
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    // Placeholder function to determine zodiac sign
    function getSignForPlanet(planet) {
        const signs = {
            Mercury: 'Pisces',
            Venus: 'Pisces',
            Mars: 'Cancer',
            Jupiter: 'Taurus',
            Saturn: 'Pisces',
            Uranus: 'Taurus',
            Neptune: 'Pisces'
        };
        return signs[planet] || 'N/A';
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
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.planet}</td>
                <td>${item.rise}</td>
                <td>${item.set}</td>
                <td>${item.meridian}</td>
                <td>${item.sign}</td>
                <td>${item.viewing}</td>
                <td>${item.au}</td>
            `;
            celestialTable.appendChild(row);
        });
    }

    // Initialize the page
    getUserLocation();
});