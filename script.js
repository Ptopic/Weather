const key = 'e462338636d64d6f8f003346221507';
const accuKey = 'jnIwcA6KwJWPjUcoSiZmIhHC2dYyPG3w';

// Open weather api calls
// Get current weather
// https://api.openweathermap.org/data/2.5/weather?lat=43.51&lon=16.46&appid=887bd2d2a087b3f5d02df33de9cb0a08

const form = document.querySelector('.input-field');
const submitBtn = document.querySelector('.search-btn');
const cityValue = document.querySelector('.input-city');

// Weather data container
const container = document.querySelector('.data-container');
const forecastDrawer = document.querySelector('.forecast-data');
const bgContainer = document.querySelector('.bg-view');

const navBarOpenIcon = document.querySelector('.navbar-icon');
const navBarCloseIcon = document.querySelector('.navbar-icon--dark');

const navBarContainer = document.querySelector('.navbar-container');

let time;
let cityName;
let countryName;

// Aykhal

// Boilerplate for api calls
// http://api.weatherapi.com/v1/current.json?key=e462338636d64d6f8f003346221507&q=Split&days=3

// Custom cursor

const cursorRounded = document.querySelector('.rounded');

const moveCursor = (e) => {
	const mouseY = e.clientY;
	const mouseX = e.clientX;

	cursorRounded.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
};

window.addEventListener('mousemove', moveCursor);

const toggleHiddenClass = () => {
	navBarContainer.classList.remove('hidden');
};

const navBarOpen = () => {
	let tl = gsap.timeline({ onComplete: toggleHiddenClass });
	tl.fromTo(
		'.navbar-container',
		{ translateX: '30rem' },
		{ translateX: 0, duration: 0.9, ease: 'expo' }
	);
};

const navBarClose = () => {
	let tl = gsap.timeline({ onComplete: toggleHiddenClass });
	tl.fromTo(
		'.navbar-container',
		{ translateX: 0 },
		{ translateX: '50rem', duration: 0.9, ease: 'expo' }
	);
};

const getForecast = async (city) => {
	const baseUrl = `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${city}&days=3&aqi=yes&alerts=yes`;
	const res = await fetch(baseUrl);
	const data = await res.json();

	return data;
};

const getWeather = async (query) => {
	const baseUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${accuKey}&q=${query}`;
	const res = await fetch(baseUrl);
	const keyData = await res.json();

	cityName = keyData[0].EnglishName;

	countryName = keyData[0].Country.EnglishName;

	const key = keyData[0].Key;

	const weatherResults = await fetch(
		`http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${key}?apikey=${accuKey}&details=true&metric=true`
	);

	const data = await weatherResults.json();
	const weatherData = data.slice(0, 5);

	return weatherData;
};

function reverseInsertHtml(html) {}

const formatWeather = (data, timeString) => {
	// Get location info ✔

	const {
		WeatherIcon: icon,
		Temperature: { Value: temp },
		RealFeelTemperature: { Value: realFeel },
		Wind: {
			Speed: { Value: windSpeed },
			Direction: { Degrees: windDegree },
		},
		UVIndex: uvIndex,
		UVIndexText: uvText,
		RainProbability: rainChance,
		IsDaylight: isDay,
	} = data[0];

	console.log(isDay);
	// Check if its night and change background
	if (!isDay) {
		bgContainer.classList.add('night');
		gsap.to('.night', {
			opacity: 1,
			duration: 2,
		});
	} else {
		bgContainer.classList.add('day');
		gsap.to('.day', {
			opacity: 1,
			duration: 2,
		});
	}

	// Create html template to insert in container ❌
	const html = `
	<div class="data">
		<img src="./icons/pin.svg" alt="pin" class="data-pin" />
		<div class="data-name-container">
			<p class="data-name">${cityName}</p>
		</div>
	</div>
	<h4 class="date">${timeString}</h4>

	<div class="weather-data">
		<div class="weather-data--left">
			<h1>${Math.floor(temp)}°</h1>
		</div>

		<div class="weather-data--right">
			<img
				class="weather-data--right-icon"
				src="./acuicons/icons/${icon}.svg"
				alt=""
			/>
			<p class="weather-data--right-text">Feels like ${Math.floor(realFeel)}°</p>
		</div>
	</div>
	`;

	// Animations

	// Insert html template in container ✔
	container.innerHTML = html;

	let master = gsap.timeline({
		paused: true,
		onReverseComplete: reverseInsertHtml(html),
	});
	master
		.fromTo('.data', { translateX: '-30rem' }, { translateX: 0, duration: 0.7 })
		.to('.date', {
			opacity: 1,
			duration: 1,
			ease: 'ease',
		})
		.fromTo('.date', { translateX: '-30rem' }, { translateX: 0, duration: 1 })
		.to('.weather-data--left', {
			opacity: 1,
			duration: 0.5,
			ease: 'ease',
		})
		.fromTo(
			'.weather-data--left',
			{ translateX: '-30rem' },
			{ translateX: 0, duration: 0.9, ease: 'expo' }
		)
		.to('.weather-data--right', {
			opacity: 1,
			duration: 0.9,
			ease: 'slow',
		});

	if (container.classList.contains('active')) {
		container.classList.remove('active');
		master.timeScale(12).reverse(0);
		setTimeout(() => {
			master.timeScale(2).play();
			container.classList.add('active');
		}, 4000);
	} else {
		container.classList.add('active');

		master.play();
	}
};

const formatForecast = (forecastData, time) => {
	// Reset forcast drawer content

	forecastDrawer.innerHTML = '';

	// Get location info ✔

	for (day in forecastData) {
		const {
			WeatherIcon: icon,
			DateTime: time,
			Temperature: { Value: temp },
			RealFeelTemperature: { Value: realFeel },
		} = forecastData[day];

		const [date, timeTemp] = time.split('T');
		const currentTime = timeTemp.slice(0, timeTemp.indexOf(':'));

		// Create html template to insert in container ❌
		const html = `
		<div class="card">
			<img src="./acuicons/icons/${icon}.svg" alt="icon" class="center-img" />
			<p class="secondary margin-buttom">
				${currentTime}:00
			</p>
			<div class="card-temp">
				<h2>${Math.floor(temp)}°</h2>
			</div>
		</div>
		`;

		// // Insert html template in container ✔
		forecastDrawer.insertAdjacentHTML('beforeend', html);
	}
	let masterForcast = gsap.timeline({ paused: true, delay: 4 });
	masterForcast
		.fromTo(
			'.forecast-drawer',
			{ translateY: '40rem' },
			{ translateY: 0, duration: 0.9, ease: 'expo' }
		)
		.fromTo(
			'.card',
			{ translateY: '40rem' },
			{ translateY: 0, duration: 0.9, ease: 'expo' }
		);

	if (forecastDrawer.classList.contains('active')) {
		forecastDrawer.classList.remove('active');
		masterForcast.timeScale(1).delay(10).reverse(0);

		setTimeout(() => {
			masterForcast.play();
		}, 5000);
	} else {
		forecastDrawer.classList.add('active');
		masterForcast.play();
	}
};

// Btn submit event
form.addEventListener('submit', (e) => {
	// Prevent default
	e.preventDefault();

	// Get query
	const query = cityValue.value.trim();
	console.log(query);

	// Reset form
	form.reset();

	// Get current time to display ❌
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	const days = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];

	date = new Date();
	const time = {
		hours: date.getHours(),
		minutes: date.getMinutes(),
	};
	const day = date.getDate();
	const monthName = months[date.getMonth()];

	const dayName = days[date.getDay()];

	let timeString = `${dayName}, ${monthName} ${day} ${time.hours}:${
		time.minutes >= 10 ? time.minutes : '0' + time.minutes
	}`;

	// ! Uncomment in production
	getWeather(query)
		.then((data) => {
			formatWeather(data, timeString);
			const forecastData = data.slice(1, 5);
			formatForecast(forecastData, time);
		})
		.catch((err) => alert(err));

	// Make better error handling ❌
});
