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

    // Function to fetch celestial data from timeanddate.com Astronomy API
    async function fetchCelestialData(latitude, longitude) {
        try {
            const accessKey = 'YOUR_ACCESS_KEY'; // Replace with your timeanddate.com API key
            const expires = Math.floor(Date.now() / 1000) + 3600; // Timestamp for 1 hour from now
            const signature = 'YOUR_SIGNATURE'; // Replace with your computed signature (requires API secret)
            const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

            // API request for celestial events (rise, set, meridian) for planets
            const url = `https://api.xmltime.com/astronomy?object=mercury,venus,mars,jupiter,saturn,uranus,neptune&coords=${latitude},${longitude}&startdt=${date}&enddt=${date}&types=rise,set,meridian&version=3&out=json&accesskey=${accessKey}&expires=${expires}&signature=${signature}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
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
        const location = data.locations[0];
        const objects = location.astronomy.objects;

        objects.forEach(obj => {
            const planetName = obj.name.charAt(0).toUpperCase() + obj.name.slice(1);
            const days = obj.days[0]; // Data for the current date
            const events = days.events;

            // Extract rise, set, and meridian times
            const riseEvent = events.find(e => e.type === 'rise');
            const setEvent = events.find(e => e.type === 'set');
            const meridianEvent = events.find(e => e.type === 'meridian');

            // Format times
            const riseTime = riseEvent ? `Fri ${formatTime(riseEvent.hour, riseEvent.min)}` : 'N/A';
            const setTime = setEvent ? `Fri ${formatTime(setEvent.hour, setEvent.min)}` : 'N/A';
            const meridianTime = meridianEvent ? `Fri ${formatTime(meridianEvent.hour, meridianEvent.min)}` : 'N/A';

            // Placeholder for sign and viewing conditions (not directly provided by API)
            const sign = getSignForPlanet(planetName); // You'll need to implement this or use another API
            const viewing = estimateViewingConditions(meridianEvent?.altitude); // Estimate based on altitude

            // Distance in AU (convert from km to AU, 1 AU = 149,597,870.7 km)
            const distanceKm = meridianEvent?.distance || 0;
            const distanceAU = (distanceKm / 149597870.7).toFixed(3);

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

    // Placeholder function to determine zodiac sign (not provided by API)
    function getSignForPlanet(planet) {
        // This is a placeholder. You may need another API or calculation for accurate zodiac signs.
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

    // Fallback data (from the image you provided)
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