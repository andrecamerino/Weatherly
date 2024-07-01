const apiKey = 'd3eb345beda339081dd34f4f1632d515';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric'

let currentPlace;
let currentWeather;
let currentTemp;

document.addEventListener('DOMContentLoaded', () => {
    showData();
    attatchSavedPlacesListeners();
});

async function checkWeather(city) {
    const response = await fetch(apiUrl + `&appid=${apiKey}&q=${city}`);
    var data = await response.json();

    console.log(data)
    currentWeather = convertWeatherName(data.weather[0].main);
    currentTemp = Math.round(data.main.temp);

    currentPlace = data.name;
    const weatherTitle = document.querySelector('.weather-card-title');
    
    if (currentPlace.length > 12) {weatherTitle.style.fontSize = '3em'}
    else {weatherTitle.style.fontSize = '5em'}

    weatherTitle.innerHTML = currentPlace;

    document.getElementById('weather').innerHTML = currentWeather;

    document.getElementById('temperature').innerHTML = currentTemp + '&degC';
    document.getElementById('temp-min').innerHTML = 'Min: ' + Math.round(data.main.temp_min);
    document.getElementById('temp-max').innerHTML = 'Max: ' + Math.round(data.main.temp_max);
    
    document.getElementById('feels-like').innerHTML = Math.round(data.main.feels_like) + '&deg;';
    document.getElementById('wind-speed').innerHTML = data.wind.speed + '<span class="small-info-value"> kmph</span>';

    const timezoneOffset = data.timezone;

    let sunriseTime = new Date(data.sys.sunrise * 1000);
    let formattedSunriseTime = convertUnixToTime(data.sys.sunrise, timezoneOffset);
    document.getElementById('sunrise').innerHTML = formattedSunriseTime.substring(0, formattedSunriseTime.length - 3) + "<span class='small-info-value'>am</span>";

    let sunsetTime = new Date(data.sys.sunset * 1000);
    let formattedSunsetTime = convertUnixToTime(data.sys.sunset, timezoneOffset);
    document.getElementById('sunset').innerHTML = formattedSunsetTime.substring(0, formattedSunsetTime.length - 3) + "<span class='small-info-value'>pm</span>";

    return {'weather': currentWeather, 'temp': currentTemp, 'name': currentPlace};
}

function convertUnixToTime(timestamp, timezoneOffset) {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    const utcDate = new Date(date.toUTCString()); // Get the UTC date
    const localDate = new Date(utcDate.setHours(utcDate.getHours() + timezoneOffset / 3600)); // Adjust by timezone offset

    // Format the time
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const period = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${formattedHours}:${formattedMinutes} ${period}`;
}

const convertWeatherName = (weather) => {
    if (weather === 'Clouds') {weather = 'Cloudy'}
    else if (weather === 'Rain') {weather = 'Rainy'}
    else if (weather === 'Clear') {weather = 'Sunny'}
    else if (weather === 'Haze') {weather = 'Foggy'}

    return weather;
};

const changeColors = (weather, temp) => {

    let primaryColor; 
    let secondaryColor;

    if (temp >= 30) {
        primaryColor = 'rgb(244, 140, 6)';
        secondaryColor = 'rgb(220, 47, 2)';
    } else if (weather === 'Cloudy' || weather === 'Smoke') {
        primaryColor = '#b4b8ab';
        secondaryColor = '#284b63'; 
    } else if (weather === 'Sunny') {
        primaryColor = '#ade8f4'; 
        secondaryColor = '#48cae4'; 
    } else if (weather === 'Rainy' || weather === 'Drizzle') {
        primaryColor = '#0077b6'; 
        secondaryColor = '#023e8a'; 
    } else if (weather === 'Mist' || weather === 'Foggy') {
        primaryColor = '#f4f4f9'; 
        secondaryColor = '#b8dbd9'; 
    } else {
        console.log(`${weather}weather does not match any condition`);
        return; // Exit the function if currentWeather does not match any condition
    }

    // Apply the gradient as background-image
    document.body.style.backgroundImage = `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`;
}

const searchButton = document.getElementById('search-button')
const searchCity = async () => {
    const city = document.getElementById('search-bar').value;
    const placeInfo = await checkWeather(city);
    changeColors(placeInfo.weather, placeInfo.temp);
    animateWeather();
}

searchButton.addEventListener('click', searchCity);

const displayCity = async (city) => {
    const placeInfo = await checkWeather(city);
    changeColors(placeInfo.weather, placeInfo.temp);
    animateWeather();
}

const savedLocations = localStorage.getItem('saved-locations');
const savedPlacesData = savedLocations ? savedLocations.split(',') : [];
const savePlaceToData = (placeToSave) => {
    console.log(savedPlacesData);
    savedPlacesData.push(placeToSave);
    saveData();
};

const addButton = document.getElementById('add-button');
const placeList = document.getElementById('saved-places-list');
const savePlace = (city) => {

    const savedPlace = document.createElement('div');
    savedPlace.classList.add('saved-place')
    savedPlace.addEventListener('click', () => displayCity(city));
    
    const savedName = document.createElement('div');
    savedName.classList.add('saved-place-name');
    savedName.textContent = city;
    if (city.length > 13) {savedName.style.fontSize = '1.4em'}
    else {savedName.style.fontSize = '2em'}
    savedPlace.appendChild(savedName);
    
    const bottomDiv = document.createElement('div');
    bottomDiv.classList.add('saved-place-bottom');
    
    const savedWeather = document.createElement('div');
    savedWeather.classList.add('saved-place-weather');
    savedWeather.textContent = currentWeather;
    bottomDiv.appendChild(savedWeather)
    
    const savedTemp = document.createElement('div');
    savedTemp.classList.add('saved-temperature');
    savedTemp.innerHTML = currentTemp + '&deg;';
    bottomDiv.appendChild(savedTemp)
    
    savedPlace.appendChild(bottomDiv);
    placeList.appendChild(savedPlace);

    savePlaceToData(city);
}

const attatchSavedPlacesListeners = () => {
    const buttons = document.querySelectorAll('.saved-place');
    buttons.forEach(button => {
        
        button.addEventListener('click', () => {
            const city = button.querySelector('.saved-place-name').textContent;
            displayCity(city);
        
        });
    });
}

const clearButton = document.getElementById('clear-button');
clearButton.addEventListener('click', () => {clearSavedPlaces()});

const saveData = () => {
    localStorage.setItem("saved-locations", savedPlacesData);
    console.log(savedPlacesData);
}

const showData = () => {
    const locations = localStorage.getItem("saved-locations");
    
    if (locations === null) {
        return;
    } else {
        const locationsArray = locations.split(',');
        
        console.log(locationsArray);
        
        locationsArray.forEach((place) => {
            const placeInfo = getSavedPlaceInfo(place);
            reconstructSavedPlace(placeInfo);
        });
    }
};

const getSavedPlaceInfo = async (name) => {

    const response = await fetch(apiUrl + `&appid=${apiKey}&q=${name}`);
    var data = await response.json();

    name = data.name
    weather = convertWeatherName(data.weather[0].main);
    temp = Math.round(data.main.temp);

    placeInfo = {'name': name, 'weather': weather, 'temperature': temp};

    return placeInfo;
}

const reconstructSavedPlace = async (placeInfoPromise) => {
    const placeInfo = await placeInfoPromise;

    const savedPlace = document.createElement('div');
    savedPlace.classList.add('saved-place')
    savedPlace.addEventListener('click', () => displayCity(placeInfo.name));
    
    const savedName = document.createElement('div');
    savedName.classList.add('saved-place-name');
    savedName.textContent = placeInfo.name ? placeInfo.name : 'Unknown'; // Use a default value if name is undefined
    if (placeInfo.name && placeInfo.name.toString().length > 13) {savedName.style.fontSize = '1.4em'}
    else {savedName.style.fontSize = '2em'}
    savedPlace.appendChild(savedName);
    
    const bottomDiv = document.createElement('div');
    bottomDiv.classList.add('saved-place-bottom');
    
    const savedWeather = document.createElement('div');
    savedWeather.classList.add('saved-place-weather');
    savedWeather.textContent = placeInfo.weather;
    bottomDiv.appendChild(savedWeather)
    
    const savedTemp = document.createElement('div');
    savedTemp.classList.add('saved-temperature');
    savedTemp.innerHTML = placeInfo.temperature + '&deg;';
    bottomDiv.appendChild(savedTemp)
    
    savedPlace.appendChild(bottomDiv);
    placeList.appendChild(savedPlace);
};

const clearSavedPlaces = () => {
    placeList.innerHTML = '';
    localStorage.removeItem("saved-locations");
}

// Modify the addButton event listener to pass the currentPlace to savePlace
addButton.addEventListener('click', () => savePlace(currentPlace));

// weather code below

const weatherChangeDuration = 3000;

const sunElement = document.getElementById('sun');
const rainElement = document.getElementById('rain');
const cloudElement = document.querySelector('.clouds');

let sunActive = false;
let rainActive = false;
let cloudActive = false;

const showSunElement = () => {
    sunElement.style.transition = 'top 6s cubic-bezier(0.2, 1.5, 0.2, 1.2), right 6s ease';
    sunElement.style.top = '0';
    sunElement.style.right = '0';
    sunElement.style.visibility = 'visible';
    setTimeout(() => {sunActive = true}, weatherChangeDuration);
}    

const hideSunElement = () => {
    // animate out to right first
    sunElement.style.transition = `top ${weatherChangeDuration / 1000}s linear, right ${weatherChangeDuration / 1000}s linear`; 
    sunElement.style.top = '30%';
    sunElement.style.right = '-50%';

    setTimeout(() => {
        sunElement.style.transition = ''; // Remove the transition
        sunElement.style.top = '150%'; // Set the top position
        sunElement.style.right = '150%'; // Set the right position
        sunActive = false;
        sunElement.style.visibility = 'hidden';
    }, weatherChangeDuration);
};

const showRainElement = () => {
    rainActive = true;
    rainElement.style.visibility = 'visible';
    rainElement.style.transition = `opacity ${weatherChangeDuration / 1000}s linear`
    rainElement.style.opacity = '1';
}

const hideRainElement = () => {
    rainElement.style.transition = `opacity ${weatherChangeDuration / 1000}s linear`
    rainElement.style.opacity = '0';
    setTimeout(() => {
        rainActive = false;
        rainElement.style.visibility = 'hidden';
    }, weatherChangeDuration);        
}

const showCloudElement = () => {
    cloudActive = true;
    cloudElement.style.visibility = 'visible';
    cloudElement.style.opacity = '1';
}

const hideCloudElement = () => {
    cloudElement.style.opacity = '0';
    setTimeout(() => {
        cloudActive = false;
        cloudElement.style.visibility = 'hidden';
    }, weatherChangeDuration);
};

const animateWeather = () => {

    console.log(currentWeather);

    if (currentWeather === 'Sunny' && !sunActive) {
        showSunElement();
        hideRainElement();
        hideCloudElement();
    } else if ((currentWeather === 'Rainy' || currentWeather === 'Drizzle') && !rainActive) {
        showRainElement();
        hideSunElement();
        hideCloudElement();
    } else if ((currentWeather === 'Cloudy' || currentWeather === 'Foggy' || currentWeather === 'Smokey') && !cloudActive) {
        showCloudElement();
        hideSunElement();
        hideRainElement();
    }
};

const createRain = () => {
    const numDrops = 100; // Number of raindrops
    const container = document.getElementById('rain'); // Container to hold the raindrops
    
    for (let i = 0; i < numDrops; i++) {
        const drop = document.createElement('div');
        drop.classList.add('rain-drop');
        drop.style.left = `${Math.random() * 110}%`; // Random left position between 0% and 100%
        drop.style.animationDuration = `fall ${0.6 + Math.random() * 1}s linear infinite`;
        drop.style.animationDelay = `${Math.random() * 0.5}s`; // Random delay between 0s and 0.5s
        container.appendChild(drop);
    }
}

createRain();