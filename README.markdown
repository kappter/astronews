# Astronomy Dashboard

A web application for astronomy enthusiasts to view celestial object data (rise, set, meridian times, and more) based on their location. This project fetches real-time data using the timeanddate.com Astronomy API and displays it in an attractive, space-themed table.

## Features

- **Location-Based Data**: Automatically fetches the user's location using the browser's Geolocation API.
- **Real-Time Celestial Data**: Retrieves rise, set, meridian times, zodiac signs, viewing conditions, and distances (in AU) for Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune.
- **Responsive Design**: A dark, space-themed UI with a responsive table that works on both desktop and mobile devices.
- **Fallback Mechanism**: Uses static data if the API call fails or if location access is denied.

## Project Structure

- `index.html`: The main HTML file containing the structure of the webpage.
- `styles.css`: CSS file for styling the webpage with a space-themed design.
- `script.js`: JavaScript file that handles location fetching, API calls, and table population.

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, etc.) with JavaScript enabled.
- An API key from [timeanddate.com](https://dev.timeanddate.com/) to fetch celestial data.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/astronomy-dashboard.git
   cd astronomy-dashboard
   ```

2. **Obtain API Credentials**:
   - Sign up at [dev.timeanddate.com](https://dev.timeanddate.com/) to get an API access key and secret.
   - In `script.js`, replace `'YOUR_ACCESS_KEY'` and `'YOUR_SIGNATURE'` with your API credentials. You'll need to compute the signature for each request as per their documentation.

3. **Host the Project**:
   - You can open `index.html` directly in a browser for local testing, but some browsers may block Geolocation API or CORS requests when running locally.
   - For proper functionality, host the files on a web server. You can use a simple local server like:
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000` in your browser.

## Usage

- Open the webpage in a browser.
- Allow location access when prompted to fetch your current latitude and longitude.
- The table will populate with celestial data for the current date, including rise/set times, meridian passage, zodiac signs, viewing conditions, and distances in AU from Earth.
- If location access is denied or the API fails, the app will display fallback data.

## Limitations

- **Zodiac Signs**: The zodiac signs are currently static placeholders. For accurate signs, you may need an additional API or calculation method.
- **Viewing Conditions**: Viewing conditions are estimated based on the meridian altitude. This can be refined with more specific criteria.
- **API Dependency**: The app relies on the timeanddate.com API, which requires a paid subscription for higher usage limits.

## Future Improvements

- Integrate a secondary API or calculation for accurate zodiac signs.
- Add more celestial data, such as moon phases or weather conditions.
- Enhance the UI with animations, such as a starry background or interactive planet details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [timeanddate.com](https://www.timeanddate.com/) for providing the Astronomy API.
- Inspired by astronomy data tables for Salt Lake City, UT.