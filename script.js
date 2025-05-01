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
                    // Fallback to static data if location access is denied
                    displayCelestialData(getFallbackData());
                }
            );
        } else {
            locationInfo.textContent = 'Geolocation not supported. Using default data.';
            displayCelestialData(getFallbackData());
        }
    }

    // Function to fetch celestial data (placeholder for API call)
    function fetchCelestialData(latitude, longitude) {
        // Replace this with a real API call, e.g., using fetch()
        // Example: fetch(`https://api.astronomyapi.com/data?lat=${latitude}&lon=${longitude}`)
        // For now, we'll use the static data from the image as a fallback
        const data = getFallbackData();
        displayCelestialData(data);
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